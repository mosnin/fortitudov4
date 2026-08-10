/**
 * The tasks gatekeeper — Helix's access to the delivery checklist.
 *
 * Note the guards. A task is authorised by the *client* it belongs to, not by
 * itself: a task Helix is about to create has no id yet, so it could never
 * have been introduced. Introducing a client is what lets Helix work its
 * checklist, which is also how a human would think about it.
 */

import { and, asc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { agencyClients, clientTasks } from '@/db/schema';
import { CRM_STAGES, PRIORITY_LABELS, STAGE_LABELS } from '@/lib/crm';
import { formatDay, truncate } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type HelixContext,
  type ResourceRef,
} from '../contract';
import { applyOverlay } from '../overlay';

const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

const STATUS_LABELS: Record<(typeof TASK_STATUSES)[number], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

const TASK_FIELDS = {
  id: clientTasks.id,
  clientId: clientTasks.clientId,
  title: clientTasks.title,
  stage: clientTasks.stage,
  status: clientTasks.status,
  priority: clientTasks.priority,
  assigneeName: clientTasks.assigneeName,
  dueDate: clientTasks.dueDate,
  order: clientTasks.order,
  notes: clientTasks.notes,
};

function introducedClientIds(ctx: HelixContext): string[] {
  return ctx.introduced
    .filter((ref) => ref.kind === 'client')
    .map((ref) => ref.id);
}

type TaskRow = {
  id: string;
  clientId: string;
  title: string;
  status: (typeof TASK_STATUSES)[number];
  priority: (typeof TASK_PRIORITIES)[number];
  stage: (typeof CRM_STAGES)[number] | null;
  assigneeName: string | null;
  dueDate: Date | null;
  order: number;
  notes: string | null;
};

async function loadTask(
  id: string,
  ctx: HelixContext
): Promise<TaskRow | null> {
  const [row] = await db
    .select(TASK_FIELDS)
    .from(clientTasks)
    .where(eq(clientTasks.id, id))
    .limit(1);
  // A task Helix created earlier in this same thread exists only in the
  // overlay until someone approves it, so fall through to the pending set.
  const pool = row ? [row as TaskRow] : [];
  return (
    applyOverlay<TaskRow>(pool, ctx, 'task').find((task) => task.id === id) ??
    null
  );
}

const listTasks = readOp<
  {
    clientId: string;
    status?: (typeof TASK_STATUSES)[number];
    stage?: (typeof CRM_STAGES)[number];
  },
  unknown
>({
  name: 'listClientTasks',
  description:
    'List the delivery checklist for one client, in checklist order. Filter by status or pipeline stage.',
  resourceKind: 'task',
  guard: { kind: 'client', field: 'clientId' },
  scopeMode: 'resource',
  input: z.object({
    clientId: z.string().uuid(),
    status: z.enum(TASK_STATUSES).optional(),
    stage: z.enum(CRM_STAGES).optional(),
  }),
  async run(input, ctx) {
    const filters = [eq(clientTasks.clientId, input.clientId)];
    if (input.status) filters.push(eq(clientTasks.status, input.status));
    if (input.stage) filters.push(eq(clientTasks.stage, input.stage));
    const rows = await db
      .select(TASK_FIELDS)
      .from(clientTasks)
      .where(and(...filters))
      .orderBy(asc(clientTasks.order));
    return applyOverlay(rows, ctx, 'task').filter(
      (task) => task.clientId === input.clientId
    );
  },
});

const openWork = readOp<Record<string, never>, unknown>({
  name: 'listOpenWork',
  description:
    'Everything still open across every client this thread can see — the fastest way to answer "what needs doing".',
  resourceKind: 'task',
  guard: { kind: 'client', field: 'clientId' },
  scopeMode: 'collection',
  input: z.object({}),
  async run(_input, ctx) {
    const clientIds = introducedClientIds(ctx);
    if (clientIds.length === 0) return [];
    const rows = await db
      .select({ ...TASK_FIELDS, company: agencyClients.companyName })
      .from(clientTasks)
      .innerJoin(agencyClients, eq(clientTasks.clientId, agencyClients.id))
      .where(
        and(
          inArray(clientTasks.clientId, clientIds),
          inArray(clientTasks.status, ['pending', 'in_progress'])
        )
      )
      .orderBy(asc(clientTasks.dueDate), asc(clientTasks.order));
    return applyOverlay(rows, ctx, 'task');
  },
});

const createTask = writeOp<
  {
    clientId: string;
    title: string;
    stage?: (typeof CRM_STAGES)[number];
    priority?: (typeof TASK_PRIORITIES)[number];
    dueDate?: string;
    notes?: string;
  },
  { id: string }
