/**
 * The projects gatekeeper — Helix's access to delivery.
 *
 * A project is what the client bought; the phases under it are how far it has
 * got. Status changes are the write that matters here, and they are `high`
 * risk because moving a project to `completed` is what closes billing and
 * notifies the client.
 */

import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { projectPhases, projects, users } from '@/db/schema';
import { SERVICE_LABELS } from '@/lib/services';
import { joinWords } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type HelixContext,
  type ResourceRef,
} from '../contract';
import { applyOverlay, applyOverlayToOne } from '../overlay';

const PROJECT_STATUSES = [
  'onboarding',
  'payment_pending',
  'in_progress',
  'revision',
  'completed',
  'cancelled',
] as const;

const STATUS_LABELS: Record<(typeof PROJECT_STATUSES)[number], string> = {
  onboarding: 'Onboarding',
  payment_pending: 'Payment pending',
  in_progress: 'In progress',
  revision: 'In revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PROJECT_FIELDS = {
  id: projects.id,
  name: projects.name,
  serviceType: projects.serviceType,
  status: projects.status,
  currentPhase: projects.currentPhase,
  userId: projects.userId,
  createdAt: projects.createdAt,
};

function introducedIds(ctx: HelixContext): string[] {
  return ctx.introduced
    .filter((ref) => ref.kind === 'project')
    .map((ref) => ref.id);
}

async function loadProject(id: string, ctx: HelixContext) {
  const [row] = await db
    .select(PROJECT_FIELDS)
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return applyOverlayToOne(row ?? null, ctx, 'project');
}

const listProjects = readOp<
  { status?: (typeof PROJECT_STATUSES)[number] },
  unknown
>({
  name: 'listProjects',
  description:
    'List the projects this thread has been introduced to, newest first. Optionally filter by status.',
  resourceKind: 'project',
  scopeMode: 'collection',
  input: z.object({ status: z.enum(PROJECT_STATUSES).optional() }),
  async run(input, ctx) {
    const ids = introducedIds(ctx);
    if (ids.length === 0) return [];
    const filters = [inArray(projects.id, ids)];
    if (input.status) filters.push(eq(projects.status, input.status));
    const rows = await db
      .select(PROJECT_FIELDS)
      .from(projects)
      .where(and(...filters))
      .orderBy(desc(projects.createdAt));
    return applyOverlay(rows, ctx, 'project');
  },
});

const getProject = readOp<{ projectId: string }, unknown>({
  name: 'getProject',
  description:
    'Read one project with its phase checklist — the authoritative picture of how far delivery has got.',
  resourceKind: 'project',
  scopeMode: 'resource',
  input: z.object({ projectId: z.string().uuid() }),
  async run(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    if (!project) return null;
    const phases = await db
      .select({
        id: projectPhases.id,
        name: projectPhases.name,
        status: projectPhases.status,
        order: projectPhases.order,
      })
      .from(projectPhases)
      .where(eq(projectPhases.projectId, input.projectId))
      .orderBy(asc(projectPhases.order));
    return { ...project, phases };
  },
});

const setProjectStatus = writeOp<
  { projectId: string; status: (typeof PROJECT_STATUSES)[number]; reason?: string },
  { id: string; status: string }
>({
  name: 'setProjectStatus',
  description:
    'Change a project\'s status. Completing a project closes billing and notifies the client, so only do it when the work is genuinely delivered.',
  resourceKind: 'project',
  risk: 'high',
  effect: 'update',
  input: z.object({
    projectId: z.string().uuid(),
    status: z.enum(PROJECT_STATUSES),
    reason: z.string().optional(),
  }),
  async describe(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    return `Set ${project?.name ?? 'project'} to ${STATUS_LABELS[input.status]}`;
  },
  async preview(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    return {
      changes: [
        {
          label: 'Status',
          before: project ? STATUS_LABELS[project.status] : undefined,
          after: STATUS_LABELS[input.status],
        },
      ],
      note:
        input.status === 'completed'
          ? 'The client is notified and the project stops accruing work.'
          : input.status === 'cancelled'
            ? 'Cancelling is visible to the client on their portal.'
            : input.reason,
    };
  },
  async simulate(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    return { ...(project ?? {}), id: input.projectId, status: input.status };
  },
  async execute(input) {
    const [row] = await db
      .update(projects)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(projects.id, input.projectId))
      .returning({ id: projects.id, status: projects.status });
    return row;
  },
});

const advancePhase = writeOp<
  { projectId: string; phaseId: string },
  { id: string; currentPhase: number }
>({
  name: 'completeProjectPhase',
  description:
    'Mark one phase of a project complete and move the project to the next one.',
  resourceKind: 'project',
  risk: 'medium',
  effect: 'update',
  input: z.object({
    projectId: z.string().uuid(),
    phaseId: z.string().uuid(),
  }),
  async describe(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    const phase = await loadPhase(input.phaseId);
    return `Complete "${phase?.name ?? 'phase'}" on ${project?.name ?? 'project'}`;
  },
  async preview(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    const phase = await loadPhase(input.phaseId);
    const changes = [
      {
        label: phase?.name ?? 'Phase',
        before: 'In progress',
        after: 'Completed',
      },
    ];
    if (project) {
      changes.push({
        label: 'Current phase',
        before: String(project.currentPhase + 1),
        after: String(project.currentPhase + 2),
      });
    }
    return { changes };
  },
  async simulate(input, ctx) {
    const project = await loadProject(input.projectId, ctx);
    return {
      ...(project ?? {}),
      id: input.projectId,
      currentPhase: (project?.currentPhase ?? 0) + 1,
    };
  },
  async execute(input) {
    await db
      .update(projectPhases)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(projectPhases.id, input.phaseId));
    const [project] = await db
      .select({ currentPhase: projects.currentPhase })
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);
    const [row] = await db
      .update(projects)
      .set({
        currentPhase: (project?.currentPhase ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, input.projectId))
      .returning({ id: projects.id, currentPhase: projects.currentPhase });
    return row;
  },
});

async function loadPhase(id: string) {
  const [row] = await db
    .select({ id: projectPhases.id, name: projectPhases.name })
    .from(projectPhases)
    .where(eq(projectPhases.id, id))
    .limit(1);
  return row ?? null;
}

export const projectsGatekeeper = defineGatekeeper({
  name: 'projects',
  resourceKind: 'project',
  label: 'Projects',
  description:
    'Delivery: what was bought, which phase it is in, and whether it is done.',
  ops: {
    listProjects,
    getProject,
    setProjectStatus,
    completeProjectPhase: advancePhase,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: projects.id,
        name: projects.name,
        serviceType: projects.serviceType,
        status: projects.status,
      })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'project',
      id: row.id,
      label: row.name,
      detail: `${SERVICE_LABELS[row.serviceType]} · ${STATUS_LABELS[row.status]}`,
    } satisfies ResourceRef;
  },
  async search(query) {
    // On a client thread the reachable set is that client's own projects,
    // resolved through the portal account rather than by name matching.
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        serviceType: projects.serviceType,
        status: projects.status,
        ownerEmail: users.email,
      })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.createdAt))
      .limit(40);

    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) =>
        needle
          ? row.name.toLowerCase().includes(needle) ||
            (row.ownerEmail ?? '').toLowerCase().includes(needle)
          : true
      )
      .slice(0, 8)
      .map((row) => ({
        kind: 'project' as const,
        id: row.id,
        label: row.name,
        detail: joinWords([
          SERVICE_LABELS[row.serviceType],
          STATUS_LABELS[row.status],
        ]),
      }));
  },
});
