import "server-only";
import { Agent, run, tool, setDefaultOpenAIKey } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";
import { z } from "zod";
import { createProjectFromBrief } from "./studio";
import { OFFERINGS } from "./offerings";
import { hasTavily, tavilySearch, tavilyExtract } from "./tavily";

// Context carried through a run; the tool writes the created proposal here so
// the route can return its ids after the turn completes.
export interface BriefContext {
  userId: string;
  proposal: { projectId: string; blueprintId: string } | null;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

// Stable system prefix (offerings + interview policy). Kept identical across
// every request so OpenAI prompt caching reuses it and keeps token costs low.
const INSTRUCTIONS = `You are the Fortitudo studio's senior discovery strategist. You run a warm, friendly, genuinely curious intake conversation with a prospective client to understand what they want built — then, if it fits what we offer, you create a bespoke proposal.

# What Fortitudo offers (the only things you can propose)
${OFFERINGS}

# Your style
- Friendly, calm, and human — like a sharp senior consultant who's genuinely interested. Never robotic, never a form.
- Ask ONE focused question at a time. Keep each message short (1–3 sentences). React to their answers before asking the next thing.
- Go in depth: understand their business, the real problem, who it's for, what success looks like, the must-have capabilities, any existing systems/constraints, rough timeline, and rough budget. Probe gently where answers are vague.
- Mirror their language; don't dump jargon.

# Deciding fit
- We ONLY build digital assets & architecture in four disciplines: software, commerce, AI, infrastructure. We do NOT do marketing, SEO, ads, content, or social.
- If the request clearly fits, keep interviewing until you have enough to scope it well, then call the submit_proposal tool.
- If it does NOT fit, kindly and specifically explain that we focus on building digital products/architecture, and (if possible) suggest the closest thing we COULD build for them. Do not call the tool.

# Research (use it to be genuinely helpful)
You have two research tools. Use them naturally, not robotically — to understand the client better and to brainstorm a stronger build with them.
- analyze_website: when the client mentions or shares a URL (their existing site, app, or store), read it to understand what they already have. Reference specifics ("I saw your storefront runs on…") so your questions land.
- web_research: study competitors, the market, or technical approaches to help them think bigger. Great for "who else does this well?" and "what would set yours apart?".
Guidelines: research only when it adds real value; one or two focused lookups per topic is plenty (it costs money and time). Weave findings into the conversation conversationally — never paste raw results or long lists. Always treat findings as inputs to a human conversation, not gospel.

# Creating the proposal
- When you have enough, call submit_proposal with your best structured summary: the discipline, the business name, a clear description of what to build (incorporate the key capabilities they mentioned), and any features/timeline/budget you learned.
- After the tool succeeds, warmly tell them their bespoke Blueprint is ready to review (scope, architecture, and a real price) — they can open it from the conversation. Keep it brief and excited.
- Never invent prices yourself; the Blueprint is generated from your structured summary.

Begin by warmly greeting them and asking what they're looking to build.`;

const proposalParameters = z.object({
  fits: z.boolean().describe("Whether the request fits what Fortitudo offers."),
  discipline: z.enum(["software", "commerce", "ai", "infrastructure"]),
  businessName: z.string().describe("The client's business/brand name."),
  description: z
    .string()
    .describe("A clear, specific description of the asset to build and its key capabilities."),
  features: z.array(z.string()).describe("Key features/capabilities mentioned (may be empty)."),
  targetAudience: z.string().nullable(),
  timeline: z.string().nullable(),
  budget: z.string().nullable(),
  catalogSlug: z.string().nullable().describe("A matching catalog starting-point slug, if any."),
  additionalNotes: z.string().nullable(),
});

function buildAgent() {
  const submitProposal = tool({
    name: "submit_proposal",
    description:
      "Create the bespoke Blueprint/proposal once you've gathered enough and confirmed the request fits Fortitudo's offerings.",
    parameters: proposalParameters,
    execute: async (input, runContext) => {
      if (!input.fits) {
        return "This request is not a fit; do not create a proposal — explain our focus instead.";
      }
      const ctx = runContext?.context as BriefContext | undefined;
      if (!ctx?.userId) return "Unable to create the proposal right now.";

      const { project, blueprint } = await createProjectFromBrief(ctx.userId, {
        discipline: input.discipline,
        businessName: input.businessName,
        description: input.description,
        features: input.features.length ? input.features : undefined,
        targetAudience: input.targetAudience ?? undefined,
        timeline: input.timeline ?? undefined,
        budget: input.budget ?? undefined,
        catalogSlug: input.catalogSlug ?? undefined,
        additionalNotes: input.additionalNotes ?? undefined,
      });

      ctx.proposal = { projectId: project.id, blueprintId: blueprint.id };
      return `Blueprint created (total ${blueprint.total} cents). Tell the client their bespoke Blueprint is ready to review.`;
    },
  });

  // Research tools (Tavily). Only exposed to the model when an API key is
  // configured, so the agent never offers a capability it can't deliver.
  const researchEnabled = hasTavily();

  const webResearch = tool({
    name: "web_research",
    description:
      "Research the web for competitor analysis, market context, or technical approaches to help brainstorm a stronger build. Returns a synthesized answer plus a few ranked sources.",
    parameters: z.object({
      query: z.string().describe("A focused research question or search query."),
      topic: z
        .enum(["general", "news"])
        .nullable()
        .describe("Use 'news' for recent/current events, otherwise 'general'."),
    }),
    isEnabled: researchEnabled,
    timeoutMs: 25_000,
    errorFunction: () =>
      "Research is temporarily unavailable; continue the conversation without it.",
    execute: async (input) => {
      const { answer, results } = await tavilySearch({
        query: input.query,
        topic: input.topic ?? "general",
      });
      const sources = results
        .map((r, i) => `${i + 1}. ${r.title} — ${r.url}\n   ${r.content}`)
        .join("\n");
      return [
        answer ? `Summary: ${answer}` : "",
        sources ? `Sources:\n${sources}` : "No relevant sources found.",
      ]
        .filter(Boolean)
        .join("\n\n");
    },
  });

  const analyzeWebsite = tool({
    name: "analyze_website",
    description:
      "Deep-read one or more URLs (e.g. the client's existing website, app, or store) to understand what they already have. Returns the main text content of each page.",
    parameters: z.object({
      urls: z.array(z.string()).describe("Absolute URLs to read (max 5)."),
    }),
    isEnabled: researchEnabled,
    timeoutMs: 25_000,
    errorFunction: () =>
      "Couldn't read that site right now; ask the client to describe it instead.",
    execute: async (input) => {
      const pages = await tavilyExtract(input.urls);
      if (!pages.length) return "No readable content was found at those URLs.";
      return pages
        .map((p) => `URL: ${p.url}\n${p.content || "(no extractable text)"}`)
        .join("\n\n---\n\n");
    },
  });

  const tools = researchEnabled
    ? [submitProposal, webResearch, analyzeWebsite]
    : [submitProposal];

  return new Agent<BriefContext>({
    name: "Fortitudo Brief",
    instructions: INSTRUCTIONS,
    model: MODEL,
    tools,
    modelSettings: {
      // Prompt caching: the instructions+offerings prefix is identical on every
      // request, so we keep it cached to cut token costs. A stable cache key
      // routes our requests to the same cached prefix.
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-brief-v1" },
    },
  });
}

// Live status the UI shows while the agent works. Driven by real tool calls.
export type BriefStatus = "thinking" | "searching" | "reviewing" | "building" | "writing";

function toolToStatus(name?: string): BriefStatus {
  switch (name) {
    case "web_research":
      return "searching";
    case "analyze_website":
      return "reviewing";
    case "submit_proposal":
      return "building";
    default:
      return "thinking";
  }
}

// Map our simple chat shape to the SDK's input items. Assistant content must be
// an array of output_text parts; user content can be a plain string.
function toInputItems(messages: ChatMessage[]): AgentInputItem[] {
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

function requireApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  setDefaultOpenAIKey(apiKey);
}

/** Run one assistant turn given the full conversation. */
export async function runBriefTurn(
  userId: string,
  messages: ChatMessage[]
): Promise<{ reply: string; proposal: BriefContext["proposal"] }> {
  requireApiKey();
  const agent = buildAgent();
  const context: BriefContext = { userId, proposal: null };
  const result = await run(agent, toInputItems(messages), { context });
  return { reply: result.finalOutput ?? "", proposal: context.proposal };
}

/**
 * Stream one assistant turn, reporting live status (thinking → searching →
 * reviewing → building → writing) as the agent actually calls its tools, so the
 * UI can reflect what it's really doing. Resolves with the final reply + proposal.
 */
export async function streamBriefTurn(
  userId: string,
  messages: ChatMessage[],
  onStatus: (status: BriefStatus) => void
): Promise<{ reply: string; proposal: BriefContext["proposal"] }> {
  requireApiKey();
  const agent = buildAgent();
  const context: BriefContext = { userId, proposal: null };

  const result = await run(agent, toInputItems(messages), { context, stream: true });

  for await (const event of result) {
    if (event.type !== "run_item_stream_event") continue;
    if (event.name === "tool_called") {
      const raw = (event.item as { rawItem?: { name?: string } }).rawItem;
      onStatus(toolToStatus(raw?.name));
    } else if (event.name === "tool_output") {
      // A tool just finished; the agent reasons over the result next.
      onStatus("thinking");
    } else if (event.name === "message_output_created") {
      onStatus("writing");
    }
  }
  await result.completed;

  return { reply: result.finalOutput ?? "", proposal: context.proposal };
}