>({
  name: 'createClientTask',
  description:
    'Add a task to a client\'s delivery checklist. Leave the assignee off — work is claimed by whoever picks it up.',
  resourceKind: 'task',
  guard: { kind: 'client', field: 'clientId' },
  risk: 'low',
  effect: 'create',
  input: z.object({
    clientId: z.string().uuid(),
    title: z.string().min(1).max(255),
    stage: z.enum(CRM_STAGES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  async describe(input) {
    const client = await loadClientName(input.clientId);
    return `Add "${truncate(input.title, 60)}" to ${client}`;
  },
  async preview(input) {
    const changes = [{ label: 'Task', after: input.title }];
    if (input.stage)
      changes.push({ label: 'Stage', after: STAGE_LABELS[input.stage] });
    if (input.priority)
      changes.push({ label: 'Priority', after: PRIORITY_LABELS[input.priority] });
    if (input.dueDate)
      changes.push({ label: 'Due', after: formatDay(input.dueDate) });
    return { changes, note: 'Seeded unassigned.' };
  },
  async simulate(input) {
    const [last] = await db
      .select({ order: clientTasks.order })
      .from(clientTasks)
      .where(eq(clientTasks.clientId, input.clientId))
      .orderBy(asc(clientTasks.order));
    return {
      // A stable placeholder id so later ops in the same turn can refer to the
      // task Helix believes it just made. It is replaced on execution.
      id: `pending-${input.clientId}-${input.title.length}-${Date.now()}`,
      clientId: input.clientId,
      title: input.title,
      stage: input.stage ?? null,
      status: 'pending' as const,
      priority: input.priority ?? ('medium' as const),
      assigneeName: null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      order: (last?.order ?? 0) + 1,
      notes: input.notes ?? null,
    };
  },
  async execute(input) {
    const [last] = await db
      .select({ order: clientTasks.order })
      .from(clientTasks)
      .where(eq(clientTasks.clientId, input.clientId))
      .orderBy(asc(clientTasks.order));
    const [row] = await db
      .insert(clientTasks)
      .values({
        clientId: input.clientId,
        title: input.title,
        stage: input.stage ?? null,
        priority: input.priority ?? 'medium',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes ?? null,
        order: (last?.order ?? 0) + 1,
      })
      .returning({ id: clientTasks.id });
    return row;
  },
});

const setTaskStatus = writeOp<
  {
    clientId: string;
    taskId: string;
    status: (typeof TASK_STATUSES)[number];
  },
  { id: string; status: string }
>({
  name: 'setTaskStatus',
  description:
    'Move a checklist task between pending, in progress and completed. Completing tasks is what advances a client\'s pipeline stage.',
  resourceKind: 'task',
  guard: { kind: 'client', field: 'clientId' },
  risk: 'low',
  effect: 'update',
  input: z.object({
    clientId: z.string().uuid(),
    taskId: z.string().uuid(),
    status: z.enum(TASK_STATUSES),
  }),
  async describe(input, ctx) {
    const task = await loadTask(input.taskId, ctx);
    return `Mark "${truncate(task?.title ?? 'task', 60)}" ${STATUS_LABELS[input.status].toLowerCase()}`;
  },
  async preview(input, ctx) {
    const task = await loadTask(input.taskId, ctx);
    return {
      changes: [
        {
          label: task?.title ?? 'Task',
          before: task ? STATUS_LABELS[task.status] : undefined,
          after: STATUS_LABELS[input.status],
        },
      ],
      note:
        input.status === 'completed'
          ? 'Completing the last task in a stage advances the client to the next one.'
          : undefined,
    };
  },
  async simulate(input, ctx) {
    const task = await loadTask(input.taskId, ctx);
    return { ...(task ?? {}), id: input.taskId, status: input.status };
  },
  async execute(input) {
    const [row] = await db
      .update(clientTasks)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(clientTasks.id, input.taskId))
      .returning({ id: clientTasks.id, status: clientTasks.status });
    return row;
  },
});

async function loadClientName(clientId: string): Promise<string> {
  const [row] = await db
    .select({ companyName: agencyClients.companyName })
    .from(agencyClients)
    .where(eq(agencyClients.id, clientId))
    .limit(1);
  return row?.companyName ?? 'the client';
}

export const tasksGatekeeper = defineGatekeeper({
  name: 'tasks',
  resourceKind: 'task',
  label: 'Checklists',
  description:
    'The delivery checklist under each client — what is done, what is next, what is late.',
  ops: {
    listClientTasks: listTasks,
    listOpenWork: openWork,
    createClientTask: createTask,
    setTaskStatus,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: clientTasks.id,
        title: clientTasks.title,
        status: clientTasks.status,
        company: agencyClients.companyName,
      })
      .from(clientTasks)
      .innerJoin(agencyClients, eq(clientTasks.clientId, agencyClients.id))
      .where(eq(clientTasks.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'task',
      id: row.id,
      label: row.title,
      detail: `${row.company} · ${STATUS_LABELS[row.status]}`,
    } satisfies ResourceRef;
  },
  // Tasks are reached through their client rather than introduced directly —
  // granting one task at a time would be busywork for no extra safety.
  async search() {
    return [];
  },
});
