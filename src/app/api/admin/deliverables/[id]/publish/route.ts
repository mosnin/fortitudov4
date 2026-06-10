import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deliverables } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { recordEvent } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only: publish a draft deliverable to the client (draft → pending review).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const [updated] = await db
      .update(deliverables)
      .set({ status: "pending", releasedAt: new Date() })
      .where(eq(deliverables.id, id))
      .returning({ id: deliverables.id, projectId: deliverables.projectId, title: deliverables.title });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await recordEvent({
      projectId: updated.projectId,
      actorId: user.id,
      kind: "deliverable_published",
      summary: `Published deliverable: ${updated.title}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
