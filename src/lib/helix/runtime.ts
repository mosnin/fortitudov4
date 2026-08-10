/**
 * The Helix runtime — the kernel.
 *
 * Every call the agent makes lands in `callOp`, which does four things in
 * order: check the thread was introduced to the resource, run the op, record
 * what happened, and — for writes — stop short of the database. A write is
 * simulated and queued as an Action; the agent is told it worked and moves on.
 * Nothing is committed until a human approves it in `approveActions`.
 *
 * That inversion is the product. See plans/helix-os.md.
 */

import 'server-only';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  helixActions,
  helixEvents,
  helixIntroductions,
  helixThreads,
  type HelixAction,
} from '@/db/schema';
import {
  guardOf,
  NotIntroducedError,
  ReadOnlyGrantError,
  type GrantedRef,
  type HelixContext,
  type HelixResourceKind,
  type OverlayEntry,
  type ReadOp,
  type WriteOp,
} from './contract';
import { markEffect } from './overlay';
import { findOp } from './registry';

export interface OpOutcome {
  ok: boolean;
  /** What the agent sees. For a queued write this is the simulated result. */
  result?: unknown;
  error?: string;
  /** Set when the call was queued rather than performed. */
  action?: { id: string; summary: string; risk: string };
}

/**
 * Assemble the context an op runs in: who is asking, what they've been
 * introduced to, and which simulated writes are still pending.
 */
export async function loadContext(
  threadId: string,
  userId: string
): Promise<HelixContext> {
  const [thread] = await db
    .select()
    .from(helixThreads)
    .where(eq(helixThreads.id, threadId))
    .limit(1);
  if (!thread) throw new Error(`No such thread: ${threadId}`);

  const grants = await db
    .select()
    .from(helixIntroductions)
    .where(
      and(
        eq(helixIntroductions.threadId, threadId),
        eq(helixIntroductions.status, 'granted')
      )
    );

  const refused = await db
    .select({
      resourceKind: helixIntroductions.resourceKind,
      resourceLabel: helixIntroductions.resourceLabel,
    })
    .from(helixIntroductions)
    .where(
      and(
        eq(helixIntroductions.threadId, threadId),
        eq(helixIntroductions.status, 'denied')
      )
    );

  const pending = await db
    .select()
    .from(helixActions)
    .where(
      and(
        eq(helixActions.threadId, threadId),
        inArray(helixActions.status, ['simulated', 'approved'])
      )
    )
    .orderBy(asc(helixActions.sequence));

  return {
    threadId,
    userId,
    scope: thread.scope,
    clientId: thread.clientId,
    introduced: grants.map(
      (grant): GrantedRef => ({
        kind: grant.resourceKind,
        id: grant.resourceId,
        label: grant.resourceLabel,
        allowWrites: grant.allowWrites,
      })
    ),
    denied: refused.map((row) => ({
      kind: row.resourceKind,
      label: row.resourceLabel,
    })),
    overlay: pending.map(
      (action): OverlayEntry => ({
        id: action.id,
        gatekeeper: action.gatekeeper,
        op: action.op,
        resourceKind: action.resourceKind,
        resourceId: action.resourceId,
        input: action.input as Record<string, unknown>,
        simulatedResult: action.simulatedResult,
        sequence: action.sequence,
      })
    ),
  };
}

/**
 * The id of the resource whose introduction authorises this call. Resolved
 * before any handler runs, so a gatekeeper never gets the chance to touch
 * something the thread was not introduced to.
 */
function guardIdFor(
  op: { resourceKind: HelixResourceKind; guard?: { kind: HelixResourceKind; field: string } },
  input: Record<string, unknown>
): string | null {
  const value = input[guardOf(op).field];
  return typeof value === 'string' ? value : null;
}

function grantFor(
  ctx: HelixContext,
  kind: HelixResourceKind,
  id: string
): GrantedRef | null {
  return ctx.introduced.find((ref) => ref.kind === kind && ref.id === id) ?? null;
}

export async function callOp(
  ctx: HelixContext,
  opName: string,
  rawInput: unknown
): Promise<OpOutcome> {
  const found = findOp(opName);
  if (!found) return { ok: false, error: `No such operation: ${opName}` };
  const { gatekeeper, op } = found;

  const parsed = op.input.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Invalid input for ${opName}: ${parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'input'} ${issue.message}`)
        .join('; ')}`,
    };
  }
  const input = parsed.data as Record<string, unknown>;

  try {
    if (op.kind === 'read') {
      return await runRead(ctx, gatekeeper.name, op as ReadOp, input);
    }
    return await runWrite(ctx, gatekeeper.name, op as WriteOp, input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'The operation failed.';
    return { ok: false, error: message };
  }
}

