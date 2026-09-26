import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, count, desc, eq, gte, inArray, ne, or, type SQL } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { HelixWaitingStrip } from "@/components/admin/helix-waiting-strip";
import {
  AdminNewProjectsChart,
  AdminPipelineChart,
} from "@/components/admin/overview-charts";
import {
  BRAND_BUTTON,
  BRAND_OUTLINE_BUTTON,
  BlueprintLines,
  BuildCubes,
  DASH_CARD,
  MiniList,
  PaidMeter,
  ProgressBar,
  RecentBuildsCard,
  TonePill,
  WelcomeRow,
  WorkspaceCard,
  phaseProgress,
  relativeTime,
  type BuildRow,
  type Tone,
} from "@/components/dashboard/build-overview";
import { db } from "@/db";
import {
  clientPayments,
  leads,
  messages,
  payments,
  projectPhases,
  projects,
  revisionRequests,
  tasks,
  users,
} from "@/db/schema";
import { getAccessibleProjectIds } from "@/lib/auth-utils";
import {
  ROLE_LABELS,
  canManageAgency,
  canManageLeads,
  canViewAllProjects,
  isStaff,
} from "@/lib/permissions";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { PAGE_RHYTHM } from "@/lib/typography";

/**
 * Admin overview — the same card system as the client dashboard, cut per role.
 *
 * admin           — builds, money, revisions, client messages, leads, trends.
 * project_manager — builds, revisions, client messages, leads, trends. No money.
 * va              — their own tasks first, then only the projects they're
 *                   assigned work on (getAccessibleProjectIds).
 *
 * Server-rendered: the layout already turned away non-staff, and every query
 * below is scoped to what this role may see.
 */

const ACTIVE = ["onboarding", "payment_pending", "in_progress", "revision"] as const;
const PAID_STATES = ["paid", "succeeded", "completed", "settled"];
const VOID_STATES = ["failed", "cancelled", "refunded"];
const MONTHS_SHOWN = 6;

const PIPELINE: { status: string; label: string }[] = [
  { status: "onboarding", label: "Onboarding" },
  { status: "payment_pending", label: "Payment Pending" },
  { status: "in_progress", label: "In Progress" },
  { status: "revision", label: "Revision" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
];

const TASK_TONE: Record<string, Tone> = {
  todo: "muted",
  in_progress: "brand",
  in_review: "sky",
  done: "green",
};
const TASK_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "Doing",
  in_review: "In review",
  done: "Done",
};

