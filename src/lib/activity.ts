import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityEvents, type ActivityEvent } from "@/db/schema";

export type ActorType = "human" | "agent" | "system";

export interface RecordEventInput {
  projectId: string;
  kind: string;
  summary: string;
  actorId?: string | null;
  actorType?: ActorType;
  metadata?: Record<string, unknown>;
}

/**
 * Append one entry to a build's auditable timeline. Best-effort: logging must
 * never fail the action it describes, so callers can fire-and-forget.
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    await db.insert(activityEvents).values({
      projectId: input.projectId,
      actorId: input.actorId ?? null,
      actorType: input.actorType ?? "human",
      kind: input.kind,
      summary: input.summary,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.error("recordEvent failed", err instanceof Error ? err.message : err);
  }
}

/** The build's timeline, newest first. */
export async function getActivity(projectId: string, limit = 100): Promise<ActivityEvent[]> {
  return db
    .select()
    .from(activityEvents)
    .where(eq(activityEvents.projectId, projectId))
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit);
}
