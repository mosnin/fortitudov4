import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { projects, users, projectPhases } from "@/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";
import { getAuthenticatedUser, getAccessibleProjectIds } from "@/lib/auth-utils";
import { canManageProjects } from "@/lib/permissions";
import { services } from "@/lib/services";
import { WeeklyReportsSection } from "./weekly-reports-section";

const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Status semantics as uppercase mono text — orange stays rare (active only).
const statusClass: Record<string, string> = {
  onboarding: "text-muted-foreground",
  payment_pending: "text-warning",
  in_progress: "text-brand",
  revision: "text-warning",
  completed: "text-success",
  cancelled: "text-muted-foreground",
};

export default async function AdminProjectsPage() {
  const user = await getAuthenticatedUser();
  const accessible = await getAccessibleProjectIds(user.id, user.role);
  const canManage = canManageProjects(user.role);

  // VAs with no assigned projects get an empty array — nothing to show.
  const hasScope = accessible === "all" || accessible.length > 0;

  const rows = hasScope
    ? await db
        .select({
          id: projects.id,
          name: projects.name,
          serviceType: projects.serviceType,
          status: projects.status,
          clientFirstName: users.firstName,
          clientLastName: users.lastName,
          clientEmail: users.email,
        })
        .from(projects)
        .leftJoin(users, eq(projects.userId, users.id))
        .where(
          accessible === "all" ? undefined : inArray(projects.id, accessible)
        )
        .orderBy(desc(projects.createdAt))
    : [];

  // Fetch the in-progress phase for each listed project (one query, then map).
  const phaseMap = new Map<string, string>();
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const activePhases = await db
      .select({
        projectId: projectPhases.projectId,
        name: projectPhases.name,
      })
      .from(projectPhases)
      .where(
        and(
          inArray(projectPhases.projectId, ids),
          eq(projectPhases.status, "in_progress")
        )
      );
    for (const p of activePhases) {
      if (!phaseMap.has(p.projectId)) phaseMap.set(p.projectId, p.name);
    }
  }

  return (
    <div className="space-y-10">
      {/* Header band */}
      <header className="border-b border-border pb-6">
        <p className="eyebrow-mono">Fortitudo · Admin</p>
        <h1 className="font-title mt-2 text-3xl tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage all client projects and update phases.
        </p>
      </header>

      <section>
        <p className="bracket-label pb-4">
          [ <b>{rows.length}</b> ] · ALL PROJECTS
        </p>
        {rows.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Client projects will appear here once they're created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="micro-label py-3 pr-4">Project</th>
                  <th className="micro-label py-3 pr-4">Client</th>
                  <th className="micro-label py-3 pr-4">Service</th>
                  <th className="micro-label py-3 pr-4">Phase</th>
                  <th className="micro-label py-3 pr-4">Status</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((project) => {
                  const clientName =
                    [project.clientFirstName, project.clientLastName]
                      .filter(Boolean)
                      .join(" ") ||
                    project.clientEmail ||
                    "—";
                  return (
                    <tr
                      key={project.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      <td className="py-3 pr-4 font-medium">{project.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {clientName}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {serviceLabels[project.serviceType] || project.serviceType}
                      </td>
                      <td className="py-3 pr-4">
                        {phaseMap.has(project.id) ? (
                          <span className="font-mono text-xs text-foreground">
                            {phaseMap.get(project.id)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "font-mono text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
                            statusClass[project.status] ?? "text-muted-foreground"
                          )}
                        >
                          {statusLabels[project.status] || project.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          aria-label={`Manage ${project.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Weekly reporting loop — agency side of client performance reports */}
      <WeeklyReportsSection canManage={canManage} />
    </div>
  );
}
