/**
 * The Helix agent loop.
 *
 * Pluggable by design: with `ANTHROPIC_API_KEY` set the thread is driven by a
 * real model; without one it falls back to a deterministic planner so every
 * flow in the product — introductions, the approval queue, the audit trail —
 * is exercisable in development and in tests without a network call.
 *
 * Both drivers go through `callOp`, so the introduction checks and the
 * simulate-then-approve contract hold identically either way.
 */

import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  helixActions,
  helixIntroductions,
  helixMessages,
  helixThreads,
} from '@/db/schema';
import { loadContext, recordEvent } from '../runtime';
import type { HelixContext, HelixResourceKind } from '../contract';
import { runAnthropicTurn } from './anthropic';
import { runScriptedTurn } from './scripted';
import { standingFor } from './standing';

export interface TurnResult {
  /** What Helix said, for the transcript. */
  reply: string;
  /** Actions queued during this turn. */
  queued: { id: string; summary: string; risk: string }[];
  /** Resources Helix asked to be introduced to. */
  requested: { kind: string; hint: string; reason: string }[];
  /** True when the deterministic planner answered rather than a model. */
  offline: boolean;
}

export interface TurnDriverContext {
  ctx: HelixContext;
  /** Prior turns, oldest first. */
  history: { role: 'user' | 'assistant'; content: string }[];
  message: string;
}

export function helixIsLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Run one turn: append the user's message, drive the agent, persist what it
 * said, and hand back the actions it queued.
 */
export async function runTurn(
  threadId: string,
  userId: string,
  message: string
): Promise<TurnResult> {
  const ctx = await loadContext(threadId, userId);
  const history = await loadHistory(threadId);

  const sequence = history.length;
  await db.insert(helixMessages).values({
    threadId,
    role: 'user',
    content: message,
    sequence,
  });

  const before = new Set(ctx.overlay.map((entry) => entry.id));

  const driver: TurnDriverContext = { ctx, history, message };
  const result = helixIsLive()
    ? await runAnthropicTurn(driver)
    : await runScriptedTurn(driver);

  const [assistant] = await db
    .insert(helixMessages)
    .values({
      threadId,
      role: 'assistant',
      content: result.reply,
      thinking: result.thinking ?? null,
      sequence: sequence + 1,
    })
    .returning({ id: helixMessages.id });

  // Attribute this turn's queued actions to the turn that proposed them, so
  // the approval queue can show the ask alongside the change.
  const queued = await db
    .select({
      id: helixActions.id,
      summary: helixActions.summary,
      risk: helixActions.risk,
    })
    .from(helixActions)
    .where(
      and(eq(helixActions.threadId, threadId), eq(helixActions.status, 'simulated'))
    )
    .orderBy(asc(helixActions.sequence));

  const fresh = queued.filter((action) => !before.has(action.id));
  if (fresh.length > 0) {
    await db
      .update(helixActions)
      .set({ messageId: assistant.id })
      .where(
        and(
          eq(helixActions.threadId, threadId),
          eq(helixActions.status, 'simulated')
        )
      );
  }

  await db
    .update(helixThreads)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
      standing: standingFor(ctx, fresh.length, result.requested.length),
      // The first thing a person says is a better thread title than anything
      // generated, and it stops the list reading as a wall of "New thread".
      ...(sequence === 0 ? { title: titleFrom(message) } : {}),
    })
    .where(eq(helixThreads.id, threadId));

  return {
    reply: result.reply,
    queued: fresh,
    requested: result.requested,
    offline: !helixIsLive(),
  };
}

async function loadHistory(threadId: string) {
  const rows = await db
    .select({ role: helixMessages.role, content: helixMessages.content })
    .from(helixMessages)
    .where(eq(helixMessages.threadId, threadId))
    .orderBy(asc(helixMessages.sequence));
  return rows.filter(
    (row): row is { role: 'user' | 'assistant'; content: string } =>
      row.role !== 'system'
  );
}

function titleFrom(message: string): string {
  const line = message.trim().split('\n')[0];
  return line.length > 70 ? `${line.slice(0, 69)}…` : line || 'New thread';
}

/**
 * Helix asking for access it does not have.
 *
 * This writes a real pending grant, not just an audit line. The request has to
 * be a row a person can act on — an event alone would mean Helix could ask and
 * nothing in the product could answer.
 *
 * The resource is named by a hint rather than an id, because the whole reason
 * Helix is asking is that it cannot see the thing well enough to identify it.
 * Whoever grants it picks the actual resource.
 */
export async function requestIntroduction(
  ctx: HelixContext,
  resourceKind: HelixResourceKind,
  hint: string,
  reason: string
): Promise<void> {
  const [existing] = await db
    .select({ id: helixIntroductions.id })
    .from(helixIntroductions)
    .where(
      and(
        eq(helixIntroductions.threadId, ctx.threadId),
        eq(helixIntroductions.status, 'requested'),
        eq(helixIntroductions.resourceKind, resourceKind),
        eq(helixIntroductions.resourceLabel, hint)
      )
    )
    .limit(1);

  // Asking twice for the same thing is not two requests.
  if (!existing) {
    await db.insert(helixIntroductions).values({
      threadId: ctx.threadId,
      resourceKind,
      // A placeholder until someone picks the real resource; the grant flow
      // overwrites it. Never used to authorise anything, because a request is
      // not a grant.
      resourceId: PENDING_RESOURCE_ID,
      resourceLabel: hint,
      status: 'requested',
      requestReason: reason,
      allowWrites: false,
    });
  }

  await recordEvent(ctx, {
    kind: 'introduction_requested',
    summary: `Helix asked for access to ${resourceKind} "${hint}": ${reason}`,
    byHelix: true,
    payload: { resourceKind, hint, reason },
  });
}

/**
 * The id a requested-but-ungranted introduction carries. The all-zero uuid is
 * chosen so that if this ever leaked into an authorisation check it would match
 * no real row rather than an arbitrary one.
 */
export const PENDING_RESOURCE_ID = '00000000-0000-0000-0000-000000000000';

export type { HelixContext };
