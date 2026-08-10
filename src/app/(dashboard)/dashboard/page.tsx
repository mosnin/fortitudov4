import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { PageHero } from "@/components/ui/firecrawl";
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
          <PageHero
            section="Workspace"
            title={`Welcome, ${user.firstName || "there"}`}
            description="Your account is being set up. Please refresh in a moment."
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

  const stats = [
    { label: "Active projects", value: activeProjects.length },
    { label: "Messages", value: messageCount },
    { label: "Files uploaded", value: fileCount },
  ];

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

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Workspace"
          title="Dashboard"
          description={`Welcome back, ${user.firstName || "there"} — track your ${
            hasMarketingReports ? "builds, files, and results" : "builds and files"
          } in one place.`}
          action={
            <Link href="/onboarding" className={PRIMARY_PILL}>
              New project
            </Link>
          }
        />

        {/* Stats — hairline-divided 3-up */}
        <div className="animate-fade-up grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="py-5 sm:px-6 sm:first:pl-0">
              <p className="text-2xl tracking-tight tabular-nums text-foreground">
                {stat.value.toLocaleString("en-US")}
              </p>
              <p className={cn(SECTION_LABEL, "mt-1.5")}>{stat.label}</p>
            </div>
          ))}
        </div>

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
