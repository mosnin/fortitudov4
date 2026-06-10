import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { tasks, taskSubmissions } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Staff read a task's submissions — so a reviewer can actually see the draft
// they're approving. Team members are scoped to their own assigned tasks.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "team") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (user.role !== "admin" && task.assigneeId !== user.id) {
      return NextResponse.json({ error: "That task isn't assigned to you." }, { status: 403 });
    }

    const subs = await db
      .select({
        id: taskSubmissions.id,
        summary: taskSubmissions.summary,
        artifactUrl: taskSubmissions.artifactUrl,
        status: taskSubmissions.status,
        reviewNotes: taskSubmissions.reviewNotes,
        createdAt: taskSubmissions.createdAt,
      })
      .from(taskSubmissions)
      .where(eq(taskSubmissions.taskId, id))
      .orderBy(desc(taskSubmissions.createdAt))
      .limit(10);

    return NextResponse.json(subs);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
