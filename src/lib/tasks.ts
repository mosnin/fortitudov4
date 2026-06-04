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
