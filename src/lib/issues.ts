import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { issues, type Issue } from "@/db/schema";
import { recordEvent } from "./activity";
import { notify, notifyAdmins } from "./notify";

export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";

export const SEVERITIES: IssueSeverity[] = ["low", "medium", "high", "critical"];
export const STATUSES: IssueStatus[] = ["open", "in_progress", "resolved", "closed"];

export interface CreateIssueInput {
  projectId: string;
  raisedBy: string;
  title: string;
  description?: string | null;
  severity?: IssueSeverity;
  viaAgent?: boolean;
}

/** Raise an issue on a build. Records activity and pings the studio. */
export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const [issue] = await db
    .insert(issues)
    .values({
      projectId: input.projectId,
      raisedBy: input.raisedBy,
      title: input.title,
      description: input.description ?? null,
      severity: input.severity ?? "medium",
    })
    .returning();

  await recordEvent({
    projectId: input.projectId,
    actorId: input.raisedBy,
    actorType: input.viaAgent ? "agent" : "human",
    kind: "issue_raised",
    summary: `Issue raised [${issue.severity}]: ${issue.title}`,
  });
  await notifyAdmins(
    {
      projectId: input.projectId,
      type: "phase_update",
      title: `New ${issue.severity} issue raised`,
      body: issue.title,
      actionUrl: `/admin/projects/${input.projectId}`,
    },
    input.raisedBy
  );

  return issue;
}

/** All issues on a build — unresolved first, then newest. */
export async function listIssues(projectId: string): Promise<Issue[]> {
  return db
    .select()
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .orderBy(
      // open/in_progress before resolved/closed, then newest first
      sql`case when ${issues.status} in ('open','in_progress') then 0 else 1 end`,
      desc(issues.createdAt)
    );
}

export interface UpdateIssueInput {
  status?: IssueStatus;
  severity?: IssueSeverity;
  assigneeId?: string | null;
  resolution?: string | null;
}

/** Triage / resolve an issue. Records activity; pings the raiser on resolve. */
export async function updateIssue(id: string, patch: UpdateIssueInput, actorId: string): Promise<Issue | null> {
  const [existing] = await db.select().from(issues).where(eq(issues.id, id));
  if (!existing) return null;

  const resolving =
    (patch.status === "resolved" || patch.status === "closed") &&
    existing.status !== "resolved" &&
    existing.status !== "closed";

  const [updated] = await db
    .update(issues)
    .set({
      status: patch.status ?? existing.status,
      severity: patch.severity ?? existing.severity,
      assigneeId: patch.assigneeId !== undefined ? patch.assigneeId : existing.assigneeId,
      resolution: patch.resolution !== undefined ? patch.resolution : existing.resolution,
      resolvedBy: resolving ? actorId : existing.resolvedBy,
      resolvedAt: resolving ? new Date() : existing.resolvedAt,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, id))
    .returning();

  if (resolving) {
    await recordEvent({
      projectId: updated.projectId,
      actorId,
      kind: "issue_resolved",
      summary: `Issue ${updated.status}: ${updated.title}`,
    });
    // Tell the person who raised it (if it wasn't them).
    if (updated.raisedBy && updated.raisedBy !== actorId) {
      await notify({
        userId: updated.raisedBy,
        projectId: updated.projectId,
        type: "phase_update",
        title: `Your issue was ${updated.status}`,
        body: updated.resolution || updated.title,
        actionUrl: `/projects/${updated.projectId}`,
      });
    }
  } else {
    await recordEvent({
      projectId: updated.projectId,
      actorId,
      kind: "issue_updated",
      summary: `Issue updated [${updated.status}]: ${updated.title}`,
    });
  }

  return updated;
}

/** Project a build belongs to (for access checks in the [id] route). */
export async function issueProjectId(id: string): Promise<string | null> {
  const [row] = await db
    .select({ projectId: issues.projectId })
    .from(issues)
    .where(eq(issues.id, id))
    .limit(1);
  return row?.projectId ?? null;
}
