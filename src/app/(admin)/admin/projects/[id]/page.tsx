import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  files,
  onboardingSubmissions,
  payments,
  projectPhases,
  users,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { canManageProjects } from "@/lib/permissions";
import { services } from "@/lib/services";
import { ManageClient } from "./manage-client";

const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

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
  const user = await getAuthenticatedUser();

  // verifyProjectAccess returns the project or throws a NextResponse on
  // missing / forbidden — in a page we treat any of those as not-found.
  const project = await verifyProjectAccess(id, user.id, user.role).catch(
    () => null
  );
  if (!project) notFound();

  const [clientUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, project.userId));

  const [phases, onboardingRows, fileRows, paymentRows] = await Promise.all([
    db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
    db
      .select()
      .from(onboardingSubmissions)
      .where(eq(onboardingSubmissions.projectId, id)),
    db
      .select()
      .from(files)
      .where(eq(files.projectId, id))
      .orderBy(desc(files.createdAt))
      .limit(50),
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.projectId, id))
      .orderBy(desc(payments.createdAt))
      .limit(1),
  ]);

  const sortedPhases = phases
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      status: p.status,
      order: p.order,
    }));

  const clientName =
    [clientUser?.firstName, clientUser?.lastName].filter(Boolean).join(" ") ||
    clientUser?.email ||
    "Unknown client";

  const onboarding = onboardingRows[0];
  const latestPayment = paymentRows[0];

  return (
    <ManageClient
      canManage={canManageProjects(user.role)}
      projectId={project.id}
      projectName={project.name}
      status={project.status}
      statusLabel={statusLabels[project.status] || project.status}
      serviceLabel={serviceLabels[project.serviceType] || project.serviceType}
      clientName={clientName}
      clientEmail={clientUser?.email ?? "—"}
      phases={sortedPhases}
      latestPayment={
        latestPayment
          ? {
              amount: latestPayment.amount,
              status: latestPayment.status,
            }
          : null
      }
      files={fileRows.map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url,
        size: f.size,
        createdAt: f.createdAt.toISOString(),
      }))}
      onboarding={
        onboarding
          ? {
              businessName: onboarding.businessName,
              industry: onboarding.industry,
              website: onboarding.website,
              description: onboarding.description,
              targetAudience: onboarding.targetAudience,
              budget: onboarding.budget,
              timeline: onboarding.timeline,
              additionalNotes: onboarding.additionalNotes,
            }
          : null
      }
    />
  );
}
