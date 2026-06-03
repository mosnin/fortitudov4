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
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { ProjectDetailClient } from "./client";
import { DecisionLoop, type DecisionItem } from "@/components/dashboard/decision-loop";
import { formatPrice } from "@/lib/catalog";
import { ExternalLink, FileText } from "lucide-react";

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
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) return null;

  // Fetch project
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (!project) notFound();

  // Verify ownership (unless admin)
  if (dbUser.role !== "admin" && project.userId !== dbUser.id) notFound();

  // Fetch related data in parallel
  const [phases, projectFiles, projectInvoices, openDecisions, projectDeliverables, projectBlueprints] =
    await Promise.all([
      db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
      db.select().from(filesTable).where(eq(filesTable.projectId, id)),
      db.select().from(invoices).where(eq(invoices.projectId, id)),
      db
        .select()
        .from(decisionRequests)
        .where(and(eq(decisionRequests.projectId, id), eq(decisionRequests.status, "open"))),
      db.select().from(deliverablesTable).where(eq(deliverablesTable.projectId, id)),
      db.select().from(blueprints).where(eq(blueprints.projectId, id)),
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
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      status: p.status,
      order: p.order,
    }));

  const fileData = projectFiles.map((f) => ({
    name: f.name,
    url: f.url,
    size: f.size ? formatBytes(f.size) : "Unknown",
    type: f.type || "application/octet-stream",
  }));

  // Format invoice for display
  const invoice = projectInvoices[0];
  const invoiceData = invoice
    ? {
        invoiceNumber: invoice.invoiceNumber,
        date: new Date(invoice.issuedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: invoice.status as "paid" | "pending" | "overdue",
        projectName: project.name,
        clientName: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() || dbUser.email,
        items: (invoice.items as Array<{ description: string; amount: string }>) || [],
        subtotal: formatCurrency(invoice.subtotal),
        tax: formatCurrency(invoice.tax),
        total: formatCurrency(invoice.total),
      }
    : null;

  const showSurvey =
    project.status === "completed" || project.status === "revision";

  return (
    <div className="space-y-6">
      {/* Your architect — a real human owns this build. */}
      {architect && (
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange font-semibold">
            {architect.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Your architect</p>
            <p className="font-semibold">{architect.name}</p>
            {architect.title && (
              <p className="text-xs text-muted-foreground truncate">{architect.title}</p>
            )}
          </div>
          <a
            href={`/projects/${project.id}#messages`}
            className="ml-auto text-sm font-medium text-orange hover:underline whitespace-nowrap"
          >
            Message
          </a>
        </div>
      )}

      {/* The Decision Loop — the studio only interrupts you when it must. */}
      <DecisionLoop decisions={decisionItems} />

      {/* Blueprint + deliverables surfaces */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {latestBlueprint && (
          <Link
            href={`/blueprint/${latestBlueprint.id}`}
            className="rounded-2xl border border-border bg-card p-5 hover:border-orange/50 transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10">
                <FileText className="h-5 w-5 text-orange" />
              </div>
              <div>
                <p className="text-sm font-medium">Blueprint</p>
                <p className="text-xs text-muted-foreground capitalize">{latestBlueprint.status}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-orange">{formatPrice(latestBlueprint.total)}</span>
          </Link>
        )}

        {projectDeliverables.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-medium mb-3">Deliverables</p>
            <ul className="space-y-2">
              {projectDeliverables.map((d) => (
                <li key={d.id}>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-orange hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {d.title}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{d.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ProjectDetailClient
        project={{
          id: project.id,
          name: project.name,
          serviceType: serviceLabels[project.serviceType] || project.serviceType,
          status: statusLabels[project.status] || project.status,
          createdAt: new Date(project.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }}
        phases={sortedPhases}
        files={fileData}
        invoice={invoiceData}
        showSurvey={showSurvey}
      />
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
