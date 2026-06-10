import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  projects,
  projectPhases,
  files as filesTable,
  invoices,
  decisionRequests,
  deliverables as deliverablesTable,
  blueprints,
  teamMembers,
  milestones as milestonesTable,
  credentials as credentialsTable,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { getProjectProgress } from "@/lib/tasks";
import { getProjectSettings } from "@/lib/project-settings";
import { formatPrice } from "@/lib/catalog";
import { FileText } from "lucide-react";

import { ProjectBrand } from "@/components/dashboard/project-brand";
import { BuildHero } from "@/components/dashboard/build-hero";
import { BuildPhaseStrip } from "@/components/dashboard/build-phase-strip";
import { DeliverableSpotlight } from "@/components/dashboard/deliverable-spotlight";
import { BuildTabs, type BuildTab } from "@/components/dashboard/build-tabs";
import { DeliveryDigest } from "@/components/dashboard/delivery-digest";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { BuildRoadmap } from "@/components/dashboard/build-roadmap";
import { DecisionLoop, type DecisionItem } from "@/components/dashboard/decision-loop";
import { DeliverableReview } from "@/components/dashboard/deliverable-review";
import { RevisionRequest } from "@/components/dashboard/revision-request";
import { MilestonesClient } from "@/components/dashboard/milestones-client";
import { CredentialsVault } from "@/components/dashboard/credentials-vault";
import { FileUpload } from "@/components/dashboard/file-upload";
import { FilePreviewCard } from "@/components/dashboard/file-preview";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { ProjectComments } from "@/components/dashboard/project-comments";
import { NPSSurvey } from "@/components/dashboard/nps-survey";
import { Concierge } from "@/components/dashboard/concierge";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const serviceLabels: Record<string, string> = {
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) return null;

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();
  if (dbUser.role !== "admin" && project.userId !== dbUser.id) notFound();

  const [phases, projectFiles, projectInvoices, openDecisions, projectDeliverables, projectBlueprints, projectMilestones, projectCredentials] =
    await Promise.all([
      db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
      db.select().from(filesTable).where(eq(filesTable.projectId, id)),
      db.select().from(invoices).where(eq(invoices.projectId, id)),
      db.select().from(decisionRequests).where(and(eq(decisionRequests.projectId, id), eq(decisionRequests.status, "open"))),
      db.select().from(deliverablesTable).where(eq(deliverablesTable.projectId, id)),
      db.select().from(blueprints).where(eq(blueprints.projectId, id)),
      db.select().from(milestonesTable).where(eq(milestonesTable.projectId, id)).orderBy(asc(milestonesTable.order)),
      db
        .select({ id: credentialsTable.id, label: credentialsTable.label, status: credentialsTable.status, note: credentialsTable.note })
        .from(credentialsTable)
        .where(eq(credentialsTable.projectId, id))
        .orderBy(asc(credentialsTable.createdAt)),
    ]);

  const decisionItems: DecisionItem[] = openDecisions.map((d) => ({
    id: d.id,
    kind: d.kind,
    title: d.title,
    prompt: d.prompt,
    schema: d.schema,
  }));

  const latestBlueprint = projectBlueprints
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const architect = project.architectId
    ? (await db.select().from(teamMembers).where(eq(teamMembers.id, project.architectId)))[0]
    : undefined;

  const sortedPhases = phases
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ id: p.id, name: p.name, description: p.description || undefined, status: p.status, order: p.order }));

  const progress = await getProjectProgress(id);
  const settings = await getProjectSettings(id);

  // Hide internal agent drafts until an architect publishes them.
  const clientDeliverables = projectDeliverables.filter((d) => d.status !== "draft");
  const pendingDeliverables = clientDeliverables.filter((d) => d.status === "pending").length;
  const unpaidMilestones = projectMilestones.filter((m) => m.status === "pending").length;

  const fileData = projectFiles.map((f) => ({
    name: f.name,
    url: f.url,
    size: f.size ? formatBytes(f.size) : "Unknown",
    type: f.type || "application/octet-stream",
  }));

  const invoice = projectInvoices[0];
  const invoiceData = invoice
    ? {
        invoiceNumber: invoice.invoiceNumber,
        date: new Date(invoice.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        status: invoice.status as "paid" | "pending" | "overdue",
        projectName: project.name,
        clientName: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() || dbUser.email,
        items: (invoice.items as Array<{ description: string; amount: string }>) || [],
        subtotal: formatCurrency(invoice.subtotal),
        tax: formatCurrency(invoice.tax),
        total: formatCurrency(invoice.total),
      }
    : null;

  const showSurvey = project.status === "completed" || project.status === "revision";

  // The most recently shipped deliverable — spotlit at the top of Overview.
  const latestDeliverable = clientDeliverables
    .slice()
    .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())[0];

  // ── Hero metrics ──────────────────────────────────────────────────────────
  const phasesDone = sortedPhases.filter((p) => {
    const pr = progress.byPhase[p.id];
    return pr && pr.total > 0 && pr.pct >= 100;
  }).length;
  const currentPhase =
    sortedPhases.find((p) => (progress.byPhase[p.id]?.pct ?? 0) < 100)?.name ??
    (sortedPhases.length ? "Wrapping up" : "Getting started");
  const daysActive = daysSince(new Date(project.createdAt));

  // ── Roadmap (shared between hero context + Overview) ──────────────────────
  const roadmap = (
    <BuildRoadmap
      phases={sortedPhases.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        ...(progress.byPhase[p.id] ?? { done: 0, total: 0, pct: 0 }),
      }))}
      overall={progress.overall}
    />
  );

  const blueprintCard = latestBlueprint && (
    <Link
      href={`/blueprint/${latestBlueprint.id}`}
      className="flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:border-orange/50"
    >
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-orange" />
        <div>
          <p className="text-sm font-medium">Blueprint</p>
          <p className="text-xs capitalize text-muted-foreground">{latestBlueprint.status}</p>
        </div>
      </div>
      <span className="text-lg font-bold text-orange">{formatPrice(latestBlueprint.total)}</span>
    </Link>
  );

  // ── Tab sections ──────────────────────────────────────────────────────────
  const overview = (
    <div className="space-y-5">
      <DeliverableSpotlight
        deliverable={
          latestDeliverable
            ? {
                id: latestDeliverable.id,
                title: latestDeliverable.title,
                kind: latestDeliverable.kind,
                url: latestDeliverable.url,
                description: latestDeliverable.description,
                status: latestDeliverable.status,
              }
            : null
        }
        brandColor={settings.brandColor}
      />
      <DeliveryDigest projectId={project.id} />
      <DecisionLoop decisions={decisionItems} />
      {roadmap}
      {blueprintCard}
      <RevisionRequest projectId={project.id} />
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Discussion</h3>
        <div className="mt-3">
          <ProjectComments projectId={project.id} />
        </div>
      </div>
    </div>
  );

  const deliverablesTab = (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Deliverables</h3>
      {clientDeliverables.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Deliverables appear here as the studio ships them — review and approve right inline.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {clientDeliverables.map((d) => (
            <DeliverableReview key={d.id} id={d.id} title={d.title} url={d.url} status={d.status} />
          ))}
        </ul>
      )}
    </div>
  );

  const activityTab = <ActivityTimeline projectId={project.id} />;

  const billingTab = (
    <div className="space-y-5">
      <MilestonesClient
        milestones={projectMilestones.map((m) => ({
          id: m.id,
          label: m.label,
          description: m.description,
          amount: m.amount,
          status: m.status,
          dueAt: m.dueAt ? m.dueAt.toISOString() : null,
        }))}
      />
      {invoiceData && <InvoiceCard invoice={invoiceData} />}
    </div>
  );

  const assetsTab = (
    <div className="space-y-5">
      <CredentialsVault projectId={project.id} credentials={projectCredentials} />
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Files & assets</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Share brand assets, briefs, or references with your architect.
        </p>
        <div className="mt-4">
          <FileUpload projectId={project.id} />
        </div>
        {fileData.length > 0 && (
          <div className="mt-4 space-y-2">
            {fileData.map((f) => (
              <FilePreviewCard key={f.name} name={f.name} url={f.url} type={f.type} size={f.size} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const tabs: BuildTab[] = [
    { id: "overview", label: "Overview", content: overview },
    { id: "deliverables", label: "Deliverables", badge: pendingDeliverables, content: deliverablesTab },
    { id: "activity", label: "Activity", content: activityTab },
    { id: "billing", label: "Billing", badge: unpaidMilestones, content: billingTab },
    { id: "assets", label: "Assets", content: assetsTab },
  ];

  return (
    <ProjectBrand brandColor={settings.brandColor}>
      <div className="space-y-5">
        <BuildHero
          projectId={project.id}
          name={project.name}
          discipline={serviceLabels[project.serviceType] ?? project.serviceType}
          status={project.status}
          statusLabel={statusLabels[project.status] ?? project.status}
          pct={progress.overall.pct}
          stepsDone={progress.overall.done}
          stepsTotal={progress.overall.total}
          phasesDone={phasesDone}
          phasesTotal={sortedPhases.length}
          currentPhase={currentPhase}
          deliverables={clientDeliverables.length}
          openDecisions={decisionItems.length}
          daysActive={daysActive}
          architect={architect ? { name: architect.name, title: architect.title } : null}
          brandColor={settings.brandColor}
        />

        <BuildPhaseStrip
          phases={sortedPhases.map((p) => ({ id: p.id, name: p.name, pct: progress.byPhase[p.id]?.pct ?? 0 }))}
          brandColor={settings.brandColor}
        />

        {showSurvey && (
          <NPSSurvey projectId={project.id} projectName={project.name} />
        )}

        <BuildTabs tabs={tabs} />

        <Concierge projectId={project.id} enabled={settings.conciergeEnabled} />
      </div>
    </ProjectBrand>
  );
}

function daysSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
