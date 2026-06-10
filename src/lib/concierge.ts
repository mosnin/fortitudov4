import "server-only";
import { Agent, run, tool, setDefaultOpenAIKey } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, blueprints, decisionRequests, revisionRequests, messages } from "@/db/schema";
import { getProjectProgress, getTaskGraph } from "./tasks";
import { getActivity, recordEvent } from "./activity";
import { searchMemory, memoryToContext } from "./memory";
import { notifyAdmins } from "./notify";
import { createIssue } from "./issues";

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

// The concierge answers from a snapshot of the build, and can take exactly two
// bounded actions on the client's behalf — both things the client can already
// do in the UI (request a revision, message the studio). Everything
// consequential (approving deliverables, answering decisions, changing scope)
// stays a human step. It never claims to have done more than that.
const INSTRUCTIONS = `You are the Fortitudo studio concierge — a warm, concise, always-available assistant for a client's bespoke build.

# Your job
- Answer the client's questions ("where are we?", "what's left?", "what needs me?") using ONLY the build context provided below. Do not invent status, dates, or work that isn't in the context.
- Be brief and calm. A few sentences or a short list. No filler, no hype.
- When the context doesn't contain the answer, say so plainly and suggest they message their architect.

# Actions you can take on the client's behalf
- request_revision — when the client clearly wants a change to the work, file a revision request. Say what you filed in your reply.
- message_studio — when the client wants to tell or ask their architect something, send it.
- report_issue — when the client reports something is broken or wrong, raise an issue. Pick a severity (low/medium/high/critical) that matches how they describe it.
Only take an action the client clearly asked for. If it's ambiguous, ask a quick clarifying question first. These actions route work to a human — you are not doing the work yourself.

# Hard boundaries
- You CANNOT approve or reject deliverables, answer or create decisions, change scope or price, mark anything done, or move the build forward. Those are human steps — point the client to their project page ("open the decision on your project page", "review the deliverable on your project page").
- Never claim to have changed the build itself or completed work — only that you filed a revision or sent a message.`;

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
export async function conciergeReply(opts: ConciergeOpts): Promise<{ reply: string; acted: boolean }> {
  const snapshot = await buildSnapshot(opts);
  if (!snapshot) {
    return { reply: "I couldn't find that build. If you think this is a mistake, message your architect.", acted: false };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Graceful, key-free path: deterministic build summary (read-only).
    return { reply: snapshot.fallback, acted: false };
  }

  setDefaultOpenAIKey(apiKey);

  // True once the concierge takes an action on the client's behalf, so the UI
  // can refresh to show the revision/message it just filed.
  let acted = false;

  // Bounded, client-safe actions — both are things the client can already do
  // in the UI; they just route work to a human. Bound to this client + build.
  const requestRevision = tool({
    name: "request_revision",
    description:
      "File a revision request on this build, on the client's behalf. Use only when the client clearly wants a change to the delivered work.",
    parameters: z.object({
      description: z.string().describe("A concise description of the change the client is asking for."),
    }),
    execute: async ({ description }) => {
      await db.insert(revisionRequests).values({ projectId: opts.projectId, userId: opts.userId, description });
      await recordEvent({
        projectId: opts.projectId,
        actorId: opts.userId,
        kind: "revision_requested",
        summary: `Revision requested (via concierge): ${description.slice(0, 120)}`,
      });
      await notifyAdmins(
        {
          projectId: opts.projectId,
          type: "phase_update",
          title: "New revision request",
          body: description.slice(0, 140),
          actionUrl: `/admin/projects/${opts.projectId}`,
        },
        opts.userId
      );
      acted = true;
      return "Revision request filed and the studio has been notified.";
    },
  });

  const messageStudio = tool({
    name: "message_studio",
    description:
      "Send a message to the client's architect/studio, on the client's behalf. Use when the client wants to tell or ask the studio something.",
    parameters: z.object({
      content: z.string().describe("The message to send to the studio."),
    }),
    execute: async ({ content }) => {
      await db.insert(messages).values({ projectId: opts.projectId, senderId: opts.userId, role: "client", content });
      await recordEvent({
        projectId: opts.projectId,
        actorId: opts.userId,
        kind: "message",
        summary: "Client messaged the studio (via concierge)",
      });
      await notifyAdmins(
        {
          projectId: opts.projectId,
          type: "message_received",
          title: "New client message",
          body: content.slice(0, 140),
          actionUrl: `/admin/messages?project=${opts.projectId}`,
        },
        opts.userId
      );
      acted = true;
      return "Message sent to your architect.";
    },
  });

  const reportIssue = tool({
    name: "report_issue",
    description:
      "Raise an issue on this build when the client reports something is broken, wrong, or blocking. Choose a severity that matches.",
    parameters: z.object({
      title: z.string().describe("A short title for the problem."),
      description: z.string().nullable().describe("More detail about the problem, or null."),
      severity: z.enum(["low", "medium", "high", "critical"]).describe("How serious the problem is."),
    }),
    execute: async ({ title, description, severity }) => {
      await createIssue({
        projectId: opts.projectId,
        raisedBy: opts.userId,
        title,
        description: description ?? null,
        severity,
        viaAgent: true,
      });
      acted = true;
      return `Issue raised (${severity}) and the studio has been notified.`;
    },
  });

  const agent = new Agent({
    name: "Fortitudo Concierge",
    instructions: INSTRUCTIONS,
    model: MODEL,
    tools: [requestRevision, messageStudio, reportIssue],
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
  return { reply: result.finalOutput?.trim() || snapshot.fallback, acted };
}
