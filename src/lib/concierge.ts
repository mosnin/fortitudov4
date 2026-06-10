import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, blueprints, decisionRequests } from "@/db/schema";
import { getProjectProgress, getTaskGraph } from "./tasks";
import { getActivity } from "./activity";
import { searchMemory, memoryToContext } from "./memory";

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

export type ConciergeMessage = { role: "user" | "assistant"; content: string };

export interface ConciergeOpts {
  userId: string;
  projectId: string;
  message: string;
  history?: ConciergeMessage[];
}

const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment pending",
  in_progress: "In progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

// The concierge is READ/ANSWER ONLY. It never mutates anything and never claims
// to have changed anything — it answers from a snapshot of the build and points
// the client at where *they* act (their project page) when a human step is due.
const INSTRUCTIONS = `You are the Fortitudo studio concierge — a warm, concise, always-available assistant for a client's bespoke build.

# Your job
- Answer the client's questions ("where are we?", "what's left?", "what needs me?") using ONLY the build context provided below. Do not invent status, dates, or work that isn't in the context.
- Be brief and calm. A few sentences or a short list. No filler, no hype.
- When the context doesn't contain the answer, say so plainly and suggest they message their architect.

# Hard boundaries
- You are read-only. You CANNOT change anything, approve anything, answer a decision, upload files, or move the build forward. Never claim you did or will.
- If the client wants to make a change, approve work, or answer a decision, tell them exactly where to do it — e.g. "open the decision on your project page" or "review the deliverable on your project page". A human still acts; you only point the way.
- You may *suggest* sensible next steps, but frame them as suggestions for the client or their architect, not actions you take.`;

interface BuildSnapshot {
  context: string;
  /** Deterministic fallback summary, used when no API key is configured. */
  fallback: string;
}

/** Assemble a compact, prompt-ready snapshot of the build from the data libs. */
async function buildSnapshot(opts: ConciergeOpts): Promise<BuildSnapshot | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, opts.projectId));
  if (!project) return null;

  const [progress, taskGraph, openDecisions, activity, memoryRows, latestBlueprintRows] =
    await Promise.all([
      getProjectProgress(opts.projectId),
      getTaskGraph(opts.projectId),
      db
        .select()
        .from(decisionRequests)
        .where(
          and(eq(decisionRequests.projectId, opts.projectId), eq(decisionRequests.status, "open"))
        )
        .orderBy(desc(decisionRequests.createdAt))
        .limit(5),
      getActivity(opts.projectId, 8),
      searchMemory({
        userId: opts.userId,
        projectId: opts.projectId,
        query: opts.message,
        includeGlobal: true,
        limit: 8,
      }),
      db
        .select()
        .from(blueprints)
        .where(eq(blueprints.projectId, opts.projectId))
        .orderBy(desc(blueprints.createdAt))
        .limit(1),
    ]);

  const statusLabel = statusLabels[project.status] ?? project.status;
  const blueprint = latestBlueprintRows[0];

  // Next ready tasks: not done, unblocked by the dependency graph.
  const readyTasks = taskGraph.filter((t) => t.status !== "done" && t.ready).slice(0, 5);
  const inFlight = taskGraph.filter((t) => t.status === "in_progress" || t.status === "in_review");

  const memoryBlock = memoryToContext(memoryRows);

  const decisionsBlock = openDecisions.length
    ? openDecisions
        .map((d) => `- [${d.kind}${d.blocking ? ", blocking" : ""}] ${d.title}: ${d.prompt}`)
        .join("\n")
    : "None open.";

  const readyBlock = readyTasks.length
    ? readyTasks.map((t) => `- ${t.title} (${t.kind})`).join("\n")
    : "None ready right now.";

  const inFlightBlock = inFlight.length
    ? inFlight.map((t) => `- ${t.title} — ${t.status.replace("_", " ")}`).join("\n")
    : "None currently being worked.";

  const activityBlock = activity.length
    ? activity
        .map((a) => {
          const when = new Date(a.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return `- ${when} · ${a.summary}`;
        })
        .join("\n")
    : "No recent activity.";

  const context = [
    `Build: ${project.name}`,
    `Discipline: ${project.serviceType}`,
    `Status: ${statusLabel}`,
    blueprint ? `Blueprint: "${blueprint.title}" (${blueprint.status})` : null,
    `Overall progress: ${progress.overall.pct}% (${progress.overall.done}/${progress.overall.total} tasks done)`,
    "",
    `Open decisions (need the client):\n${decisionsBlock}`,
    "",
    `In flight (being worked now):\n${inFlightBlock}`,
    "",
    `Next ready tasks (unblocked):\n${readyBlock}`,
    "",
    `Recent activity (newest first):\n${activityBlock}`,
    memoryBlock ? `\nWhat we remember about this client/build:\n${memoryBlock}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  // Deterministic summary so the concierge still answers without an LLM key.
  const fallbackLines = [
    `${project.name} is ${statusLabel.toLowerCase()} — ${progress.overall.pct}% complete (${progress.overall.done}/${progress.overall.total} tasks done).`,
  ];
  if (openDecisions.length) {
    fallbackLines.push(
      `${openDecisions.length} decision${openDecisions.length === 1 ? "" : "s"} need you: ${openDecisions
        .map((d) => d.title)
        .join(", ")}. Open them on your project page to respond.`
    );
  } else {
    fallbackLines.push("Nothing needs you right now — no open decisions.");
  }
  if (inFlight.length) {
    fallbackLines.push(`Being worked now: ${inFlight.map((t) => t.title).join(", ")}.`);
  }
  if (readyTasks.length) {
    fallbackLines.push(`Up next: ${readyTasks.map((t) => t.title).join(", ")}.`);
  }
  fallbackLines.push(
    "(I can answer questions about your build, but I can't change anything — a human still acts on every step.)"
  );

  return { context, fallback: fallbackLines.join(" ") };
}

// Map our chat shape to the Agents SDK input items (mirrors brief-agent).
function toInputItems(messages: ConciergeMessage[]): AgentInputItem[] {
  return messages.map((m) =>
    m.role === "assistant"
      ? {
          role: "assistant" as const,
          status: "completed" as const,
          content: [{ type: "output_text" as const, text: m.content }],
        }
      : { role: "user" as const, content: m.content }
  );
}

/**
 * Answer a client's question about their build. Read-only: assembles a context
 * snapshot and either runs the concierge agent over it, or — when no OpenAI key
 * is configured — returns a deterministic summary so the feature degrades
 * gracefully. Never mutates anything.
 */
export async function conciergeReply(opts: ConciergeOpts): Promise<string> {
  const snapshot = await buildSnapshot(opts);
  if (!snapshot) {
    return "I couldn't find that build. If you think this is a mistake, message your architect.";
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Graceful, key-free path: deterministic build summary.
    return snapshot.fallback;
  }

  setDefaultOpenAIKey(apiKey);

  const agent = new Agent({
    name: "Fortitudo Concierge",
    instructions: INSTRUCTIONS,
    model: MODEL,
    modelSettings: {
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-concierge-v1" },
    },
  });

  // Keep a short slice of prior turns for continuity, then the fresh context +
  // question as the final user turn.
  const history = (opts.history ?? []).slice(-10);
  const input: AgentInputItem[] = [
    ...toInputItems(history),
    {
      role: "user" as const,
      content: `# Current build context\n${snapshot.context}\n\n# Client's message\n${opts.message}`,
    },
  ];

  const result = await run(agent, input);
  return result.finalOutput?.trim() || snapshot.fallback;
}
