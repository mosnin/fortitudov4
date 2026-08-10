import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  CrmPageHeader,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { LaunchPipeline } from "@/components/dashboard/launch-pipeline";
import { getLaunchPipeline } from "@/components/dashboard/launch-pipeline-data";
import { PerformanceOverview } from "@/components/dashboard/performance-overview";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/dashboard/project-list";
import { db } from "@/db";
import {
  projects,
  projectPhases,
  messages,
  files,
  users,
  agencyClients,
  weeklyReports,
} from "@/db/schema";
import { eq, count, inArray } from "drizzle-orm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
} from "@/lib/typography";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  // Get the DB user
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id));

  if (!dbUser) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={READING_COL}>
          <CrmPageHeader
            section="Workspace."
            title={`Welcome, ${user.firstName || "there"}`}
            subtitle="Your account is still being set up — refresh in a moment."
          />
        </div>
      </div>
    );
  }

  // The client portal is a personal surface: only the signed-in user's own
  // projects, regardless of role. Staff manage all client work in /admin
  // (properly scoped there) — this never exposes other clients' projects.
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, dbUser.id));

  const activeProjects = userProjects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );

  // Fetch phases for active projects
  const projectIds = activeProjects.map((p) => p.id);
  const allPhases =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, projectIds))
      : [];

  // Count messages across all user projects
  const allProjectIds = userProjects.map((p) => p.id);
  const messageCount =
    allProjectIds.length > 0
      ? (
          await db
            .select({ value: count() })
            .from(messages)
            .where(inArray(messages.projectId, allProjectIds))
        )[0]?.value ?? 0
      : 0;

  // Count files across all user projects
  const fileCount =
    allProjectIds.length > 0
      ? (
          await db
            .select({ value: count() })
            .from(files)
            .where(inArray(files.projectId, allProjectIds))
        )[0]?.value ?? 0
      : 0;

  // Delivery pipeline — the client's roster progress (transparency mirror of
  // the admin Client CRM). Null until the team creates their record.
  const pipeline = await getLaunchPipeline(dbUser.id);

  // Weekly reports are a DIGITAL MARKETING artifact — leads, cost per lead,
  // spend, return on spend. A websites/software/AI/consultation client never
  // gets one, so the marketing band is only mounted when this client actually
  // has reports; everyone else leads with their build.
  const [reported] = await db
    .select({ id: weeklyReports.id })
    .from(weeklyReports)
    .innerJoin(agencyClients, eq(weeklyReports.clientId, agencyClients.id))
    .where(eq(agencyClients.userId, dbUser.id))
    .limit(1);
  const hasMarketingReports = Boolean(reported);

  const listItems: ProjectListItem[] = activeProjects.map((project) => ({
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

  // One sentence of status — where the work actually stands right now.
  const active = activeProjects.length;
  const status =
    active === 0
      ? userProjects.length > 0
        ? "Nothing in flight — every project has wrapped."
        : "Nothing in flight yet — start a project when you're ready."
      : `${active === 1 ? "One build" : `${active} builds`} in flight${
          pipeline ? `, currently in ${pipeline.stageLabel.toLowerCase()}` : ""
        }.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title={`Welcome back, ${user.firstName || "there"}`}
          subtitle={status}
          action={
            <Link href="/onboarding" className={PRIMARY_PILL}>
              New project
            </Link>
          }
        />

        <StatStrip ariaLabel="Workspace summary">
          <StatCell label="Active projects">
            {active > 0 ? (
              <Stat>{active.toLocaleString("en-US")}</Stat>
            ) : (
              <StatEmpty>no projects yet.</StatEmpty>
            )}
            {userProjects.length > 0 && (
              <StatMeta>
                {userProjects.length.toLocaleString("en-US")} in total
              </StatMeta>
            )}
          </StatCell>

          <StatCell label="Messages">
            {messageCount > 0 ? (
              <Stat>{messageCount.toLocaleString("en-US")}</Stat>
            ) : (
              <StatEmpty>no messages yet.</StatEmpty>
            )}
          </StatCell>

          <StatCell label="Files uploaded">
            {fileCount > 0 ? (
              <Stat>{fileCount.toLocaleString("en-US")}</Stat>
            ) : (
              <StatEmpty>nothing uploaded yet.</StatEmpty>
            )}
          </StatCell>
        </StatStrip>

        {/* Delivery pipeline — hidden until the team creates a roster record. */}
        <LaunchPipeline data={pipeline} />

        {/* Marketing results — digital-marketing engagements only. */}
        {hasMarketingReports && <PerformanceOverview />}

        {/* Active projects */}
        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>Active projects</p>
          {activeProjects.length === 0 ? (
            <div className="border-t border-border py-10">
              <p className="text-sm font-medium text-foreground">
                No active projects yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start a new project and we&rsquo;ll track your progress right
                here.
              </p>
              <Link href="/onboarding" className={cn(PRIMARY_PILL, "mt-5")}>
                New project
              </Link>
            </div>
          ) : (
            <ProjectList projects={listItems} showQuickActions />
          )}
        </section>
      </div>
    </div>
  );
}
