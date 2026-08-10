import Link from "next/link";
import { PageHero } from "@/components/ui/firecrawl";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { projects, users, projectPhases } from "@/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";
import { getAuthenticatedUser, getAccessibleProjectIds } from "@/lib/auth-utils";
import { canManageProjects } from "@/lib/permissions";
import { services } from "@/lib/services";
import {
  BODY_MUTED,
  H3,
  PAGE_RHYTHM,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
} from "@/lib/typography";
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
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Operations"
          title="Projects"
          description="Manage all client projects and update phases."
        />

        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>{rows.length} projects</p>
          {rows.length === 0 ? (
            <div className="py-14 text-center">
              <h2 className={H3}>No projects yet</h2>
              <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
                Client projects will appear here once they&apos;re created.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {rows.map((project) => {
                const clientName =
                  [project.clientFirstName, project.clientLastName]
                    .filter(Boolean)
                    .join(" ") ||
                  project.clientEmail ||
                  "—";
                const phase = phaseMap.get(project.id);
                return (
                  <li
                    key={project.id}
                    className="group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {project.name}
                        </span>
                        <span className={STATUS_PILL}>
                          {statusLabels[project.status] || project.status}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {clientName} ·{" "}
                        {serviceLabels[project.serviceType] ||
                          project.serviceType}
                        {phase ? ` · ${phase}` : ""}
                      </div>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      aria-label={`Manage ${project.name}`}
                      className={cn(QUIET_LINK, "shrink-0")}
                    >
                      Manage
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Weekly reporting loop — agency side of client performance reports */}
        <WeeklyReportsSection canManage={canManage} />
      </div>
    </div>
  );
}