async function runRead(
  ctx: HelixContext,
  gatekeeperName: string,
  op: ReadOp,
  input: Record<string, unknown>
): Promise<OpOutcome> {
  const guard = guardOf(op);
  if (op.scopeMode === 'resource') {
    const id = guardIdFor(op, input);
    if (!id) {
      return { ok: false, error: `${op.name} needs a ${guard.field}.` };
    }
    if (!grantFor(ctx, guard.kind, id)) {
      throw new NotIntroducedError(
        guard.kind,
        id,
        'Ask to be introduced to it first.'
      );
    }
  }

  // A collection read carries no id to check; each gatekeeper filters to
  // `ctx.introduced` itself, which is why those ops return [] rather than
  // erroring on a thread that has been introduced to nothing.
  const result = await (op.run as (i: unknown, c: HelixContext) => Promise<unknown>)(
    input,
    ctx
  );

  await recordEvent(ctx, {
    kind: 'read',
    summary: `Read ${op.name}`,
    resourceKind: op.resourceKind,
    resourceId: guardIdFor(op, input),
    payload: { gatekeeper: gatekeeperName, op: op.name, input },
  });

  return { ok: true, result };
}

async function runWrite(
  ctx: HelixContext,
  gatekeeperName: string,
  op: WriteOp,
  input: Record<string, unknown>
): Promise<OpOutcome> {
  // Every write is authorised by an introduction — no exceptions. A creation
  // names its parent (a task is guarded by its client), which is why `guard`
  // exists at all: the row being created could never have been introduced.
  const guard = guardOf(op);
  const guardId = guardIdFor(op, input);
  if (!guardId) {
    return { ok: false, error: `${op.name} needs a ${guard.field}.` };
  }
  const grant = grantFor(ctx, guard.kind, guardId);
  if (!grant) {
    throw new NotIntroducedError(
      guard.kind,
      guardId,
      'Ask to be introduced to it first.'
    );
  }
  if (!grant.allowWrites) throw new ReadOnlyGrantError(guard.kind);

  const typed = op as unknown as WriteOp<Record<string, unknown>, { id: string }>;
  const [summary, preview, simulated] = await Promise.all([
    typed.describe(input, ctx),
    typed.preview(input, ctx),
    typed.simulate(input, ctx),
  ]);

  const sequence = ctx.overlay.length
    ? Math.max(...ctx.overlay.map((entry) => entry.sequence)) + 1
    : 0;

  const [action] = await db
    .insert(helixActions)
    .values({
      threadId: ctx.threadId,
      gatekeeper: gatekeeperName,
      op: op.name,
      resourceKind: op.resourceKind,
      resourceId: simulated.id ?? guardId,
      summary,
      risk: op.risk,
      input,
      simulatedResult: markEffect(simulated, op.effect) as unknown as object,
      preview: preview as unknown as object,
      sequence,
      status: 'simulated',
    })
    .returning();

  // Keep the in-memory context current so later ops in this same agent turn
  // read the world as it will be, not as it was.
  ctx.overlay.push({
    id: action.id,
    gatekeeper: gatekeeperName,
    op: op.name,
    resourceKind: op.resourceKind,
    resourceId: action.resourceId,
    input,
    simulatedResult: action.simulatedResult,
    sequence,
  });

  await recordEvent(ctx, {
    kind: 'action_simulated',
    summary,
    resourceKind: op.resourceKind,
    resourceId: action.resourceId,
    payload: { op: op.name, input, risk: op.risk },
    byHelix: true,
  });

  return {
    ok: true,
    result: {
      ...simulated,
      // The agent is told plainly that this is queued. It should carry on
      // rather than ask permission — that is the whole point — but it should
      // also not tell the client the thing is done.
      _status: 'queued_for_approval',
      _note:
        'Simulated. This will take effect once a human approves it. Continue working; do not claim it is already done.',
    },
    action: { id: action.id, summary, risk: op.risk },
  };
}

/**
 * Commit approved actions, oldest first. Order matters: a later action may
 * have been simulated against an earlier one's result, so executing out of
 * order can fail on constraints the agent never saw.
 */
export async function approveActions(
  actionIds: string[],
  userId: string
): Promise<{ executed: string[]; failed: { id: string; error: string }[] }> {
  if (actionIds.length === 0) return { executed: [], failed: [] };

  const rows = await db
    .select()
    .from(helixActions)
    .where(
      and(
        inArray(helixActions.id, actionIds),
        eq(helixActions.status, 'simulated')
      )
    )
    .orderBy(asc(helixActions.sequence));

  const executed: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const row of rows) {
    const result = await executeAction(row, userId);
    if (result.ok) executed.push(row.id);
    else failed.push({ id: row.id, error: result.error });
  }
  return { executed, failed };
}

