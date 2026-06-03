import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { blueprints, projects, projectPhases, deliverables, type BlueprintScopeItem } from "@/db/schema";
import { OFFERINGS } from "./offerings";

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

const workPackage = z.object({
  summary: z.string().describe("One or two sentences on what this work package delivers."),
  tasks: z.array(z.string()).min(1).max(12).describe("Concrete, ordered tasks for this phase."),
  deliverableTitle: z.string().describe("Title for the deliverable document."),
  deliverableKind: z.enum(["document", "repo", "design", "other"]),
  documentMarkdown: z
    .string()
    .describe("The actual work product as markdown — specific and technical, not generic."),
});

const INSTRUCTIONS = `You are a senior build engineer at the Fortitudo studio, executing ONE phase of a live build. You are handed the Blueprint and the specific phase to work, and you produce a concrete work package an architect can review and build from.

# Output
- summary: what this work package delivers.
- tasks: the concrete, ordered tasks to complete THIS phase (not the whole project).
- a deliverable document (markdown) that does real work appropriate to the discipline and phase — e.g. a system architecture, data model/schema, API contract, component breakdown, implementation plan, or a test/QA plan. Be specific and technical. Reference the actual scope. Never produce generic filler.
- pick the most fitting deliverableKind (usually "document").

# What Fortitudo builds (context)
${OFFERINGS}`;

function buildExecutionAgent() {
  return new Agent({
    name: "Fortitudo Build Engineer",
    instructions: INSTRUCTIONS,
    model: MODEL,
    outputType: workPackage,
    modelSettings: {
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-builder-v1" },
    },
  });
}

/**
 * Run the execution agent on a single phase. Produces a draft deliverable
 * (status "draft", invisible to the client until an architect publishes it).
 */
export async function runPhaseAgent(
  projectId: string,
  phaseId: string
): Promise<{ summary: string; deliverableId: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  setDefaultOpenAIKey(apiKey);

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) throw new Error("Project not found.");

  const [phase] = await db
    .select()
    .from(projectPhases)
    .where(and(eq(projectPhases.id, phaseId), eq(projectPhases.projectId, projectId)));
  if (!phase) throw new Error("Phase not found.");

  const [bp] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.projectId, projectId))
    .orderBy(desc(blueprints.createdAt))
    .limit(1);

  const scope = (bp?.scope ?? []) as BlueprintScopeItem[];
  const prompt = [
    `Discipline: ${project.serviceType}`,
    bp ? `Blueprint: ${bp.title}` : "",
    bp?.summary ? `Summary: ${bp.summary}` : "",
    bp?.architectureNotes ? `Architecture: ${bp.architectureNotes}` : "",
    scope.length
      ? `Scope:\n${scope.map((s) => `- ${s.title}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}`
      : "",
    `\nPhase to execute now: ${phase.name}`,
    phase.description ? `Phase detail: ${phase.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await run(buildExecutionAgent(), prompt);
  const wp = result.finalOutput;
  if (!wp) throw new Error("The build agent returned nothing.");

  const [created] = await db
    .insert(deliverables)
    .values({
      projectId,
      kind: wp.deliverableKind,
      title: wp.deliverableTitle,
      description: wp.documentMarkdown,
      status: "draft", // internal until an architect publishes it
      metadata: { tasks: wp.tasks, summary: wp.summary, phaseId, generatedBy: "agent" },
    })
    .returning({ id: deliverables.id });

  return { summary: wp.summary, deliverableId: created.id };
}
