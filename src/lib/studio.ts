import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  projects,
  onboardingSubmissions,
  blueprints,
  projectPhases,
  payments,
  decisionRequests,
  teamMembers,
  type Blueprint,
  type Project,
} from "@/db/schema";
import { generateBlueprint, type BriefInput } from "./blueprint";
import { projectPhaseNames } from "./services";
import { notify } from "./notify";

// Assign an available architect for the discipline, if the team is seeded.
async function pickArchitect(discipline: BriefInput["discipline"]): Promise<string | null> {
  const [architect] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(and(eq(teamMembers.discipline, discipline), eq(teamMembers.active, true)))
    .limit(1);
  return architect?.id ?? null;
}

// Shared studio orchestration. Both the human portal and the agent API call
// these so the two surfaces stay in lockstep over one domain core.

export async function createProjectFromBrief(
  userId: string,
  brief: BriefInput
): Promise<{ project: Project; blueprint: Blueprint }> {
  const generated = generateBlueprint(brief);
  const architectId = await pickArchitect(brief.discipline);

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: generated.title,
      serviceType: brief.discipline,
      status: "onboarding",
      architectId,
    })
    .returning();

  await db.insert(onboardingSubmissions).values({
    projectId: project.id,
    businessName: brief.businessName,
    description: brief.description,
    targetAudience: brief.targetAudience ?? null,
    timeline: brief.timeline ?? null,
    budget: brief.budget ?? null,
    additionalNotes: brief.additionalNotes ?? null,
    brandColors: brief.brandColors ?? null,
    features: brief.features ?? null,
  });

  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const [blueprint] = await db
    .insert(blueprints)
    .values({
      projectId: project.id,
      title: generated.title,
      summary: generated.summary,
      scope: generated.scope,
      architectureNotes: generated.architectureNotes,
      lineItems: generated.lineItems,
      subtotal: generated.subtotal,
      total: generated.total,
      currency: generated.currency,
      estimatedTimeline: generated.estimatedTimeline,
      status: "sent",
      validUntil,
    })
    .returning();

  await db.insert(projectPhases).values(
    projectPhaseNames.map((name, i) => ({
      projectId: project.id,
      name,
      order: i,
      status: "pending" as const,
    }))
  );

  await notify({
    userId,
    projectId: project.id,
    type: "phase_update",
    title: "Your Blueprint is ready",
    body: `${generated.title} — review your bespoke Blueprint and price.`,
    actionUrl: `/blueprint/${blueprint.id}`,
  });

  return { project, blueprint };
}

export async function acceptBlueprint(
  blueprintId: string,
  userId: string
): Promise<{ blueprint: Blueprint; paymentId: string } | null> {
  const [blueprint] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.id, blueprintId));

  if (!blueprint || blueprint.status === "accepted") return null;

  await db
    .update(blueprints)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(blueprints.id, blueprintId));

  await db
    .update(projects)
    .set({ status: "payment_pending", updatedAt: new Date() })
    .where(eq(projects.id, blueprint.projectId));

  const [payment] = await db
    .insert(payments)
    .values({
      projectId: blueprint.projectId,
      userId,
      amount: blueprint.total,
      currency: blueprint.currency,
      status: "pending",
    })
    .returning({ id: payments.id });

  return { blueprint, paymentId: payment.id };
}

// The decision loop. A build only interrupts the client when a human-judgment
// decision, asset, or credential is genuinely needed.
export async function createDecisionRequest(args: {
  projectId: string;
  userId: string; // the client to notify
  kind: "info" | "asset" | "credential" | "approval" | "choice";
  title: string;
  prompt: string;
  schema?: Record<string, unknown>;
  blocking?: boolean;
  createdBy?: string;
  dueAt?: Date;
}) {
  const [decision] = await db
    .insert(decisionRequests)
    .values({
      projectId: args.projectId,
      kind: args.kind,
      title: args.title,
      prompt: args.prompt,
      schema: args.schema,
      blocking: args.blocking ?? true,
      createdBy: args.createdBy,
      dueAt: args.dueAt,
    })
    .returning();

  await notify({
    userId: args.userId,
    projectId: args.projectId,
    type: "phase_update",
    title: `We need something: ${args.title}`,
    body: args.prompt,
    actionUrl: `/projects/${args.projectId}#decisions`,
  });

  return decision;
}

export async function answerDecisionRequest(
  decisionId: string,
  userId: string,
  response: Record<string, unknown>
) {
  const [decision] = await db
    .select()
    .from(decisionRequests)
    .where(eq(decisionRequests.id, decisionId));

  if (!decision || decision.status !== "open") return null;

  const [updated] = await db
    .update(decisionRequests)
    .set({
      status: "answered",
      response,
      respondedBy: userId,
      answeredAt: new Date(),
    })
    .where(eq(decisionRequests.id, decisionId))
    .returning();

  return updated;
}
