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
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminProjectConsole } from "@/components/dashboard/admin-project-console";
import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button";
import { EstimatePanel } from "@/components/dashboard/estimate-panel";

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
  // Provision the user row on first visit, then gate on role.
  const me = await getOrCreateCurrentUser();
  if (!me) redirect("/sign-in");
  if (me.role !== "admin") notFound();

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [client, brief, phases, decisions, deliverables, architect] = await Promise.all([
    db.select().from(users).where(eq(users.id, project.userId)).then((r) => r[0]),
    db.select().from(onboardingSubmissions).where(eq(onboardingSubmissions.projectId, id)).then((r) => r[0]),
    db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
    db.select().from(decisionRequests).where(eq(decisionRequests.projectId, id)),
    db.select().from(deliverablesTable).where(eq(deliverablesTable.projectId, id)),
    project.architectId
      ? db.select().from(teamMembers).where(eq(teamMembers.id, project.architectId)).then((r) => r[0])
      : Promise.resolve(undefined),
  ]);

  const sortedPhases = phases
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ id: p.id, name: p.name, status: p.status }));

  const clientName =
    `${client?.firstName ?? ""} ${client?.lastName ?? ""}`.trim() || client?.email || "Unknown";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            {clientName} · {disciplineLabels[project.serviceType] ?? project.serviceType}
            {architect ? ` · Architect: ${architect.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="orange" className="text-sm px-3 py-1">
            {statusLabels[project.status] ?? project.status}
          </Badge>
          <GeneratePlanButton projectId={project.id} />
        </div>
      </div>

      <AdminProjectConsole
        projectId={project.id}
        phases={sortedPhases}
        decisions={decisions.map((d) => ({ id: d.id, kind: d.kind, title: d.title, status: d.status }))}
        deliverables={deliverables.map((d) => ({ id: d.id, kind: d.kind, title: d.title, url: d.url, status: d.status, description: d.description }))}
      />

      <EstimatePanel
        projectId={project.id}
        estimatedHours={project.estimatedHours}
        actualHours={project.actualHours}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{client?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{client?.type ?? "human"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>The Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {brief ? (
              <>
                <div>
                  <span className="text-muted-foreground block mb-1">Business</span>
                  <span>{brief.businessName}</span>
                </div>
                {brief.description && (
                  <div>
                    <span className="text-muted-foreground block mb-1">What they want</span>
                    <p className="text-muted-foreground">{brief.description}</p>
                  </div>
                )}
                {brief.timeline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                    <span>{brief.timeline}</span>
                  </div>
                )}
                {brief.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>{brief.budget}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No brief on file.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
