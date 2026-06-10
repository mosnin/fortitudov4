import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
});

function isStaff(role: string) {
  return role === "admin" || role === "team";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!isStaff(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Admins have full control (assign, retitle, any status — the human in the
    // loop). Team members may only act on their own tasks, and only to Start
    // them (todo → in_progress). Reassigning, retitling, and marking
    // done/in_review/cancelled stay with admins so review can't be bypassed.
    if (user.role !== "admin") {
      if (task.assigneeId !== user.id) {
        return NextResponse.json({ error: "That task isn't assigned to you." }, { status: 403 });
      }
      const onlyStarting =
        parsed.data.assigneeId === undefined &&
        parsed.data.title === undefined &&
        parsed.data.status === "in_progress" &&
        task.status === "todo";
      if (!onlyStarting) {
        return NextResponse.json({ error: "You can only start your assigned tasks." }, { status: 403 });
      }
    }

    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.status !== undefined) set.status = parsed.data.status;
    if (parsed.data.assigneeId !== undefined) set.assigneeId = parsed.data.assigneeId;
    if (parsed.data.title !== undefined) set.title = parsed.data.title;

    await db.update(tasks).set(set).where(eq(tasks.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    // Deleting work from the graph is an admin action only.
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