async function executeAction(
  action: HelixAction,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const found = findOp(action.op);
  if (!found || found.op.kind !== 'write') {
    const error = `Operation ${action.op} is no longer available.`;
    await failAction(action, userId, error);
    return { ok: false, error };
  }

  // Rebuild the context minus this action, so `execute` reads committed state
  // rather than the overlay that produced the simulation.
  const ctx = await loadContext(action.threadId, userId);
  ctx.overlay = ctx.overlay.filter((entry) => entry.id !== action.id);

  const op = found.op as unknown as WriteOp<Record<string, unknown>, { id: string }>;
  try {
    const result = await op.execute(action.input as Record<string, unknown>, ctx);
    await db
      .update(helixActions)
      .set({
        status: 'executed',
        executedResult: result as unknown as object,
        reviewedBy: userId,
        reviewedAt: new Date(),
        executedAt: new Date(),
      })
      .where(eq(helixActions.id, action.id));
    await recordEvent(
      { threadId: action.threadId, userId } as HelixContext,
      {
        kind: 'action_executed',
        summary: action.summary,
        resourceKind: action.resourceKind,
        resourceId: action.resourceId,
        payload: { op: action.op },
      }
    );
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Execution failed.';
    await failAction(action, userId, message);
    return { ok: false, error: message };
  }
}

async function failAction(action: HelixAction, userId: string, error: string) {
  await db
    .update(helixActions)
    .set({
      status: 'failed',
      error,
      reviewedBy: userId,
      reviewedAt: new Date(),
    })
    .where(eq(helixActions.id, action.id));
  await recordEvent({ threadId: action.threadId, userId } as HelixContext, {
    kind: 'action_failed',
    summary: `${action.summary} — ${error}`,
    resourceKind: action.resourceKind,
    resourceId: action.resourceId,
  });
}

/**
 * Put a failed action back in the queue.
 *
 * Execution can fail for reasons that have nothing to do with the proposal —
 * a transient database error, a row a colleague was editing at the same
 * moment. Leaving those terminal loses an approved change with no way back,
 * which is the worst outcome this system can produce.
 *
 * It returns to `simulated` rather than re-executing, so a human approves it
 * again. The world may have moved since it was simulated, and re-running on a
 * button press would commit against state nobody re-read.
 */
export async function requeueActions(
  actionIds: string[],
  userId: string
): Promise<number> {
  if (actionIds.length === 0) return 0;
  const rows = await db
    .update(helixActions)
    .set({
      status: 'simulated',
      error: null,
      reviewedBy: null,
      reviewedAt: null,
    })
    .where(
      and(
        inArray(helixActions.id, actionIds),
        eq(helixActions.status, 'failed')
      )
    )
    .returning({
      id: helixActions.id,
      threadId: helixActions.threadId,
      summary: helixActions.summary,
    });

  for (const row of rows) {
    await recordEvent({ threadId: row.threadId, userId } as HelixContext, {
      kind: 'action_simulated',
      summary: `Requeued after failure: ${row.summary}`,
    });
  }
  return rows.length;
}

/** Drop actions from the overlay without committing them. */
export async function rejectActions(
  actionIds: string[],
  userId: string
): Promise<number> {
  if (actionIds.length === 0) return 0;
  const rows = await db
    .update(helixActions)
    .set({ status: 'rejected', reviewedBy: userId, reviewedAt: new Date() })
    .where(
      and(
        inArray(helixActions.id, actionIds),
        eq(helixActions.status, 'simulated')
      )
    )
    .returning({ id: helixActions.id, threadId: helixActions.threadId, summary: helixActions.summary });

  for (const row of rows) {
    await recordEvent({ threadId: row.threadId, userId } as HelixContext, {
      kind: 'action_rejected',
      summary: row.summary,
    });
  }
  return rows.length;
}

export async function recordEvent(
  ctx: Pick<HelixContext, 'threadId' | 'userId'>,
  event: {
    kind: (typeof helixEvents.kind.enumValues)[number];
    summary: string;
    resourceKind?: HelixResourceKind | null;
    resourceId?: string | null;
    payload?: unknown;
    byHelix?: boolean;
  }
): Promise<void> {
  await db.insert(helixEvents).values({
    threadId: ctx.threadId,
    kind: event.kind,
    actorId: ctx.userId,
    byHelix: event.byHelix ?? false,
    summary: event.summary.slice(0, 500),
    resourceKind: event.resourceKind ?? null,
    resourceId: event.resourceId ?? null,
    payload: (event.payload ?? null) as object | null,
  });
}
