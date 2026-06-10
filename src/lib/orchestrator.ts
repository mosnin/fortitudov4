import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blueprints, tasks, taskSubmissions } from "@/db/schema";
import { getTaskGraph } from "./tasks";
import { recordEvent } from "./activity";

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

const SUMMARY_CAP = 6000;
const PREVIEW_LEN = 140;
const HARD_CAP = 5;

const INSTRUCTIONS = `You are a Fortitudo delivery agent. Produce a concrete, reviewable DRAFT of the work for this task that satisfies its acceptance criteria — the actual content/plan/copy/spec, not a description of what you'd do. Be specific and ready for a human to approve or revise.`;

function deliveryAgent() {
  return new Agent({
    name: "Fortitudo Delivery Agent",
    instructions: INSTRUCTIONS,
    model: MODEL,
    modelSettings: {
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-orchestrate-v1" },
    },
  });
}

export type DraftedTask = { taskId: string; title: string; preview: string };

/**
 * Supervised execution orchestrator. Picks ready tasks, drafts the actual work
 * for each with an agent, and lands every draft in human review — it NEVER
 * auto-approves. A draft enters review exactly like a teammate's submission:
 * the task goes to `in_review` and a `pending` task_submission is created.
 */
export async function orchestrateNext(
  projectId: string,
  triggeredBy: string,
  opts?: { max?: number }
): Promise<{ drafted: DraftedTask[]; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  setDefaultOpenAIKey(apiKey);

  const max = Math.max(1, Math.min(opts?.max ?? 1, HARD_CAP));

  const graph = await getTaskGraph(projectId);
  const candidates = graph
    .filter((t) => t.ready && (t.status === "todo" || t.status === "in_progress"))
    .slice(0, max);

  if (candidates.length === 0) {
    return { drafted: [], message: "No ready tasks to work." };
  }

  // Latest blueprint for shared context (best-effort).
  const [bp] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.projectId, projectId))
    .orderBy(desc(blueprints.createdAt))
    .limit(1);
  const blueprintSummary = bp
    ? [bp.title, bp.summary, bp.architectureNotes].filter(Boolean).join("\n")
    : "";

  const agent = deliveryAgent();
  const drafted: DraftedTask[] = [];

  for (const cand of candidates) {
    try {
      // Reload the task row for the authoritative description / criteria / kind.
      const [task] = await db.select().from(tasks).where(eq(tasks.id, cand.id));
      if (!task) continue;
      // Re-check status to avoid racing into an already-reviewing task.
      if (task.status !== "todo" && task.status !== "in_progress") continue;

      const prompt = [
        `Task: ${task.title}`,
        `Kind: ${task.kind}`,
        task.description ? `Description:\n${task.description}` : "",
        task.acceptanceCriteria ? `Acceptance criteria:\n${task.acceptanceCriteria}` : "",
        blueprintSummary ? `Project blueprint (context):\n${blueprintSummary}` : "",
        "Produce the draft now.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const result = await run(agent, prompt);
      const draftText = (result.finalOutput ?? "").trim();
      if (!draftText) continue;

      const summary = `🤖 Agent draft\n\n${draftText}`.slice(0, SUMMARY_CAP);
      const now = new Date();

      await db.insert(taskSubmissions).values({
        taskId: task.id,
        submittedBy: triggeredBy,
        summary,
        status: "pending",
      });

      await db
        .update(tasks)
        .set({ status: "in_review", submittedAt: now, updatedAt: now })
        .where(eq(tasks.id, task.id));

      await recordEvent({
        projectId,
        actorId: triggeredBy,
        actorType: "agent",
        kind: "agent_drafted",
        summary: `Agent drafted work for "${task.title}"`,
      });

      drafted.push({
        taskId: task.id,
        title: task.title,
        preview: draftText.slice(0, PREVIEW_LEN),
      });
    } catch (err) {
      // Be resilient — one failed draft shouldn't sink the batch.
      console.error(
        `orchestrateNext: failed to draft task ${cand.id}`,
        err instanceof Error ? err.message : err
      );
    }
  }

  if (drafted.length === 0) {
    return { drafted, message: "Couldn't draft any ready tasks. Try again." };
  }

  const message =
    drafted.length === 1
      ? `Drafted "${drafted[0].title}" for review.`
      : `Drafted ${drafted.length} tasks for review.`;

  return { drafted, message };
}
