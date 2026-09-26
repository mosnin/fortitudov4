import { currentUser } from "@clerk/nextjs/server";
import { CrmPageHeader } from "@/components/crm";
import {
  BuildHeroCard,
  HelixPromptCard,
  MiniList,
  PaidMeter,
  RecentBuildsCard,
  TonePill,
  WelcomeRow,
  WorkspaceCard,
  relativeTime,
  type BuildRow,
  type Tone,
} from "@/components/dashboard/build-overview";
import { LaunchPipeline } from "@/components/dashboard/launch-pipeline";
import { getLaunchPipeline } from "@/components/dashboard/launch-pipeline-data";
import { PerformanceOverview } from "@/components/dashboard/performance-overview";
import { db } from "@/db";
import {
  projects,
  projectPhases,
  users,
  agencyClients,
  weeklyReports,
  payments,
  invoices,
  clientPayments,
  revisionRequests,
  files,
  messages,
} from "@/db/schema";
import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { PAGE_RHYTHM, READING_COL } from "@/lib/typography";

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

  // Newest first: the hero leads with the most recently touched active build,
  // the table lists the latest few of everything.
  const byRecent = [...userProjects].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const recent = byRecent.slice(0, 5);
  const lead = byRecent.find(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );

  // Phases for everything the page shows
  const projectIds = [
    ...new Set([...recent.map((p) => p.id), ...(lead ? [lead.id] : [])]),
  ];
  const allPhases =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, projectIds))
      : [];

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

  // ── Money: project payments (per-project billing) + retainer history
  // (agency roster). Same sources and paid-state rule as /payments.
  const PAID_STATES = ["paid", "succeeded", "completed", "settled"];
  const projectPayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      createdAt: payments.createdAt,
      projectName: projects.name,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(payments)
    .leftJoin(invoices, eq(invoices.paymentId, payments.id))
    .leftJoin(projects, eq(payments.projectId, projects.id))
    .where(eq(payments.userId, dbUser.id))
    .orderBy(desc(payments.createdAt));
  const retainerPaid = (
    await db
      .select({ amount: clientPayments.amount })
      .from(clientPayments)
      .innerJoin(agencyClients, eq(clientPayments.clientId, agencyClients.id))
      .where(eq(agencyClients.userId, dbUser.id))
  ).reduce((s, p) => s + p.amount, 0);
  const isPaid = (status: string) => PAID_STATES.includes(status.toLowerCase());
  const isVoid = (status: string) =>
    ["failed", "cancelled", "refunded"].includes(status.toLowerCase());
  const projectPaid = projectPayments
    .filter((p) => isPaid(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = projectPayments
    .filter((p) => !isPaid(p.status) && !isVoid(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const totalPaid = projectPaid + retainerPaid;

  // ── Revisions, assets and chat across every project the client owns.
  const allIds = userProjects.map((p) => p.id);
  const projectName = new Map(userProjects.map((p) => [p.id, p.name]));
  const [revisionRows, fileRows, fileTotal, messageRows, unreadFromTeam] =
    allIds.length === 0
      ? [[], [], 0, [], 0]
      : await Promise.all([
          db
            .select()
            .from(revisionRequests)
            .where(inArray(revisionRequests.projectId, allIds))
            .orderBy(desc(revisionRequests.updatedAt)),
          db
            .select()
            .from(files)
            .where(inArray(files.projectId, allIds))
            .orderBy(desc(files.createdAt))
            .limit(3),
          db
            .select({ value: count() })
            .from(files)
            .where(inArray(files.projectId, allIds))
            .then((r) => r[0]?.value ?? 0),
          db
            .select()
            .from(messages)
            .where(inArray(messages.projectId, allIds))
            .orderBy(desc(messages.createdAt))
            .limit(3),
          db
            .select({ value: count() })
            .from(messages)
            .where(
              and(
                inArray(messages.projectId, allIds),
                eq(messages.role, "admin"),
                eq(messages.read, false),
                ne(messages.senderId, dbUser.id)
              )
            )
            .then((r) => r[0]?.value ?? 0),
        ]);
  const openRevisions = revisionRows.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  ).length;
  const REVISION_TONE: Record<string, Tone> = {
    pending: "sky",
    in_progress: "brand",
    completed: "green",
    rejected: "muted",
  };
  const REVISION_LABEL: Record<string, string> = {
    pending: "Requested",
    in_progress: "In progress",
    completed: "Done",
    rejected: "Declined",
  };

  const toRow = (project: (typeof userProjects)[number]): BuildRow => ({
    id: project.id,
    name: project.name,
    serviceType: project.serviceType,
    status: project.status,
    createdAt: project.createdAt,
    phases: allPhases
      .filter((p) => p.projectId === project.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        order: p.order,
      })),
  });

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn("mx-auto w-full max-w-6xl", PAGE_RHYTHM)}>
        <WelcomeRow firstName={user.firstName || "there"} />

        <div className="grid gap-6 pt-4 lg:grid-cols-2 lg:pt-8">
          <BuildHeroCard
            activeCount={activeProjects.length}
            lead={lead ? toRow(lead) : undefined}
          />
          <HelixPromptCard />
        </div>

        <RecentBuildsCard
          builds={recent.map(toRow)}
          totalCount={userProjects.length}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <WorkspaceCard
            title="Invoices & payments"
            href="/payments"
            linkLabel="Billing"
            headline={formatUsd(totalPaid)}
            headlineMeta="paid to date"
          >
            <div className="space-y-4">
              {projectPayments.length > 0 && (
                <div className="space-y-1.5">
                  <PaidMeter paid={projectPaid} billed={projectPaid + outstanding} />
                  <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span>{formatUsd(projectPaid)} of {formatUsd(projectPaid + outstanding)} invoiced</span>
                    <span>{outstanding > 0 ? `${formatUsd(outstanding)} due` : "All settled"}</span>
                  </p>
                </div>
              )}
              <MiniList
                empty="No invoices yet. They land here once billing is set up."
                items={projectPayments.slice(0, 3).map((p) => ({
                  id: p.id,
                  href: "/payments",
                  primary: (
                    <>
                      <span className="tabular-nums">{formatUsd(p.amount)}</span>
                      <span className="text-muted-foreground"> · {p.invoiceNumber ?? p.projectName ?? "Payment"}</span>
                    </>
                  ),
                  meta: relativeTime(p.createdAt),
                  pill: (
                    <TonePill tone={isPaid(p.status) ? "green" : isVoid(p.status) ? "red" : "amber"}>
                      {isPaid(p.status) ? "Paid" : isVoid(p.status) ? p.status : "Due"}
                    </TonePill>
                  ),
                }))}
              />
            </div>
          </WorkspaceCard>

          <WorkspaceCard
            title="Revisions"
            href={lead ? `/projects/${lead.id}` : "/projects"}
            linkLabel="Request a change"
            headline={openRevisions}
            headlineMeta={openRevisions === 1 ? "open request" : "open requests"}
          >
            <MiniList
              empty="No revision requests yet."
              items={revisionRows.slice(0, 3).map((r) => ({
                id: r.id,
                href: `/projects/${r.projectId}`,
                primary: r.description,
                meta: `${projectName.get(r.projectId) ?? "Project"} · ${relativeTime(r.updatedAt)}`,
                pill: (
                  <TonePill tone={REVISION_TONE[r.status] ?? "muted"}>
                    {REVISION_LABEL[r.status] ?? r.status}
                  </TonePill>
                ),
              }))}
            />
          </WorkspaceCard>

          <WorkspaceCard
            title="Uploaded assets"
            href={lead ? `/projects/${lead.id}` : "/projects"}
            linkLabel="Upload"
            headline={fileTotal}
            headlineMeta={fileTotal === 1 ? "file shared" : "files shared"}
          >
            <MiniList
              empty="Nothing uploaded yet. Share logos, copy and brand files from a project."
              items={fileRows.map((f) => ({
                id: f.id,
                href: f.url,
                primary: f.name,
                meta: `${projectName.get(f.projectId) ?? "Project"} · ${relativeTime(f.createdAt)}`,
              }))}
            />
          </WorkspaceCard>

          <WorkspaceCard
            title="Messages"
            href="/messages"
            linkLabel="Open chat"
            headline={unreadFromTeam}
            headlineMeta="unread from the team"
          >
            <MiniList
              empty="No messages yet. Say hello to your team."
              items={messageRows.map((m) => ({
                id: m.id,
                href: "/messages",
                primary: m.content,
                meta: `${m.role === "admin" ? "Fortitudo team" : "You"} · ${projectName.get(m.projectId) ?? "Project"} · ${relativeTime(m.createdAt)}`,
              }))}
            />
          </WorkspaceCard>
        </div>

        {/* Delivery pipeline — hidden until the team creates a roster record. */}
        <LaunchPipeline data={pipeline} />

        {/* Marketing results — digital-marketing engagements only. */}
        {hasMarketingReports && <PerformanceOverview />}
      </div>
    </div>
  );
}
