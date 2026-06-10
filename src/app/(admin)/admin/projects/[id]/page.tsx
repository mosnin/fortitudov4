import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  projects,
  users,
  onboardingSubmissions,
  projectPhases,
  decisionRequests,
  deliverables as deliverablesTable,
  teamMembers,
  milestones as milestonesTable,
  credentials as credentialsTable,
} from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { getTaskGraph } from "@/lib/tasks";
import { getProjectSettings, AUTONOMY_COPY } from "@/lib/project-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { AdminBuildHero } from "@/components/dashboard/admin-build-hero";
import { BuildTabs, type BuildTab } from "@/components/dashboard/build-tabs";
import { AdminProjectConsole } from "@/components/dashboard/admin-project-console";
import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button";
import { OrchestratorPanel } from "@/components/dashboard/orchestrator-panel";
import { EstimatePanel } from "@/components/dashboard/estimate-panel";
import { TasksPanel } from "@/components/dashboard/tasks-panel";
import { CredentialsVault } from "@/components/dashboard/credentials-vault";
import { MilestonesAdmin } from "@/components/dashboard/milestones-admin";
import { AutonomyDial } from "@/components/dashboard/autonomy-dial";
import { BrandSettings } from "@/components/dashboard/brand-settings";
import { DeliveryDigest } from "@/components/dashboard/delivery-digest";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { IssuesPanel } from "@/components/dashboard/issues-panel";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};
const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getOrCreateCurrentUser();
  if (!me) redirect("/sign-in");
  if (me.role !== "admin") notFound();

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [client, brief, phases, decisions, deliverables, architect, projectMilestones, projectTasks, staff, projectCredentials] = await Promise.all([
    db.select().from(users).where(eq(users.id, project.userId)).then((r) => r[0]),
    db.select().from(onboardingSubmissions).where(eq(onboardingSubmissions.projectId, id)).then((r) => r[0]),
    db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
    db.select().from(decisionRequests).where(eq(decisionRequests.projectId, id)),
    db.select().from(deliverablesTable).where(eq(deliverablesTable.projectId, id)),
    project.architectId
      ? db.select().from(teamMembers).where(eq(teamMembers.id, project.architectId)).then((r) => r[0])
      : Promise.resolve(undefined),
    db.select().from(milestonesTable).where(eq(milestonesTable.projectId, id)).orderBy(asc(milestonesTable.order)),
    getTaskGraph(id),
    db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(users)
      .where(inArray(users.role, ["admin", "team"])),
    db
      .select({ id: credentialsTable.id, label: credentialsTable.label, status: credentialsTable.status, note: credentialsTable.note })
      .from(credentialsTable)
      .where(eq(credentialsTable.projectId, id))
      .orderBy(asc(credentialsTable.createdAt)),
  ]);

  const sortedPhases = phases
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ id: p.id, name: p.name, status: p.status }));

  const clientName = `${client?.firstName ?? ""} ${client?.lastName ?? ""}`.trim() || client?.email || "Unknown";
  const settings = await getProjectSettings(id);

  // ── Operational task metrics ──────────────────────────────────────────────
  const tTotal = projectTasks.length;
  const tDone = projectTasks.filter((t) => t.status === "done").length;
  const tReview = projectTasks.filter((t) => t.status === "in_review").length;
  const tReady = projectTasks.filter(
    (t) => t.ready && t.status !== "done" && t.status !== "cancelled" && t.status !== "in_review"
  ).length;
  const tBlocked = projectTasks.filter((t) => !t.ready && t.status !== "done" && t.status !== "cancelled").length;
  const tPct = tTotal ? Math.round((tDone / tTotal) * 100) : 0;
  const daysActive = daysSince(new Date(project.createdAt));

  // ── Tab sections ──────────────────────────────────────────────────────────
  const overview = (
    <div className="space-y-5">
      <DeliveryDigest projectId={project.id} />
      <AdminProjectConsole
        projectId={project.id}
        phases={sortedPhases}
        decisions={decisions.map((d) => ({ id: d.id, kind: d.kind, title: d.title, status: d.status }))}
        deliverables={deliverables.map((d) => ({ id: d.id, kind: d.kind, title: d.title, url: d.url, status: d.status, description: d.description }))}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{clientName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{client?.email ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{client?.type ?? "human"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>The Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {brief ? (
              <>
                <div><span className="mb-1 block text-muted-foreground">Business</span><span>{brief.businessName}</span></div>
                {brief.description && (
                  <div><span className="mb-1 block text-muted-foreground">What they want</span><p className="text-muted-foreground">{brief.description}</p></div>
                )}
                {brief.timeline && <div className="flex justify-between"><span className="text-muted-foreground">Timeline</span><span>{brief.timeline}</span></div>}
                {brief.budget && <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span>{brief.budget}</span></div>}
              </>
            ) : (
              <p className="text-muted-foreground">No brief on file.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const tasksTab = (
    <div className="space-y-5">
      <OrchestratorPanel projectId={project.id} />
      <TasksPanel
        projectId={project.id}
        tasks={projectTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          assigneeId: t.assigneeId,
          phaseId: t.phaseId,
          kind: t.kind,
          estimateHours: t.estimateHours,
          ready: t.ready,
          blockedBy: t.blockedBy,
        }))}
        staff={staff.map((s) => ({ id: s.id, name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email }))}
        phases={phases.slice().sort((a, b) => a.order - b.order).map((p) => ({ id: p.id, name: p.name }))}
      />
      <EstimatePanel projectId={project.id} estimatedHours={project.estimatedHours} actualHours={project.actualHours} />
    </div>
  );

  const activityTab = <ActivityTimeline projectId={project.id} />;

  const billingTab = (
    <MilestonesAdmin
      projectId={project.id}
      milestones={projectMilestones.map((m) => ({
        id: m.id,
        label: m.label,
        amount: m.amount,
        status: m.status,
        dueAt: m.dueAt ? m.dueAt.toISOString() : null,
      }))}
    />
  );

  const vaultTab = <CredentialsVault projectId={project.id} credentials={projectCredentials} />;

  const settingsTab = (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <AutonomyDial projectId={project.id} initial={settings.autonomyLevel} />
      <BrandSettings projectId={project.id} initialColor={settings.brandColor} initialName={settings.brandName} />
    </div>
  );

  const tabs: BuildTab[] = [
    { id: "overview", label: "Overview", content: overview },
    { id: "tasks", label: "Tasks", badge: tReview || undefined, content: tasksTab },
    { id: "issues", label: "Issues", content: <IssuesPanel projectId={project.id} staff /> },
    { id: "activity", label: "Activity", content: activityTab },
    { id: "billing", label: "Billing", content: billingTab },
    { id: "vault", label: "Vault", content: vaultTab },
    { id: "settings", label: "Settings", content: settingsTab },
  ];

  return (
    <div className="space-y-5">
      {/* Slim action bar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/messages?project=${project.id}`}>
              <MessageSquare className="h-4 w-4" />
              Message client
            </Link>
          </Button>
          <GeneratePlanButton projectId={project.id} />
        </div>
      </div>

      <AdminBuildHero
        projectId={project.id}
        name={project.name}
        discipline={disciplineLabels[project.serviceType] ?? project.serviceType}
        status={project.status}
        statusLabel={statusLabels[project.status] ?? project.status}
        clientName={clientName}
        architectName={architect?.name ?? null}
        autonomyLabel={AUTONOMY_COPY[settings.autonomyLevel].label}
        pct={tPct}
        stepsDone={tDone}
        stepsTotal={tTotal}
        tasksReady={tReady}
        tasksInReview={tReview}
        tasksBlocked={tBlocked}
        tasksDone={tDone}
        tasksTotal={tTotal}
        daysActive={daysActive}
        brandColor={settings.brandColor}
      />

      <BuildTabs tabs={tabs} />
    </div>
  );
}

function daysSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}
