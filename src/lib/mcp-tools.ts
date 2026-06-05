import "server-only";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  tasks,
  taskDependencies,
  taskSubmissions,
  projects,
  projectPhases,
  blueprints,
  type User,
} from "@/db/schema";

// MCP tools for Claude / Claude cowork. The caller is the API key's owner.
// Human-in-the-loop is enforced by the state machine: submit_task lands work in
// `in_review`, and only an admin (in the app) can mark it done.

function isStaff(u: User) {
  return u.role === "admin" || u.role === "team";
}

export const MCP_TOOLS = [
  {
    name: "list_projects",
    description: "List the builds you can access (name, discipline, status).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_tasks",
    description:
      "List actionable tasks. scope 'ready' returns only tasks whose dependencies are all done (workable now), ordered ready-first. Optionally filter by projectId.",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string", enum: ["ready", "mine", "all"] },
        projectId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_task",
    description:
      "Full context for one task: description, acceptance criteria, phase, Blueprint summary, what it's blocked by, and prior submissions/review notes.",
    inputSchema: {
      type: "object",
      properties: { taskId: { type: "string" } },
      required: ["taskId"],
      additionalProperties: false,
    },
  },
  {
    name: "claim_task",
    description: "Assign a task to yourself and move it to in_progress (only if it's ready).",
    inputSchema: {
      type: "object",
      properties: { taskId: { type: "string" } },
      required: ["taskId"],
      additionalProperties: false,
    },
  },
  {
    name: "submit_task",
    description:
      "Submit your work on a task for human review. Moves the task to in_review — an admin approves or requests changes. Never marks it done.",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        summary: { type: "string" },
        artifactUrl: { type: "string" },
      },
      required: ["taskId", "summary"],
      additionalProperties: false,
    },
  },
] as const;

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };
const text = (s: string, isError = false): ToolResult => ({ content: [{ type: "text", text: s }], isError });

// Compute, for a set of tasks, which dependency titles are not yet done.
async function blockedMap(taskIds: string[]): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  if (taskIds.length === 0) return m;
  const deps = await db.select().from(taskDependencies).where(inArray(taskDependencies.taskId, taskIds));
  const depIds = [...new Set(deps.map((d) => d.dependsOnTaskId))];
  const depTasks = depIds.length
    ? await db.select({ id: tasks.id, title: tasks.title, status: tasks.status }).from(tasks).where(inArray(tasks.id, depIds))
    : [];
  const byId = new Map(depTasks.map((d) => [d.id, d]));
  for (const d of deps) {
    const dep = byId.get(d.dependsOnTaskId);
    if (dep && dep.status !== "done") {
      const arr = m.get(d.taskId) ?? [];
      arr.push(dep.title);
      m.set(d.taskId, arr);
    }
  }
  return m;
}

export async function runMcpTool(principal: User, name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const staff = isStaff(principal);

  if (name === "list_projects") {
    const rows = staff
      ? await db.select({ id: projects.id, name: projects.name, serviceType: projects.serviceType, status: projects.status }).from(projects)
      : await db
          .select({ id: projects.id, name: projects.name, serviceType: projects.serviceType, status: projects.status })
          .from(projects)
          .where(eq(projects.userId, principal.id));
    return text(JSON.stringify(rows, null, 2));
  }

  if (!staff) return text("This tool is available to studio staff/agents only.", true);

  if (name === "list_tasks") {
    const scope = (args.scope as string) ?? "ready";
    const projectId = args.projectId as string | undefined;

    const conds = [ne(tasks.status, "done"), ne(tasks.status, "cancelled")];
    if (projectId) conds.push(eq(tasks.projectId, projectId));
    // Team members only see their own assigned tasks; admins see everything.
    if (principal.role !== "admin") conds.push(eq(tasks.assigneeId, principal.id));
    else if (scope === "mine") conds.push(eq(tasks.assigneeId, principal.id));

    const rows = await db.select().from(tasks).where(and(...conds));
    const blocked = await blockedMap(rows.map((r) => r.id));

    let list = rows.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      kind: t.kind,
      status: t.status,
      estimateHours: t.estimateHours,
      assigneeId: t.assigneeId,
      ready: !(blocked.get(t.id)?.length),
      blockedBy: blocked.get(t.id) ?? [],
    }));
    if (scope === "ready") list = list.filter((t) => t.ready);
    list.sort((a, b) => Number(b.ready) - Number(a.ready));
    return text(JSON.stringify(list, null, 2));
  }

  if (name === "get_task") {
    const id = args.taskId as string;
    const [t] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!t) return text("Task not found.", true);
    if (principal.role !== "admin" && t.assigneeId !== principal.id) {
      return text("That task isn't assigned to you.", true);
    }
    const [phase] = t.phaseId ? await db.select().from(projectPhases).where(eq(projectPhases.id, t.phaseId)) : [];
    const [bp] = await db.select().from(blueprints).where(eq(blueprints.projectId, t.projectId)).orderBy(desc(blueprints.createdAt)).limit(1);
    const subs = await db.select().from(taskSubmissions).where(eq(taskSubmissions.taskId, id)).orderBy(desc(taskSubmissions.createdAt)).limit(5);
    const blocked = (await blockedMap([id])).get(id) ?? [];

    const bundle = {
      id: t.id,
      title: t.title,
      description: t.description,
      kind: t.kind,
      status: t.status,
      acceptanceCriteria: t.acceptanceCriteria,
      estimateHours: t.estimateHours,
      ready: blocked.length === 0,
      blockedBy: blocked,
      phase: phase ? { name: phase.name, description: phase.description } : null,
      blueprint: bp ? { title: bp.title, summary: bp.summary, architectureNotes: bp.architectureNotes } : null,
      submissions: subs.map((s) => ({ summary: s.summary, status: s.status, reviewNotes: s.reviewNotes, artifactUrl: s.artifactUrl })),
    };
    return text(JSON.stringify(bundle, null, 2));
  }

  if (name === "claim_task") {
    const id = args.taskId as string;
    const [t] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!t) return text("Task not found.", true);
    // Non-admins can only claim work that's free or already theirs — no stealing
    // a task out from under another assignee.
    if (principal.role !== "admin" && t.assigneeId && t.assigneeId !== principal.id) {
      return text("That task is already assigned to someone else.", true);
    }
    const blocked = (await blockedMap([id])).get(id) ?? [];
    if (blocked.length) return text(`Task is blocked by: ${blocked.join(", ")}. Finish those first.`, true);
    await db
      .update(tasks)
      .set({ assigneeId: principal.id, status: t.status === "todo" ? "in_progress" : t.status, updatedAt: new Date() })
      .where(eq(tasks.id, id));
    return text(`Claimed "${t.title}". It's yours and in progress.`);
  }

  if (name === "submit_task") {
    const id = args.taskId as string;
    const summary = (args.summary as string)?.trim();
    if (!summary) return text("A summary of what you did is required.", true);
    const [t] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!t) return text("Task not found.", true);
    if (principal.role !== "admin" && t.assigneeId !== principal.id) {
      return text("That task isn't assigned to you.", true);
    }
    await db.insert(taskSubmissions).values({
      taskId: id,
      submittedBy: principal.id,
      summary,
      artifactUrl: (args.artifactUrl as string) || null,
    });
    await db.update(tasks).set({ status: "in_review", submittedAt: new Date(), updatedAt: new Date() }).where(eq(tasks.id, id));
    return text(`Submitted "${t.title}" for review. A human admin will approve it or request changes.`);
  }

  return text(`Unknown tool: ${name}`, true);
}
