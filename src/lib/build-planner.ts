import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { blueprints, projects, projectPhases, type BlueprintScopeItem } from "@/db/schema";
import { getAgentConfig } from "./agent-config";

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

const planParameters = z.object({
  phases: z
    .array(
      z.object({
        name: z.string().describe("Short phase name, 2–4 words (e.g. 'Foundations & auth')."),
        description: z
          .string()
          .describe("1–2 sentences: the concrete work in this phase and its exit criteria."),
      })
    )
    .min(3)
    .max(8),
});

const INSTRUCTIONS = `You are Fortitudo's senior delivery architect. Given an accepted Blueprint, produce a phased build plan that an architect (and the studio's AI tooling) will execute.

# Rules
- Produce 3–8 phases, ordered from kickoff to launch.
- Each phase has a short name and a 1–2 sentence description covering the concrete work AND its exit criteria (what "done" means).
- Be specific to the discipline and the scope items — never generic boilerplate.
- Sequence sensibly: foundations/architecture first, then core capabilities, then integration/hardening, then launch.
- The final phase should be launch/handover.`;

function buildPlannerAgent(offerings: string) {
  return new Agent({
    name: "Fortitudo Build Planner",
    instructions: `${INSTRUCTIONS}\n\n# What Fortitudo builds (context)\n${offerings}`,
    model: MODEL,
    outputType: planParameters,
    modelSettings: {
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-planner-v1" },
    },
  });
}

/**
 * Turn a project's latest Blueprint into a phased build plan and write it to
 * project_phases (replacing the existing plan). Returns the phase count.
 */
export async function generateBuildPlan(projectId: string): Promise<{ count: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  setDefaultOpenAIKey(apiKey);

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) throw new Error("Project not found.");

  const [bp] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.projectId, projectId))
    .orderBy(desc(blueprints.createdAt))
    .limit(1);
  if (!bp) throw new Error("This project has no Blueprint to plan from.");

  const scope = (bp.scope ?? []) as BlueprintScopeItem[];
  const prompt = [
    `Discipline: ${project.serviceType}`,
    `Blueprint: ${bp.title}`,
    bp.summary ? `Summary: ${bp.summary}` : "",
    bp.estimatedTimeline ? `Target timeline: ${bp.estimatedTimeline}` : "",
    bp.architectureNotes ? `Architecture: ${bp.architectureNotes}` : "",
    scope.length
      ? `Scope:\n${scope.map((s) => `- ${s.title}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { offerings } = await getAgentConfig();
  const result = await run(buildPlannerAgent(offerings), prompt);
  const plan = result.finalOutput;
  if (!plan?.phases?.length) throw new Error("The planner returned no phases.");

  // Replace the existing plan with the freshly generated one.
  await db.delete(projectPhases).where(eq(projectPhases.projectId, projectId));
  await db.insert(projectPhases).values(
    plan.phases.map((p, i) => ({
      projectId,
      name: p.name,
      description: p.description,
      order: i,
      status: "pending" as const,
    }))
  );

  return { count: plan.phases.length };
}
