import { db } from "@/db";
import { tasks, projects, taskDependencies } from "@/db/schema";
import { eq, and, ne, asc, inArray } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { AdminMast } from "@/components/admin/ascii-table";
import { MyTasks } from "@/components/dashboard/my-tasks";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const me = await getOrCreateCurrentUser();
  if (!me) return null;

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      projectId: tasks.projectId,
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.assigneeId, me.id), ne(tasks.status, "done")))
    .orderBy(asc(tasks.order));

  // Compute readiness from the dependency graph.
  const ids = rows.map((r) => r.id);
  const blockedBy = new Map<string, string[]>();
  if (ids.length) {
    const deps = await db.select().from(taskDependencies).where(inArray(taskDependencies.taskId, ids));
    const depIds = [...new Set(deps.map((d) => d.dependsOnTaskId))];
    const depTasks = depIds.length
      ? await db
          .select({ id: tasks.id, title: tasks.title, status: tasks.status })
          .from(tasks)
          .where(inArray(tasks.id, depIds))
      : [];
    const byId = new Map(depTasks.map((d) => [d.id, d]));
    for (const d of deps) {
      const dep = byId.get(d.dependsOnTaskId);
      if (dep && dep.status !== "done") {
        const arr = blockedBy.get(d.taskId) ?? [];
        arr.push(dep.title);
        blockedBy.set(d.taskId, arr);
      }
    }
  }

  return (
    <div className="space-y-5">
      <AdminMast eyebrow="My queue" title="Tasks assigned to you" subtitle="Start, work, and submit each for review." />
      <MyTasks
        tasks={rows.map((r) => ({
          ...r,
          projectName: r.projectName ?? "—",
          blockedBy: blockedBy.get(r.id) ?? [],
          ready: !(blockedBy.get(r.id)?.length),
        }))}
      />
    </div>
  );
}
