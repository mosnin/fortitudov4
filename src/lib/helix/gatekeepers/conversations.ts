/**
 * The conversations gatekeeper — the client-facing message thread on a project.
 *
 * This is the only gatekeeper whose writes leave the building. A queued message
 * is not a database row a reviewer can shrug at: approving it sends words to a
 * client under the agency's name. So sending is `high` risk, and the preview
 * shows the message in full rather than a summary of it — you cannot approve
 * what you have not read.
 */

import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { messages, projects } from '@/db/schema';
import { truncate } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type ResourceRef,
} from '../contract';
import { applyOverlay } from '../overlay';

const MESSAGE_FIELDS = {
  id: messages.id,
  projectId: messages.projectId,
  role: messages.role,
  content: messages.content,
  read: messages.read,
  createdAt: messages.createdAt,
};

const readThread = readOp<{ projectId: string; limit?: number }, unknown>({
  name: 'readProjectMessages',
  description:
    "The message thread between the agency and the client on a project, oldest first. Read this before writing to a client so you match what has already been said.",
  resourceKind: 'conversation',
  guard: { kind: 'project', field: 'projectId' },
  scopeMode: 'resource',
  input: z.object({
    projectId: z.string().uuid(),
    limit: z.number().int().min(1).max(200).optional(),
  }),
  async run(input, ctx) {
    const rows = await db
      .select(MESSAGE_FIELDS)
      .from(messages)
      .where(eq(messages.projectId, input.projectId))
      .orderBy(asc(messages.createdAt))
      .limit(input.limit ?? 50);
    return applyOverlay(rows, ctx, 'conversation').filter(
      (row) => row.projectId === input.projectId
    );
  },
});

const sendMessage = writeOp<
  { projectId: string; content: string },
  { id: string }
>({
  name: 'sendClientMessage',
  description:
    "Write a message to the client on a project. This is outward-facing: once approved the client reads it as coming from the agency. Write it as the agency would — plain, specific, no hedging, no filler.",
  resourceKind: 'conversation',
  guard: { kind: 'project', field: 'projectId' },
  risk: 'high',
  effect: 'create',
  input: z.object({
    projectId: z.string().uuid(),
    content: z.string().min(1).max(4000),
  }),
  async describe(input) {
    const project = await projectName(input.projectId);
    return `Message the client on ${project}: "${truncate(input.content, 60)}"`;
  },
  async preview(input) {
    return {
      // The whole message, not a summary — a reviewer approving outward-facing
      // words needs to have read the actual words.
      changes: [{ label: 'Message', after: input.content }],
      note: 'Sent to the client on approval and visible on their portal.',
    };
  },
  async simulate(input) {
    return {
      id: `pending-message-${input.projectId}-${input.content.length}`,
      projectId: input.projectId,
      role: 'admin' as const,
      content: input.content,
      read: false,
      createdAt: new Date(),
    };
  },
  async execute(input, ctx) {
    const [row] = await db
      .insert(messages)
      .values({
        projectId: input.projectId,
        // Attributed to the person who approved it. A client should always be
        // able to name a human on the other end of a message.
        senderId: ctx.userId,
        role: 'admin',
        content: input.content,
      })
      .returning({ id: messages.id });
    return row;
  },
});

async function projectName(projectId: string): Promise<string> {
  const [row] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return row?.name ?? 'the project';
}

export const conversationsGatekeeper = defineGatekeeper({
  name: 'conversations',
  resourceKind: 'conversation',
  label: 'Client messages',
  description:
    'The message thread on each project. Anything written here reaches the client.',
  ops: {
    readProjectMessages: readThread,
    sendClientMessage: sendMessage,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: messages.id,
        content: messages.content,
        project: projects.name,
      })
      .from(messages)
      .innerJoin(projects, eq(messages.projectId, projects.id))
      .where(eq(messages.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'conversation',
      id: row.id,
      label: truncate(row.content, 50),
      detail: row.project,
    } satisfies ResourceRef;
  },
  // A conversation is reached by introducing its project.
  async search() {
    return [];
  },
});