export default async function AdminOverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const me = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!me || !isStaff(me.role)) redirect("/dashboard");

  const role = me.role;
  const isVa = role === "va";
  const seesAll = canViewAllProjects(role);
  const seesMoney = canManageAgency(role);
  const seesLeads = canManageLeads(role);

  // ── Scope: every project for admin/PM, assigned ones for a VA.
  const scope = await getAccessibleProjectIds(me.id, role);
  const scoped = (column: Parameters<typeof inArray>[0]): SQL | undefined =>
    scope === "all" ? undefined : inArray(column, scope);
  const noProjects = scope !== "all" && scope.length === 0;

  const projectRows = noProjects
    ? []
    : await db
        .select({
          id: projects.id,
          name: projects.name,
          serviceType: projects.serviceType,
          status: projects.status,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          clientFirst: users.firstName,
          clientLast: users.lastName,
          clientEmail: users.email,
        })
        .from(projects)
        .leftJoin(users, eq(projects.userId, users.id))
        .where(scoped(projects.id))
        .orderBy(desc(projects.updatedAt));

  const active = projectRows.filter((p) =>
    (ACTIVE as readonly string[]).includes(p.status)
  );
  const shown = active.slice(0, 8);
  const projectName = new Map(projectRows.map((p) => [p.id, p.name]));

  const [
    phaseRows,
    revisionRows,
    unreadFromClients,
    latestClientMessages,
    taskRows,
    newLeads,
    latestLeads,
    paymentRows,
    retainersThisMonth,
  ] = await Promise.all([
    active.length
      ? db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, active.map((p) => p.id)))
      : [],
    noProjects
      ? []
      : db
          .select()
          .from(revisionRequests)
          .where(
            and(
              or(
                eq(revisionRequests.status, "pending"),
                eq(revisionRequests.status, "in_progress")
              ),
              scoped(revisionRequests.projectId)
            )
          )
          .orderBy(desc(revisionRequests.createdAt)),
    noProjects
      ? 0
      : db
          .select({ value: count() })
          .from(messages)
          .where(
            and(
              eq(messages.role, "client"),
              eq(messages.read, false),
              scoped(messages.projectId)
            )
          )
          .then((r) => r[0]?.value ?? 0),
    noProjects
      ? []
      : db
          .select()
          .from(messages)
          .where(and(eq(messages.role, "client"), scoped(messages.projectId)))
          .orderBy(desc(messages.createdAt))
          .limit(3),
    // A VA's queue is what's assigned to them; admin/PM watch high priority.
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        projectId: tasks.projectId,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(
        and(
          ne(tasks.status, "done"),
          isVa ? eq(tasks.assigneeId, me.id) : eq(tasks.priority, "high")
        )
      )
      .orderBy(desc(tasks.createdAt))
      .limit(50),
    seesLeads
      ? db
          .select({ value: count() })
          .from(leads)
          .where(eq(leads.status, "new"))
          .then((r) => r[0]?.value ?? 0)
      : 0,
    seesLeads
      ? db
          .select({
            id: leads.id,
            name: leads.name,
            company: leads.company,
            serviceInterest: leads.serviceInterest,
            createdAt: leads.createdAt,
          })
          .from(leads)
          .where(eq(leads.status, "new"))
          .orderBy(desc(leads.createdAt))
          .limit(3)
      : [],
    seesMoney
      ? db
          .select({
            id: payments.id,
            amount: payments.amount,
            status: payments.status,
            createdAt: payments.createdAt,
            projectId: payments.projectId,
          })
          .from(payments)
          .orderBy(desc(payments.createdAt))
      : [],
    seesMoney
      ? db
          .select({ amount: clientPayments.amount })
          .from(clientPayments)
          .where(gte(clientPayments.paidAt, startOfMonth()))
      : [],
  ]);

  // ── Money (admin only)
  const monthStart = startOfMonth();
  const isPaid = (s: string) => PAID_STATES.includes(s.toLowerCase());
  const isVoid = (s: string) => VOID_STATES.includes(s.toLowerCase());
  const collectedThisMonth =
    paymentRows
      .filter((p) => isPaid(p.status) && p.createdAt >= monthStart)
      .reduce((s, p) => s + p.amount, 0) +
    retainersThisMonth.reduce((s, p) => s + p.amount, 0);
  const outstanding = paymentRows
    .filter((p) => !isPaid(p.status) && !isVoid(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const paidAllTime = paymentRows
    .filter((p) => isPaid(p.status))
    .reduce((s, p) => s + p.amount, 0);

  // ── Builds table rows
  const toRow = (p: (typeof projectRows)[number]): BuildRow => ({
    id: p.id,
    name: p.name,
    serviceType: p.serviceType,
    status: p.status,
    createdAt: p.createdAt,
    client:
      [p.clientFirst, p.clientLast].filter(Boolean).join(" ") ||
      p.clientEmail?.split("@")[0] ||
      undefined,
    phases: phaseRows
      .filter((ph) => ph.projectId === p.id)
      .map((ph) => ({ id: ph.id, name: ph.name, status: ph.status, order: ph.order })),
  });
  const rows = shown.map(toRow);

  // Overall phase progress across everything in flight.
  const allPhases = active.map((p) => phaseProgress(toRow(p).phases));
  const phasesDone = allPhases.reduce((s, p) => s + p.done, 0);
  const phasesTotal = allPhases.reduce((s, p) => s + p.total, 0);

  // ── VA: what's due soonest
  const now = currentTime();
  const week = now + 7 * 86_400_000;
  const vaQueue = [...taskRows].sort(
    (a, b) =>
      (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity)
  );
  const overdue = taskRows.filter((t) => t.dueDate && t.dueDate.getTime() < now).length;
  const dueThisWeek = taskRows.filter(
    (t) => t.dueDate && t.dueDate.getTime() >= now && t.dueDate.getTime() <= week
  ).length;

  // ── Charts (admin/PM)
  const buckets = monthBuckets();
  const series = buckets.map(() => 0);
  const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
  for (const p of projectRows) {
    const i = bucketIndex.get(`${p.createdAt.getUTCFullYear()}-${p.createdAt.getUTCMonth()}`);
    if (i !== undefined) series[i]++;
  }
  const pipeline = PIPELINE.map((s) => ({
    name: s.label,
    total: projectRows.filter((p) => p.status === s.status).length,
  }));

  // ── Attention card: the few things that are waiting on a person.
  const attention = [
    {
      label: revisionRows.length === 1 ? "revision to triage" : "revisions to triage",
      value: revisionRows.length,
      href: revisionRows[0] ? `/admin/projects/${revisionRows[0].projectId}` : "/admin/projects",
    },
    {
      label: unreadFromClients === 1 ? "unread client message" : "unread client messages",
      value: unreadFromClients,
      href: "/admin/messages",
    },
    isVa
      ? {
          label: overdue === 1 ? "overdue task" : "overdue tasks",
          value: overdue,
          href: "/admin/tasks",
        }
      : {
          label: taskRows.length === 1 ? "high-priority task" : "high-priority tasks",
          value: taskRows.length,
          href: "/admin/tasks",
        },
    ...(seesLeads
      ? [
          {
            label: newLeads === 1 ? "new lead" : "new leads",
            value: newLeads,
            href: "/admin/leads",
          },
        ]
      : []),
  ];
  const waiting = attention.reduce((s, a) => s + a.value, 0);
  const firstUp = attention.find((a) => a.value > 0);

  const roleLabel = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? "Staff";

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn("mx-auto w-full max-w-6xl", PAGE_RHYTHM)}>
        <WelcomeRow
          firstName={me.firstName || "there"}
          badge={roleLabel}
          tip={
            isVa
              ? { label: "Move a task to “In review” when it's ready", href: "/admin/tasks" }
              : { label: "Clear Helix approvals before they go stale", href: "/admin/helix/approvals" }
          }
        />

        {/* Renders only when Helix has queued something. */}
        <HelixWaitingStrip />

        <div className="grid gap-6 pt-4 lg:grid-cols-2 lg:pt-8">
          {/* Hero — builds for admin/PM, the personal queue for a VA. */}
          <div className={cn(DASH_CARD, "relative flex flex-col justify-between p-7 sm:p-8")}>
            <BuildCubes className="pointer-events-none absolute -top-14 right-2 hidden h-40 w-44 sm:block" />
            <div className="flex items-center gap-4">
              <span className="text-6xl font-light leading-none tracking-tight text-foreground tabular-nums">
                {isVa ? taskRows.length : active.length}
              </span>
              <span className="text-lg text-muted-foreground">
                {isVa
                  ? taskRows.length === 1 ? "task on your plate" : "tasks on your plate"
                  : active.length === 1 ? "build in progress" : "builds in progress"}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {isVa ? (
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  {vaQueue[0] ? (
                    <>
                      Next up:{" "}
                      <span className="font-medium text-foreground">{vaQueue[0].title}</span>
                      {vaQueue[0].dueDate && <> — due {relativeDue(vaQueue[0].dueDate)}</>}.{" "}
                      {dueThisWeek} due this week
                      {overdue > 0 && <>, <span className="text-red-600 dark:text-red-400">{overdue} overdue</span></>}.
                    </>
                  ) : (
                    "Your queue is clear. New assignments land here first."
                  )}
                </p>
              ) : (
                <>
                  <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    {active.length === 0 ? (
                      "Nothing in flight right now."
                    ) : (
                      <>
                        <span className="font-medium text-foreground">
                          {active.filter((p) => p.status === "in_progress").length} building
                        </span>
                        {" · "}
                        {active.filter((p) => p.status === "revision").length} in revision
                        {" · "}
                        {active.filter((p) => p.status === "onboarding").length} onboarding
                        {" · "}
                        {active.filter((p) => p.status === "payment_pending").length} awaiting payment
                      </>
                    )}
                  </p>
                  {phasesTotal > 0 && (
                    <ProgressBar
                      pct={Math.round((phasesDone / phasesTotal) * 100)}
                      label={`${phasesDone} of ${phasesTotal} phases shipped across active builds`}
                    />
                  )}
                </>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {isVa ? (
                  <>
                    <Link href="/admin/tasks" className={BRAND_BUTTON}>My tasks</Link>
                    <Link href="/admin/messages" className={BRAND_OUTLINE_BUTTON}>Messages</Link>
                  </>
                ) : (
                  <>
                    <Link href="/admin/projects" className={BRAND_BUTTON}>All projects</Link>
                    <Link href="/admin/clients" className={BRAND_OUTLINE_BUTTON}>Client roster</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Attention — the orange card. */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] p-7 text-white shadow-[0_12px_32px_-16px_rgba(234,88,12,0.6)] sm:p-8 dark:from-[#c2410c] dark:to-[#9a3412] dark:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)]">
            <BlueprintLines className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.09]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <p className="text-xl leading-snug font-medium">
                {waiting === 0
                  ? "Nothing is waiting on you. Nice."
                  : `${waiting} ${waiting === 1 ? "thing needs" : "things need"} a person`}
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {attention.map((a) => (
                  <li key={a.label}>
                    <Link
                      href={a.href}
                      className="block rounded-xl bg-white/15 px-4 py-3 transition-colors hover:bg-white/25 dark:bg-black/20 dark:hover:bg-black/30"
                    >
                      <span className="block text-2xl font-light tabular-nums">{a.value}</span>
                      <span className="block text-xs text-white/85">{a.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {firstUp && (
                <Link
                  href={firstUp.href}
                  className="inline-flex h-11 w-fit items-center gap-1.5 rounded-lg bg-[#7c2d12] px-5 text-sm font-medium text-white transition-colors hover:bg-[#6b260f] dark:bg-black/40 dark:hover:bg-black/55"
                >
                  Start with {firstUp.label.replace(/^(new|unread|overdue) /, "")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <RecentBuildsCard
          title={isVa ? "Builds you're working on" : "Active builds"}
          builds={rows}
          totalCount={active.length}
          basePath="/admin/projects"
          emptyText={
            isVa
              ? "You're not assigned to any builds yet."
              : "No builds in flight. New projects show up here as soon as they start."
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {seesMoney && (
            <WorkspaceCard
              title="Revenue"
              href="/admin/payments"
              linkLabel="Payments"
              headline={formatUsd(collectedThisMonth)}
              headlineMeta="collected this month"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <PaidMeter paid={paidAllTime} billed={paidAllTime + outstanding} />
                  <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span>{formatUsd(paidAllTime)} paid on project invoices</span>
                    <span>{outstanding > 0 ? `${formatUsd(outstanding)} outstanding` : "Nothing outstanding"}</span>
                  </p>
                </div>
                <MiniList
                  empty="No project payments recorded yet."
                  items={paymentRows.slice(0, 3).map((p) => ({
                    id: p.id,
                    href: `/admin/projects/${p.projectId}`,
                    primary: (
                      <>
                        <span className="tabular-nums">{formatUsd(p.amount)}</span>
                        <span className="text-muted-foreground"> · {projectName.get(p.projectId) ?? "Project"}</span>
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
          )}

          {isVa && (
            <WorkspaceCard
              title="My tasks"
              href="/admin/tasks"
              linkLabel="All tasks"
              headline={taskRows.length}
              headlineMeta="open"
            >
              <MiniList
                empty="Nothing assigned to you."
                items={vaQueue.slice(0, 4).map((t) => ({
                  id: t.id,
                  href: "/admin/tasks",
                  primary: t.title,
                  meta: `${projectName.get(t.projectId) ?? "Project"}${t.dueDate ? ` · due ${relativeDue(t.dueDate)}` : ""}`,
                  pill: <TonePill tone={TASK_TONE[t.status] ?? "muted"}>{TASK_LABEL[t.status] ?? t.status}</TonePill>,
                }))}
              />
            </WorkspaceCard>
          )}

          <WorkspaceCard
            title="Revision requests"
            href="/admin/projects"
            linkLabel="Projects"
            headline={revisionRows.length}
            headlineMeta="open"
          >
            <MiniList
              empty="No revisions waiting."
              items={revisionRows.slice(0, 3).map((r) => ({
                id: r.id,
                href: `/admin/projects/${r.projectId}`,
                primary: r.description,
                meta: `${projectName.get(r.projectId) ?? "Project"} · ${relativeTime(r.createdAt)}`,
                pill: (
                  <TonePill tone={r.status === "pending" ? "sky" : "brand"}>
                    {r.status === "pending" ? "New" : "In progress"}
                  </TonePill>
                ),
              }))}
            />
          </WorkspaceCard>

          <WorkspaceCard
            title="Client messages"
            href="/admin/messages"
            linkLabel="Inbox"
            headline={unreadFromClients}
            headlineMeta="unread"
          >
            <MiniList
              empty="No client messages yet."
              items={latestClientMessages.map((m) => ({
                id: m.id,
                href: "/admin/messages",
                primary: m.content,
                meta: `${projectName.get(m.projectId) ?? "Project"} · ${relativeTime(m.createdAt)}`,
                pill: !m.read ? <TonePill tone="brand">New</TonePill> : undefined,
              }))}
            />
          </WorkspaceCard>

          {seesLeads && (
            <WorkspaceCard
              title="New leads"
              href="/admin/leads"
              linkLabel="Pipeline"
              headline={newLeads}
              headlineMeta="to contact"
            >
              <MiniList
                empty="No new leads."
                items={latestLeads.map((l) => ({
                  id: l.id,
                  href: "/admin/leads",
                  primary: l.company ? `${l.name} · ${l.company}` : l.name,
                  meta: `${l.serviceInterest ?? "General enquiry"} · ${relativeTime(l.createdAt)}`,
                }))}
              />
            </WorkspaceCard>
          )}

          {!isVa && (
            <WorkspaceCard
              title="High-priority tasks"
              href="/admin/tasks"
              linkLabel="Tasks"
              headline={taskRows.length}
              headlineMeta="open"
            >
              <MiniList
                empty="The queue is clear."
                items={taskRows.slice(0, 3).map((t) => ({
                  id: t.id,
                  href: "/admin/tasks",
                  primary: t.title,
                  meta: `${projectName.get(t.projectId) ?? "Project"}${t.dueDate ? ` · due ${relativeDue(t.dueDate)}` : ""}`,
                  pill: <TonePill tone={TASK_TONE[t.status] ?? "muted"}>{TASK_LABEL[t.status] ?? t.status}</TonePill>,
                }))}
              />
            </WorkspaceCard>
          )}
        </div>

        {seesAll && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className={cn(DASH_CARD, "p-6 lg:col-span-2")}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] text-foreground/80">New projects</h2>
                <span className="text-xs text-muted-foreground">Last {MONTHS_SHOWN} months</span>
              </div>
              <AdminNewProjectsChart points={series} labels={buckets.map((b) => b.label)} />
            </section>
            <section className={cn(DASH_CARD, "p-6")}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-[15px] text-foreground/80">Pipeline</h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {projectRows.length} projects
                </span>
              </div>
              <AdminPipelineChart items={pipeline} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function startOfMonth() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function monthBuckets() {
  const now = new Date();
  return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS_SHOWN - 1 - i), 1)
    );
    return {
      key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    };
  });
}

function relativeDue(date: Date) {
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (days < -1) return `${-days} days ago`;
  if (days === -1) return "yesterday";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Request time — this page is rendered per request, never cached. */
function currentTime() {
  return Date.now();
}
