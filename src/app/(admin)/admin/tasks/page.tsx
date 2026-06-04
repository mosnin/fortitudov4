import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
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

  return (
    <div className="space-y-5">
      <AdminMast eyebrow="My queue" title="Tasks assigned to you" subtitle="Advance each as you work it." />
      <MyTasks tasks={rows.map((r) => ({ ...r, projectName: r.projectName ?? "—" }))} />
    </div>
  );
}
