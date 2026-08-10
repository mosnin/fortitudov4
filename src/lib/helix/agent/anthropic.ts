/**
 * The model-backed driver.
 *
 * A manual tool-use loop rather than the SDK's tool runner: every call has to
 * pass through `callOp` so introductions are checked and writes are queued
 * rather than performed, and each turn is persisted as it goes. The runner's
 * per-turn hooks could carry that, but owning the loop keeps the one rule that
 * matters — nothing reaches the database without going through the runtime —
 * visible in a single function.
 */

import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { callOp } from '../runtime';
import { buildTools, systemPrompt, type HelixToolDef } from './tools';
import { requestIntroduction, type TurnDriverContext } from './index';

const MODEL = 'claude-opus-5';
/** Streaming, so this is headroom for thinking plus the reply, not a target. */
const MAX_TOKENS = 32_000;
/** Bounds a runaway loop; each pass is one model call plus its tool results. */
const MAX_PASSES = 12;

/**
 * The one tool that isn't a gatekeeper op: Helix asking for access it doesn't
 * have. Without it the model's only recourse on a missing introduction is to
 * guess an id, which the runtime would reject anyway.
 */
const REQUEST_INTRODUCTION: HelixToolDef = {
  name: 'requestIntroduction',
  description:
    'Ask the person you are working with for access to a resource this thread has not been introduced to. Use this instead of guessing an id. Say concretely which resource you need and why the task needs it.',
  input_schema: {
    type: 'object',
    properties: {
      resourceKind: {
        type: 'string',
        enum: ['client', 'project', 'task', 'invoice', 'payment', 'conversation', 'file', 'report', 'gadget'],
      },
      hint: {
        type: 'string',
        description: 'How to find it — a company name, a project name.',
      },
      reason: {
        type: 'string',
        description: 'One sentence: what you need it for.',
      },
    },
    required: ['resourceKind', 'hint', 'reason'],
    additionalProperties: false,
  },
};

export interface DriverResult {
  reply: string;
  thinking?: string;
  requested: { kind: string; hint: string; reason: string }[];
}

export async function runAnthropicTurn(
  driver: TurnDriverContext
): Promise<DriverResult> {
  const client = new Anthropic();
  const tools = [...buildTools(), REQUEST_INTRODUCTION];

  const messages: Anthropic.MessageParam[] = [
    ...driver.history.map(
      (turn): Anthropic.MessageParam => ({
        role: turn.role,
        content: turn.content,
      })
    ),
    { role: 'user', content: driver.message },
  ];

  const system = systemPrompt({
    scope: driver.ctx.scope,
    introduced: driver.ctx.introduced,
    pendingActions: driver.ctx.overlay.length,
  });

  const requested: DriverResult['requested'] = [];
  const thinkingParts: string[] = [];

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive', display: 'summarized' },
      output_config: { effort: 'high' },
      system,
      tools,
      messages,
    });
    const response = await stream.finalMessage();

    for (const block of response.content) {
      if (block.type === 'thinking' && block.thinking) {
        thinkingParts.push(block.thinking);
      }
    }

    // Safety classifiers can decline a request outright; `content` is empty or
    // partial, so read stop_reason before trusting it.
    if (response.stop_reason === 'refusal') {
      return {
        reply:
          "I can't help with that one. If it's a routine piece of agency work, tell me again in more concrete terms and I'll pick it up.",
        thinking: thinkingParts.join('\n\n') || undefined,
        requested,
      };
    }

    messages.push({ role: 'assistant', content: response.content });

    // A server-side tool ran out of its own iteration budget — re-send to let
    // it resume; no synthetic user turn.
    if (response.stop_reason === 'pause_turn') continue;

    if (response.stop_reason !== 'tool_use') {
      return {
        reply: textOf(response.content) || fallbackReply(response.stop_reason),
        thinking: thinkingParts.join('\n\n') || undefined,
        requested,
      };
    }

    const calls = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    // Tool calls in one assistant turn are independent, and their results must
    // come back together in a single user message — splitting them teaches the
    // model to stop calling tools in parallel.
    const results = await Promise.all(
      calls.map(async (call): Promise<Anthropic.ToolResultBlockParam> => {
        if (call.name === REQUEST_INTRODUCTION.name) {
          const input = call.input as {
            resourceKind: string;
            hint: string;
            reason: string;
          };
          requested.push({
            kind: input.resourceKind,
            hint: input.hint,
            reason: input.reason,
          });
          await requestIntroduction(
            driver.ctx,
            input.resourceKind,
            input.hint,
            input.reason
          );
          return {
            type: 'tool_result',
            tool_use_id: call.id,
            content:
              'Access request recorded. The person you are working with will see it and can grant or deny it. Carry on with anything that does not depend on it, then say what you are waiting on.',
          };
        }

        const outcome = await callOp(driver.ctx, call.name, call.input);
        return {
          type: 'tool_result',
          tool_use_id: call.id,
          content: JSON.stringify(
            outcome.ok ? outcome.result : { error: outcome.error }
          ),
          is_error: !outcome.ok,
        };
      })
    );

    messages.push({ role: 'user', content: results });
  }

  return {
    reply:
      'I worked through as much of that as I could in one go and stopped to check in. Tell me which part to carry on with.',
    thinking: thinkingParts.join('\n\n') || undefined,
    requested,
  };
}

function textOf(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

function fallbackReply(stopReason: string | null): string {
  return stopReason === 'max_tokens'
    ? 'That ran longer than one response allows. Ask me for a narrower slice of it and I will finish that part properly.'
    : 'I did not have anything to add there.';
}
