import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { tasks, taskSubmissions } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { recordEvent } from "@/lib/activity";
import { getProjectSettings } from "@/lib/project-settings";
import { reviseTask } from "@/lib/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const schema = z.object({
  action: z.enum(["approve", "changes"]),
  notes: z.string().max(2000).optional(),
});

// Admin-only human-in-the-loop review of a submitted task. Approve -> done
// (unblocks dependents). Request changes -> back to in_progress.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const approve = parsed.data.action === "approve";

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status: approve ? "done" : "in_progress",
        reviewedBy: user.id,
        reviewNotes: parsed.data.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning({ projectId: tasks.projectId, title: tasks.title });

    if (updatedTask) {
      await recordEvent({
        projectId: updatedTask.projectId,
        actorId: user.id,
        kind: "task_reviewed",
        summary: `${approve ? "Approved" : "Requested changes on"} "${updatedTask.title}"`,
      });
    }

    // Settle the latest pending submission, if any.
    const [latest] = await db
      .select({ id: taskSubmissions.id })
      .from(taskSubmissions)
      .where(eq(taskSubmissions.taskId, id))
      .orderBy(desc(taskSubmissions.createdAt))
      .limit(1);
    if (latest) {
      await db
        .update(taskSubmissions)
        .set({
          status: approve ? "approved" : "changes_requested",
          reviewedBy: user.id,
          reviewNotes: parsed.data.notes ?? null,
        })
        .where(eq(taskSubmissions.id, latest.id));
    }

    // Self-healing: in autonomous mode, the agent reads the feedback and
    // redrafts immediately (still landing in review — never auto-approved).
    // Best-effort and gated; the review itself has already succeeded.
    let autoRevised = false;
    if (!approve && updatedTask && process.env.OPENAI_API_KEY) {
      try {
        const settings = await getProjectSettings(updatedTask.projectId);
        if (settings.autonomyLevel === "autonomous") {
          const r = await reviseTask(id, user.id);
          autoRevised = !!r;
        }
      } catch (e) {
        console.error("auto-revise failed", e instanceof Error ? e.message : e);
      }
    }

    return NextResponse.json({ ok: true, autoRevised });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
