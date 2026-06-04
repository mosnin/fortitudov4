import "server-only";
import { eq, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { tasks, taskDependencies } from "@/db/schema";

export type GraphTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  kind: string;
  estimateHours: number | null;
  assigneeId: string | null;
  phaseId: string | null;
  acceptanceCriteria: string | null;
  ready: boolean;
  blockedBy: string[]; // titles of unfinished dependencies
};

/** A project's tasks with computed readiness from the dependency graph. */
export async function getTaskGraph(projectId: string): Promise<GraphTask[]> {
  const ts = await db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(asc(tasks.order));
  if (ts.length === 0) return [];

  const ids = ts.map((t) => t.id);
  const deps = await db
    .select()
    .from(taskDependencies)
    .where(inArray(taskDependencies.taskId, ids));

  const doneSet = new Set(ts.filter((t) => t.status === "done").map((t) => t.id));
  const titleById = new Map(ts.map((t) => [t.id, t.title]));
  const blockedBy = new Map<string, string[]>();
  for (const d of deps) {
    if (!doneSet.has(d.dependsOnTaskId)) {
      const arr = blockedBy.get(d.taskId) ?? [];
      arr.push(titleById.get(d.dependsOnTaskId) ?? "a task");
      blockedBy.set(d.taskId, arr);
    }
  }

  return ts.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    kind: t.kind,
    estimateHours: t.estimateHours,
    assigneeId: t.assigneeId,
    phaseId: t.phaseId,
    acceptanceCriteria: t.acceptanceCriteria,
    ready: !(blockedBy.get(t.id)?.length),
    blockedBy: blockedBy.get(t.id) ?? [],
  }));
}

export type PhaseRollup = { done: number; total: number; pct: number };

/**
 * Roll task completion up to phases + the whole project — drives the client's
 * live roadmap. Returns a plain (serializable) shape.
 */
export async function getProjectProgress(projectId: string): Promise<{
  byPhase: Record<string, PhaseRollup>;
  overall: PhaseRollup;
}> {
  const ts = await db
    .select({ phaseId: tasks.phaseId, status: tasks.status })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const byPhase: Record<string, PhaseRollup> = {};
  let total = 0;
  let done = 0;
  for (const t of ts) {
    total++;
    const isDone = t.status === "done";
    if (isDone) done++;
    if (t.phaseId) {
      const e = (byPhase[t.phaseId] ??= { done: 0, total: 0, pct: 0 });
      e.total++;
      if (isDone) e.done++;
    }
  }
  for (const e of Object.values(byPhase)) e.pct = e.total ? Math.round((e.done / e.total) * 100) : 0;

  return { byPhase, overall: { done, total, pct: total ? Math.round((done / total) * 100) : 0 } };
}
