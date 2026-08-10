/**
 * The agent's tool surface — every registered gatekeeper op, projected into
 * Anthropic tool definitions.
 *
 * The op's own `description` is what the model reads to choose, so gatekeepers
 * write those for the agent rather than for a human. Write ops carry an extra
 * line making the deferred-approval contract explicit: the call will be queued,
 * not performed, and Helix must not claim otherwise.
 */

import { z } from 'zod';
import { allOps } from '../registry';
import { guardOf, type AnyOp } from '../contract';

export interface HelixToolDef {
  name: string;
  description: string;
  /** Matches the Messages API tool shape — always a JSON Schema object node. */
  input_schema: { type: 'object'; [key: string]: unknown };
}

const QUEUE_NOTE =
  'This is a change, so it will be simulated and queued for a human to approve rather than applied immediately. You will get the result you would have got, and should carry on working — but never tell anyone the change is already live.';

export function buildTools(): HelixToolDef[] {
  return allOps().map(({ op }) => ({
    name: op.name,
    description: describeOp(op),
    input_schema: z.toJSONSchema(op.input) as HelixToolDef['input_schema'],
  }));
}

function describeOp(op: AnyOp): string {
  const guard = guardOf(op);
  const access = `Requires the thread to have been introduced to the ${guard.kind} named by \`${guard.field}\`.`;
  return op.kind === 'write'
    ? `${op.description}\n\n${access}\n\n${QUEUE_NOTE}`
    : `${op.description}\n\n${access}`;
}

/**
 * What the model is told about the world it operates in. Deliberately short:
 * the ops carry their own instructions, and a long preamble here would be
 * re-read on every turn for no gain.
 */
export function systemPrompt(context: {
  scope: 'agency' | 'client';
  introduced: { kind: string; label: string; allowWrites: boolean }[];
  pendingActions: number;
}): string {
  const lines: string[] = [
    'You are Helix, the delivery agent for Fortitudo — a digital agency that builds websites, software solutions, AI solutions, consultation engagements and digital marketing programmes.',
    '',
    'You do the work. You are not a chat assistant that describes what someone else should do: when a request maps onto your tools, use them.',
    '',
    '# Access',
    'You start every thread with access to nothing. A person introduces you to a client, a project, or another resource, and only then can you read or change it. If you need something you have not been introduced to, say plainly which resource you need and why — do not guess at ids.',
    '',
    '# Changes',
    'Your changes are simulated and queued for a human to approve. That is deliberate, and it means you should keep working rather than stopping to ask permission. Two rules follow from it:',
    '- Do not ask "shall I go ahead?" before a change. Make it; the human reviews the queue.',
    '- Do not report a queued change as done. Say what you have queued.',
    '',
    '# Communicating',
    'Lead with the outcome. Keep responses focused and brief — a sentence or two for routine work, more only when the substance needs it. Write in complete sentences; skip preambles, and do not narrate routine tool calls.',
  ];

  if (context.scope === 'client') {
    lines.push(
      '',
      '# This thread',
      'You are talking to a client about their own engagement. Discuss their project only. Never mention other clients, internal margins, staffing, or anything from the agency side of the business.'
    );
  }

  if (context.introduced.length > 0) {
    lines.push('', '# Introduced in this thread');
    for (const ref of context.introduced) {
      lines.push(
        `- ${ref.kind}: ${ref.label}${ref.allowWrites ? '' : ' (read-only)'}`
      );
    }
  } else {
    lines.push(
      '',
      '# Introduced in this thread',
      'Nothing yet. Ask to be introduced to whatever the work needs.'
    );
  }

  if (context.pendingActions > 0) {
    lines.push(
      '',
      `${context.pendingActions} change${context.pendingActions === 1 ? '' : 's'} you made earlier ${context.pendingActions === 1 ? 'is' : 'are'} still waiting for approval. Your reads already reflect them.`
    );
  }

  return lines.join('\n');
}
