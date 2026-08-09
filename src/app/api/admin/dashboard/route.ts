import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, revisionRequests, tasks, users } from "@/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { requireStaff } from "@/lib/auth-utils";

/**
 * GET /api/admin/dashboard — the operational admin overview. Staff-only.
 * Non-financial: project roster counts, a 6-month new-projects trend, a
 * pipeline snapshot (projects by status), and the open high-priority task
 * queue across every project. The agency P&L stays on the Financials tab.
 */

const MONTHS_SHOWN = 6;

const ACTIVE_STATUSES = new Set([
  "onboarding",
  "payment_pending",
  "in_progress",
  "revision",
]);

const PIPELINE: { status: string; label: string }[] = [
  { status: "onboarding", label: "Onboarding" },
  { status: "payment_pending", label: "Payment Pending" },
  { status: "in_progress", label: "In Progress" },
  { status: "revision", label: "Revision" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
];

export async function GET() {
  try {
    await requireStaff();

    const [projectRows, revisionRows, highTasks] = await Promise.all([
      db
        .select({
          status: projects.status,
          createdAt: projects.createdAt,
        })
        .from(projects),
      db
        .select({ status: revisionRequests.status })
        .from(revisionRequests),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          priority: tasks.priority,
          createdAt: tasks.createdAt,
          projectName: projects.name,
          assigneeFirst: users.firstName,
          assigneeEmail: users.email,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(and(eq(tasks.priority, "high"), ne(tasks.status, "done")))
        .orderBy(desc(tasks.createdAt))
        .limit(50),
    ]);

    const activeProjects = projectRows.filter((p) =>
      ACTIVE_STATUSES.has(p.status)
    ).length;
    const pendingRevisions = revisionRows.filter(
      (r) => r.status === "pending"
    ).length;

    // Pipeline snapshot — one row per status, fixed order.
    const statusCounts = new Map<string, number>();
    for (const p of projectRows) {
      statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
    }
    const pipeline = PIPELINE.map((s) => ({
      status: s.status,
      label: s.label,
      count: statusCounts.get(s.status) ?? 0,
    }));

    // Trailing month buckets, oldest → newest.
    const now = new Date();
    const buckets = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1 - i), 1)
      );
      return {
        key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
      };
    });
    const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
    const newProjectsSeries = buckets.map(() => 0);
    for (const p of projectRows) {
      const d = new Date(p.createdAt);
      const i = bucketIndex.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
      if (i !== undefined) newProjectsSeries[i]++;
    }

    const highPriorityTasks = highTasks.map((t) => ({
      id: t.id,
      title: t.title,
      projectName: t.projectName ?? "—",
      assigneeName: t.assigneeFirst || t.assigneeEmail?.split("@")[0] || "Unassigned",
      priority: t.priority,
    }));

    return NextResponse.json({
      activeProjects,
      pendingRevisions,
      highPriorityTaskCount: highPriorityTasks.length,
      months: buckets.map((b) => b.label),
      newProjectsSeries,
      pipeline,
      highPriorityTasks: highPriorityTasks.slice(0, 8),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
