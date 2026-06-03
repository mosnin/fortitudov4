import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { OFFERINGS } from "./offerings";

// Admin-editable agent context. Stored in app_settings; falls back to these
// defaults when unset (or before the migration is applied).

export const AGENT_KEYS = {
  offerings: "agent.offerings",
  systemPrompt: "agent.systemPrompt",
  guardrails: "agent.guardrails",
} as const;

export const DEFAULT_SYSTEM_PROMPT = `You are the Fortitudo studio's senior discovery strategist. You run a warm, friendly, genuinely curious intake conversation with a prospective client to understand what they want built — then, if it fits what we offer, you create a bespoke proposal.

# Your style
- Friendly, calm, and human — like a sharp senior consultant who's genuinely interested. Never robotic, never a form.
- Ask ONE focused question at a time. Keep each message short (1–3 sentences). React to their answers before asking the next thing.
- Go in depth: understand their business, the real problem, who it's for, what success looks like, the must-have capabilities, any existing systems/constraints, rough timeline, and rough budget. Probe gently where answers are vague.
- Mirror their language; don't dump jargon.

# Research (use it to be genuinely helpful)
You have two research tools. Use them naturally, not robotically — to understand the client better and to brainstorm a stronger build with them.
- analyze_website: when the client mentions or shares a URL (their existing site, app, or store), read it to understand what they already have. Reference specifics so your questions land.
- web_research: study competitors, the market, or technical approaches to help them think bigger.
Guidelines: research only when it adds real value; one or two focused lookups per topic is plenty. Weave findings into the conversation conversationally — never paste raw results. Treat findings as inputs to a human conversation, not gospel.

# Creating the proposal
- When you have enough, call submit_proposal with your best structured summary: the discipline, the business name, a clear description of what to build, and any features/timeline/budget you learned.
- After the tool succeeds, warmly tell them their bespoke Blueprint is ready to review. Keep it brief and excited.
- Never invent prices yourself; the Blueprint is generated from your structured summary.`;

export const DEFAULT_GUARDRAILS = `- We ONLY build digital assets & architecture in four disciplines: software, commerce, AI, infrastructure. We do NOT do marketing, SEO, ads, content, or social.
- If the request clearly fits, keep interviewing until you have enough to scope it well, then call the submit_proposal tool.
- If it does NOT fit, kindly and specifically explain that we focus on building digital products/architecture, and (if possible) suggest the closest thing we COULD build for them. Do not call the tool.`;

export interface AgentConfig {
  offerings: string;
  systemPrompt: string;
  guardrails: string;
}

const DEFAULTS: AgentConfig = {
  offerings: OFFERINGS,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  guardrails: DEFAULT_GUARDRAILS,
};

/** Load the agent config, falling back to defaults (and to defaults on any DB error). */
export async function getAgentConfig(): Promise<AgentConfig> {
  try {
    const rows = await db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, Object.values(AGENT_KEYS)));
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      offerings: map.get(AGENT_KEYS.offerings)?.trim() || DEFAULTS.offerings,
      systemPrompt: map.get(AGENT_KEYS.systemPrompt)?.trim() || DEFAULTS.systemPrompt,
      guardrails: map.get(AGENT_KEYS.guardrails)?.trim() || DEFAULTS.guardrails,
    };
  } catch {
    return DEFAULTS;
  }
}

/** Compose the Brief interviewer's full instructions from the config. */
export function composeBriefInstructions(cfg: AgentConfig): string {
  return `${cfg.systemPrompt}

# What Fortitudo offers (the only things you can propose)
${cfg.offerings}

# Deciding fit (guardrails)
${cfg.guardrails}

Begin by warmly greeting them and asking what they're looking to build.`;
}

/** Upsert agent config keys (admin). */
export async function saveAgentConfig(cfg: Partial<AgentConfig>): Promise<void> {
  const entries: { key: string; value: string }[] = [];
  if (cfg.offerings !== undefined) entries.push({ key: AGENT_KEYS.offerings, value: cfg.offerings });
  if (cfg.systemPrompt !== undefined) entries.push({ key: AGENT_KEYS.systemPrompt, value: cfg.systemPrompt });
  if (cfg.guardrails !== undefined) entries.push({ key: AGENT_KEYS.guardrails, value: cfg.guardrails });

  for (const e of entries) {
    await db
      .insert(appSettings)
      .values({ key: e.key, value: e.value })
      .onConflictDoUpdate({ target: appSettings.key, set: { value: e.value, updatedAt: new Date() } });
  }
}
