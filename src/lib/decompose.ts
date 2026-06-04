import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import {
  blueprints,
  projects,
  projectPhases,
  tasks,
  taskDependencies,
  type BlueprintScopeItem,
} from "@/db/schema";
import { getAgentConfig } from "./agent-config";

const MODEL = process.env.OPENAI_BRIEF_MODEL ?? "gpt-5.5";

// The agent expresses the DAG with local string ids (e.g. "t1") so it can wire
// dependencies before real UUIDs exist. We resolve them on persist.
const planParameters = z.object({
  phases: z
    .array(
      z.object({
        name: z.string().describe("Short phase name, 2–4 words."),
        description: z.string().describe("1–2 sentences: the work + exit criteria."),
        tasks: z
          .array(
            z.object({
              localId: z.string().describe("Unique id within this plan, e.g. 't1'."),
              title: z.string(),
              description: z.string().describe("What to do, concretely."),
              kind: z.enum(["design", "build", "qa", "devops", "content", "research"]),
              acceptanceCriteria: z.string().describe("How we know it's done."),
              estimateHours: z.number().int().min(1).max(200),
              dependsOn: z
                .array(z.string())
                .describe("localIds of tasks that must finish first (can be in earlier phases)."),
            })
          )
          .min(1)
          .max(12),
      })
    )
    .min(3)
    .max(8),
});

const INSTRUCTIONS = `You are Fortitudo's senior delivery architect. Given an accepted Blueprint, decompose the build into a complete, executable work graph.

# Rules
- 3–8 phases from kickoff to launch; the last is launch/handover.
- Each phase contains the concrete tasks to complete it (1–12 each).
- Every task: a clear title, a concrete description, a kind, acceptance criteria, an hour estimate, and its dependencies (by localId).
- Model real dependencies — a task can depend on tasks in earlier phases. Don't invent circular deps.
- Be specific to the discipline and scope. No generic filler.`;

function plannerAgent(offerings: string) {
  return new Agent({
    name: "Fortitudo Decomposition Architect",
    instructions: `${INSTRUCTIONS}\n\n# What Fortitudo builds (context)\n${offerings}`,
    model: MODEL,
    outputType: planParameters,
    modelSettings: {
      promptCacheRetention: "24h",
      providerData: { prompt_cache_key: "fortitudo-decompose-v1" },
    },
  });
}

/**
 * Decompose a project's latest Blueprint into phases + a task DAG, replacing any
 * existing plan. Admin-triggered. Returns counts.
 */
export async function decomposeBuild(projectId: string): Promise<{ phases: number; tasks: number }> {
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
    scope.length ? `Scope:\n${scope.map((s) => `- ${s.title}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { offerings } = await getAgentConfig();
  const result = await run(plannerAgent(offerings), prompt);
  const plan = result.finalOutput;
  if (!plan?.phases?.length) throw new Error("The architect returned no plan.");

  // Replace any existing plan (phases cascade-delete their tasks; deps cascade too).
  await db.delete(projectPhases).where(eq(projectPhases.projectId, projectId));
  await db.delete(tasks).where(eq(tasks.projectId, projectId));

  // Insert phases, then tasks (tracking localId → real id), then dependencies.
  const localToReal = new Map<string, string>();
  let order = 0;
  let taskCount = 0;

  for (let pi = 0; pi < plan.phases.length; pi++) {
    const phase = plan.phases[pi];
    const [phaseRow] = await db
      .insert(projectPhases)
      .values({ projectId, name: phase.name, description: phase.description, order: pi, status: "pending" })
      .returning({ id: projectPhases.id });

    for (const t of phase.tasks) {
      const [taskRow] = await db
        .insert(tasks)
        .values({
          projectId,
          phaseId: phaseRow.id,
          title: t.title,
          description: t.description,
          kind: t.kind,
          acceptanceCriteria: t.acceptanceCriteria,
          estimateHours: t.estimateHours,
          status: "todo",
          order: order++,
        })
        .returning({ id: tasks.id });
      localToReal.set(t.localId, taskRow.id);
      taskCount++;
    }
  }

  // Wire dependencies now that every task has a real id.
  const edges: { taskId: string; dependsOnTaskId: string }[] = [];
  for (const phase of plan.phases) {
    for (const t of phase.tasks) {
      const taskId = localToReal.get(t.localId);
      if (!taskId) continue;
      for (const dep of t.dependsOn) {
        const depId = localToReal.get(dep);
        if (depId && depId !== taskId) edges.push({ taskId, dependsOnTaskId: depId });
      }
    }
  }
  if (edges.length) await db.insert(taskDependencies).values(edges);

  return { phases: plan.phases.length, tasks: taskCount };
}
