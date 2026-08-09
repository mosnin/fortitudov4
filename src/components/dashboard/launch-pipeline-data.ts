import { db } from "@/db";
import { agencyClients, clientTasks } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CRM_STAGES, STAGE_LABELS, type CrmStage } from "@/lib/crm";
import type { LaunchPipelineData } from "./launch-pipeline";

/**
 * Server-side loader for the client's launch pipeline — their current stage,
 * checklist progress, and per-stage completion, derived from the agency
 * roster record the team maintains in the admin Client CRM.
 *
 * Server components only (queries the DB directly). Returns null when the
 * signed-in user has no roster record, so callers can simply skip rendering.
 */
export async function getLaunchPipeline(
  userId: string
): Promise<LaunchPipelineData | null> {
  const [client] = await db
    .select({ id: agencyClients.id, stage: agencyClients.stage })
    .from(agencyClients)
    .where(eq(agencyClients.userId, userId));

  if (!client) return null;

  const tasks = await db
    .select({
      id: clientTasks.id,
      status: clientTasks.status,
      stage: clientTasks.stage,
    })
    .from(clientTasks)
    .where(eq(clientTasks.clientId, client.id))
    .orderBy(asc(clientTasks.order), asc(clientTasks.createdAt));

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;

  const stages = CRM_STAGES.map((s) => {
    const stageTasks = tasks.filter((t) => t.stage === s);
    const complete =
      stageTasks.length > 0 && stageTasks.every((t) => t.status === "completed");
    return {
      key: s,
      label: STAGE_LABELS[s],
      complete,
      active: s === client.stage,
    };
  });

  return {
    stageLabel: STAGE_LABELS[client.stage as CrmStage] ?? client.stage,
    total,
    done,
    stages,
  };
}
