import {
  CrmPageHeader,
  RecordList,
  RecordRow,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatStrip,
} from "@/components/crm";
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
  READING_COL,
  SECTION_RHYTHM,
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

  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const completed = rows.filter((r) => r.status === "completed").length;
  const subtitle =
    rows.length === 0
      ? "No projects on the books yet."
      : `${rows.length} on the books, ${inProgress} actively in build.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Operations."
          title="Projects"
          subtitle={subtitle}
        />

        <StatStrip columns={3} ariaLabel="Project totals">
          <StatCell label="Projects">
            {rows.length > 0 ? (
              <Stat>{rows.length}</Stat>
            ) : (
              <StatEmpty>Nothing on the books yet.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="In build">
            {inProgress > 0 ? (
              <Stat>{inProgress}</Stat>
            ) : (
              <StatEmpty>Nothing in build right now.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="Completed">
            {completed > 0 ? (
              <Stat>{completed}</Stat>
            ) : (
              <StatEmpty>No deliveries signed off yet.</StatEmpty>
            )}
          </StatCell>
        </StatStrip>

        <section className={SECTION_RHYTHM}>
          {rows.length === 0 ? (
            <div className="py-14 text-center">
              <h2 className={H3}>No projects yet</h2>
              <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
                Client projects will appear here once they&apos;re created.
              </p>
            </div>
          ) : (
            <RecordList>
              {rows.map((project, i) => {
                const clientName =
                  [project.clientFirstName, project.clientLastName]
                    .filter(Boolean)
                    .join(" ") ||
                  project.clientEmail ||
                  "—";
                const phase = phaseMap.get(project.id);
                return (
                  <RecordRow
                    key={project.id}
                    index={i}
                    href={`/admin/projects/${project.id}`}
                    primary={project.name}
                    status={
                      <RowPill>
                        {statusLabels[project.status] || project.status}
                      </RowPill>
                    }
                    secondary={[
                      clientName,
                      serviceLabels[project.serviceType] || project.serviceType,
                      phase,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                );
              })}
            </RecordList>
          )}
        </section>

        {/* Weekly reporting loop — agency side of client performance reports */}
        <WeeklyReportsSection canManage={canManage} />
      </div>
    </div>
  );
}
