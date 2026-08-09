import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/firecrawl";
import { EmptyState } from "@/components/ui/empty-state";
import { AsciiField } from "@/components/ui/ascii-field";
import { LaunchPipeline } from "@/components/dashboard/launch-pipeline";
import { getLaunchPipeline } from "@/components/dashboard/launch-pipeline-data";
import { PerformanceOverview } from "@/components/dashboard/performance-overview";
import {
  ProjectList,
  type ProjectListItem,
} from "@/components/dashboard/project-list";
import { FolderKanban, Plus } from "lucide-react";
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
      <div className="space-y-8">
        <PageHero
          title={`Welcome, ${user.firstName || "there"}`}
          description="Your account is being set up. Please refresh in a moment."
        />
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
    { label: "Active Projects", value: activeProjects.length },
    { label: "Messages", value: messageCount },
    { label: "Files Uploaded", value: fileCount },
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
    <div className="space-y-10">
      {/* Welcome */}
      <PageHero
        title="Dashboard"
        description={`Welcome back, ${user.firstName || "there"} — track your ${
          hasMarketingReports ? "builds, files, and results" : "builds and files"
        } in one place.`}
        action={
          <Button asChild>
            <Link href="/onboarding">
              <Plus className="mr-1 h-4 w-4" />
              New Project
            </Link>
          </Button>
        }
      />

      {/* Delivery pipeline — hidden until the team creates a roster record. */}
      <LaunchPipeline data={pipeline} />

      {/* Marketing results — digital-marketing engagements only. */}
      {hasMarketingReports && <PerformanceOverview />}

      {/* Stats — hairline-divided 3-up, big numerals */}
      <div className="animate-fade-up grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="py-6 sm:px-8 sm:first:pl-0">
            <p className="text-4xl font-bold tracking-tight">
              {stat.value.toLocaleString("en-US")}
            </p>
            <p className="micro-label mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Projects */}
      {activeProjects.length === 0 ? (
        <div className="animate-fade-up relative overflow-hidden rounded-xl border border-border">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 70%)",
            }}
          >
            <AsciiField className="h-full w-full opacity-40" />
          </div>
          <div className="relative">
            <EmptyState
              icon={FolderKanban}
              title="No active projects yet"
              description="Start a new project and we'll track your progress right here."
              action={
                <Button asChild>
                  <Link href="/onboarding">
                    <Plus className="mr-1 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <ProjectList projects={listItems} showQuickActions />
      )}
    </div>
  );
}
