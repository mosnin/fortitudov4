/**
 * The offline driver.
 *
 * With no `ANTHROPIC_API_KEY` there is no model to drive the thread, but the
 * product around it — introductions, the simulated overlay, the approval queue,
 * the audit trail — still needs to be exercisable in development and in tests.
 * This planner matches a handful of intents and drives the same `callOp` path
 * a model would, so those flows are real rather than mocked.
 *
 * It is deliberately not clever, and it says so in its replies. It is a
 * harness, not a fallback anyone should ship a client onto.
 */

import 'server-only';
import { callOp } from '../runtime';
import { CRM_STAGES, STAGE_LABELS } from '@/lib/crm';
import type { DriverResult } from './anthropic';
import { requestIntroduction, type TurnDriverContext } from './index';

const OFFLINE_NOTE =
  'Helix is running without a model key, so this thread is driven by a small rule-based planner. The access checks, the simulation and the approval queue are the real ones.';

export async function runScriptedTurn(
  driver: TurnDriverContext
): Promise<DriverResult> {
  const { ctx } = driver;
  const text = driver.message.toLowerCase();
  const clients = ctx.introduced.filter((ref) => ref.kind === 'client');

  if (clients.length === 0) {
    await requestIntroduction(
      ctx,
      'client',
      driver.message.slice(0, 60),
      'Nothing has been introduced to this thread yet.'
    );
    return {
      reply: `I have not been introduced to anything yet, so there is nothing I can read or change. Introduce me to a client and ask again.\n\n${OFFLINE_NOTE}`,
      requested: [
        {
          kind: 'client',
          hint: driver.message.slice(0, 60),
          reason: 'This thread has no access yet.',
        },
      ],
    };
  }

  const client = clients[0];

  // "what's open", "status", "where are we"
  if (/\b(open|outstanding|status|where|what'?s left|todo)\b/.test(text)) {
    const outcome = await callOp(ctx, 'listClientTasks', {
      clientId: client.id,
      status: 'pending',
    });
    if (!outcome.ok) {
      return { reply: `${outcome.error}\n\n${OFFLINE_NOTE}`, requested: [] };
    }
    const tasks = (outcome.result ?? []) as { title: string }[];
    const body =
      tasks.length === 0
        ? `Nothing is pending on ${client.label}.`
        : `${tasks.length} open on ${client.label}:\n${tasks
            .slice(0, 8)
            .map((task) => `- ${task.title}`)
            .join('\n')}`;
    return { reply: `${body}\n\n${OFFLINE_NOTE}`, requested: [] };
  }

  // "move ... to build", "advance to launch"
  const stage = CRM_STAGES.find((candidate) =>
    text.includes(STAGE_LABELS[candidate].toLowerCase())
  );
  if (stage && /\b(move|advance|promote|stage|push)\b/.test(text)) {
    const outcome = await callOp(ctx, 'moveClientStage', {
      clientId: client.id,
      stage,
    });
    return {
      reply: outcome.ok
        ? `Queued: move ${client.label} to ${STAGE_LABELS[stage]}. It takes effect once someone approves it.\n\n${OFFLINE_NOTE}`
        : `${outcome.error}\n\n${OFFLINE_NOTE}`,
      requested: [],
    };
  }

  // "add a task to ..." / "we need to ..."
  const added = driver.message.match(/(?:add|create)(?: a)? task[:,]?\s*(.+)/i);
  if (added) {
    const title = added[1].trim().replace(/\.$/, '');
    const outcome = await callOp(ctx, 'createClientTask', {
      clientId: client.id,
      title,
    });
    return {
      reply: outcome.ok
        ? `Queued: add "${title}" to ${client.label}'s checklist, unassigned.\n\n${OFFLINE_NOTE}`
        : `${outcome.error}\n\n${OFFLINE_NOTE}`,
      requested: [],
    };
  }

  const outcome = await callOp(ctx, 'getClient', { clientId: client.id });
  const record = outcome.ok
    ? (outcome.result as { companyName?: string; stage?: string } | null)
    : null;

  return {
    reply: [
      record
        ? `${record.companyName ?? client.label} is at ${STAGE_LABELS[(record.stage ?? 'onboarding') as (typeof CRM_STAGES)[number]]}.`
        : `I can see ${client.label}.`,
      '',
      'Without a model key I only understand a few phrasings: ask what is open, ask me to move a client to a stage, or say "add task: …".',
      '',
      OFFLINE_NOTE,
    ].join('\n'),
    requested: [],
  };
}
