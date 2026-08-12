import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  CrmPageHeader,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/dashboard/project-list";
import { EmptyState } from "@/components/ui/empty-state";
import { db } from "@/db";
import { projects, projectPhases, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
} from "@/lib/typography";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!dbUser) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={READING_COL}>
          <CrmPageHeader
            section="Workspace."
            title="Projects"
            subtitle="Your account is still being set up — refresh in a moment."
          />
        </div>
      </div>
    );
  }

  // Personal client surface — only the user's own projects (see dashboard).
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, dbUser.id));

  const projectIds = userProjects.map((p) => p.id);
  const allPhases =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, projectIds))
      : [];

  const listItems: ProjectListItem[] = userProjects.map((project) => ({
    id: project.id,
    name: project.name,
    serviceType: project.serviceType,
    status: project.status,
    phases: allPhases
      .filter((p) => p.projectId === project.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        order: p.order,
      })),
  }));

  const active = userProjects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  ).length;
  const shipped = userProjects.filter((p) => p.status === "completed").length;
  const phasesDone = allPhases.filter((p) => p.status === "completed").length;

  const status =
    userProjects.length === 0
      ? "Nothing here yet — your first build starts with onboarding."
      : active === 0
        ? "Everything has shipped; nothing is in flight."
        : `${active === 1 ? "One build" : `${active} builds`} in flight${
            shipped > 0
              ? `, ${shipped} already shipped`
              : ""
          }.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title="Projects"
          subtitle={status}
          action={
            <Link href="/onboarding" className={PRIMARY_PILL}>
              New project
            </Link>
          }
        />

        <StatStrip ariaLabel="Project summary">
          <StatCell label="Projects">
            {userProjects.length > 0 ? (
              <Stat>{userProjects.length.toLocaleString("en-US")}</Stat>
            ) : (
              <StatEmpty>no projects yet.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="In flight">
            {active > 0 ? (
              <Stat>{active.toLocaleString("en-US")}</Stat>
            ) : (
              <StatEmpty>nothing in flight.</StatEmpty>
            )}
            {shipped > 0 && (
              <StatMeta>{shipped.toLocaleString("en-US")} shipped</StatMeta>
            )}
          </StatCell>
          <StatCell label="Phases complete">
            {allPhases.length > 0 ? (
              <Stat suffix={`of ${allPhases.length}`}>
                {phasesDone.toLocaleString("en-US")}
              </Stat>
            ) : (
              <StatEmpty>phases start at kickoff.</StatEmpty>
            )}
          </StatCell>
        </StatStrip>

        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>All projects</p>
          {userProjects.length === 0 ? (
            <EmptyState
              className="border-t border-border/60"
              title="No projects yet"
              description="Start your first project and we’ll build something great together."
              action={
                <Link href="/onboarding" className={PRIMARY_PILL}>
                  New project
                </Link>
              }
            />
          ) : (
            <ProjectList projects={listItems} />
          )}
        </section>
      </div>
    </div>
  );
}
