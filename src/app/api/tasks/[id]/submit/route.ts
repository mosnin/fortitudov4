import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks, taskSubmissions } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  summary: z.string().min(1).max(4000),
  artifactUrl: z.string().url().max(1000).optional(),
});

// The assignee (or any staff) submits work for review. Lands the task in
// in_review — only an admin can mark it done (human-in-the-loop).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // The assignee submits their own work; admins may submit on anyone's behalf.
    if (user.role !== "admin" && task.assigneeId !== user.id) {
      return NextResponse.json({ error: "That task isn't assigned to you." }, { status: 403 });
    }

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "A summary is required" }, { status: 400 });

    await db.insert(taskSubmissions).values({
      taskId: id,
      submittedBy: user.id,
      summary: parsed.data.summary,
      artifactUrl: parsed.data.artifactUrl ?? null,
    });

    await db
      .update(tasks)
      .set({ status: "in_review", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(tasks.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
