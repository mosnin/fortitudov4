import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deliverables, projects, revisionRequests } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["approve", "request_changes"]),
  note: z.string().max(2000).optional(),
});

// Client (or admin) reviews a deliverable: approve, or request changes.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const [deliverable] = await db.select().from(deliverables).where(eq(deliverables.id, id));
    if (!deliverable) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [project] = await db.select().from(projects).where(eq(projects.id, deliverable.projectId));
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (project.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = parsed.data.action === "approve" ? "approved" : "changes_requested";

    await db
      .update(deliverables)
      .set({ status, reviewedAt: new Date(), clientNote: parsed.data.note ?? null })
      .where(eq(deliverables.id, id));

    // Requesting changes opens a revision so it flows into the existing pipeline.
    if (parsed.data.action === "request_changes") {
      await db.insert(revisionRequests).values({
        projectId: project.id,
        userId: user.id,
        description: parsed.data.note?.trim() || `Changes requested on "${deliverable.title}".`,
      });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
