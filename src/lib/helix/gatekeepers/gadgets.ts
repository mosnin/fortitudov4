/**
 * The gadgets gatekeeper — Helix writing software.
 *
 * A gadget is a small private app: Helix writes the source, it runs sandboxed,
 * and the client sees it only if someone shares it. Creating one is `low` risk
 * because a draft gadget reaches nobody — it renders on an opaque origin with
 * no network and no credentials, so the worst a bad one does is look wrong to
 * the person who asked for it.
 *
 * Sharing is the write that matters, and it is `high`: that is the moment a
 * client sees it.
 */

import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { agencyClients, helixGadgetVersions, helixGadgets } from '@/db/schema';
import { truncate } from '@/lib/helix/format';
import { validateGadgetSource } from '@/lib/helix/gadgets/document';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type ResourceRef,
} from '../contract';

const SOURCE_SHAPE = z
  .record(z.string(), z.string())
  .describe(
    'Flat map of filename to contents. index.html is required; style.css and app.js are inlined if present. There is no bundler, no imports, and no network — write plain HTML, CSS and JS. The injected `helix` object gives you getState(), setState(next) and read(op, input).'
  );

const listGadgets = readOp<{ clientId?: string }, unknown>({
  name: 'listGadgets',
  description:
    'Gadgets that already exist, newest first. Check here before building something — it may already be built.',
  resourceKind: 'gadget',
  scopeMode: 'collection',
  input: z.object({ clientId: z.string().uuid().optional() }),
  async run(input, ctx) {
    const rows = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        summary: helixGadgets.summary,
        clientId: helixGadgets.clientId,
        version: helixGadgets.version,
        sharedWithClient: helixGadgets.sharedWithClient,
      })
      .from(helixGadgets)
      .where(eq(helixGadgets.ownerId, ctx.userId))
      .orderBy(desc(helixGadgets.updatedAt))
      .limit(50);
    return input.clientId
      ? rows.filter((row) => row.clientId === input.clientId)
      : rows;
  },
});

const readGadget = readOp<{ gadgetId: string }, unknown>({
  name: 'getGadgetSource',
  description:
    "Read a gadget's current source so you can change it. Always read before editing — you are editing a file, not writing one from memory.",
  resourceKind: 'gadget',
  scopeMode: 'resource',
  input: z.object({ gadgetId: z.string().uuid() }),
  async run(input) {
    const [row] = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        source: helixGadgets.source,
        version: helixGadgets.version,
      })
      .from(helixGadgets)
      .where(eq(helixGadgets.id, input.gadgetId))
      .limit(1);
    return row ?? null;
  },
});

const buildGadget = writeOp<
  {
    clientId: string;
    name: string;
    summary?: string;
    source: Record<string, string>;
  },
  { id: string }
>({
  name: 'buildGadget',
  description:
    'Write a small private app for a client — a tracker, a calculator, a dashboard. It runs sandboxed with no network access, so all data comes through helix.read(). It stays a draft nobody outside the agency can see until someone shares it.',
  resourceKind: 'gadget',
  guard: { kind: 'client', field: 'clientId' },
  risk: 'low',
  effect: 'create',
  input: z.object({
    clientId: z.string().uuid(),
    name: z.string().min(1).max(255),
    summary: z.string().max(1000).optional(),
    source: SOURCE_SHAPE,
  }),
  async describe(input) {
    return `Build "${input.name}"`;
  },
  async preview(input) {
    const files = Object.keys(input.source);
    return {
      changes: [
        { label: 'Gadget', after: input.name },
        { label: 'Files', after: files.join(', ') },
        ...(input.summary
          ? [{ label: 'Does', after: truncate(input.summary, 140) }]
          : []),
      ],
      note: 'Draft — sandboxed, and not visible to the client until shared.',
    };
  },
  async simulate(input) {
    const invalid = validateGadgetSource(input.source);
    // Failing here means the reviewer never sees an action that could not have
    // worked, which is the whole reason simulate runs the real validation.
    if (invalid) throw new Error(invalid);
    return {
      id: `pending-gadget-${input.clientId}-${input.name}`,
      name: input.name,
      summary: input.summary ?? null,
      clientId: input.clientId,
      version: 1,
      sharedWithClient: false,
    };
  },
  async execute(input, ctx) {
    const [row] = await db
      .insert(helixGadgets)
      .values({
        ownerId: ctx.userId,
        clientId: input.clientId,
        threadId: ctx.threadId,
        name: input.name,
        slug: input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80),
        summary: input.summary ?? null,
        source: input.source,
      })
      .returning({ id: helixGadgets.id });
    return row;
  },
});

const reviseGadget = writeOp<
  { gadgetId: string; source: Record<string, string>; note?: string },
  { id: string }
>({
  name: 'reviseGadget',
  description:
    "Replace a gadget's source. Read it first — this overwrites every file, so send the complete set, not a fragment. The version it replaces is kept and can be restored.",
  resourceKind: 'gadget',
  risk: 'medium',
  effect: 'update',
  input: z.object({
    gadgetId: z.string().uuid(),
    source: SOURCE_SHAPE,
    note: z.string().max(500).optional(),
  }),
  async describe(input) {
    const name = await gadgetName(input.gadgetId);
    return input.note
      ? `Revise ${name}: ${truncate(input.note, 60)}`
      : `Revise ${name}`;
  },
  async preview(input) {
    const [current] = await db
      .select({ source: helixGadgets.source, version: helixGadgets.version })
      .from(helixGadgets)
      .where(eq(helixGadgets.id, input.gadgetId))
      .limit(1);
    const before = Object.keys(
      (current?.source ?? {}) as Record<string, string>
    );
    const after = Object.keys(input.source);
    return {
      changes: [
        {
          label: 'Version',
          before: String(current?.version ?? 1),
          after: String((current?.version ?? 1) + 1),
        },
        { label: 'Files', before: before.join(', '), after: after.join(', ') },
      ],
      note: input.note ?? 'The version being replaced stays recoverable.',
    };
  },
  async simulate(input) {
    const invalid = validateGadgetSource(input.source);
    if (invalid) throw new Error(invalid);
    const [current] = await db
      .select({ version: helixGadgets.version })
      .from(helixGadgets)
      .where(eq(helixGadgets.id, input.gadgetId))
      .limit(1);
    return {
      id: input.gadgetId,
      version: (current?.version ?? 1) + 1,
    };
  },
  async execute(input, ctx) {
    const [current] = await db
      .select({ source: helixGadgets.source, version: helixGadgets.version })
      .from(helixGadgets)
      .where(eq(helixGadgets.id, input.gadgetId))
      .limit(1);
    if (!current) throw new Error('That gadget no longer exists.');

    await db.insert(helixGadgetVersions).values({
      gadgetId: input.gadgetId,
      version: current.version,
      source: current.source as object,
      note: input.note ?? null,
      createdBy: ctx.userId,
    });

    const [row] = await db
      .update(helixGadgets)
      .set({
        source: input.source,
        version: current.version + 1,
        updatedAt: new Date(),
      })
      .where(eq(helixGadgets.id, input.gadgetId))
      .returning({ id: helixGadgets.id });
    return row;
  },
});

const shareGadget = writeOp<
  { gadgetId: string; shared: boolean },
  { id: string }
>({
  name: 'shareGadgetWithClient',
  description:
    "Put a gadget on the client's portal, or take it back off. Only share something you would be happy for the client to open right now.",
  resourceKind: 'gadget',
  risk: 'high',
  effect: 'update',
  input: z.object({
    gadgetId: z.string().uuid(),
    shared: z.boolean(),
  }),
  async describe(input) {
    const name = await gadgetName(input.gadgetId);
    return input.shared
      ? `Share ${name} with the client`
      : `Take ${name} off the client's portal`;
  },
  async preview(input) {
    return {
      changes: [
        {
          label: 'Client can open it',
          before: input.shared ? 'No' : 'Yes',
          after: input.shared ? 'Yes' : 'No',
        },
      ],
      note: input.shared
        ? 'The client sees it on their portal as soon as this is approved.'
        : undefined,
    };
  },
  async simulate(input) {
    return { id: input.gadgetId, sharedWithClient: input.shared };
  },
  async execute(input) {
    const [row] = await db
      .update(helixGadgets)
      .set({
        sharedWithClient: input.shared,
        status: input.shared ? 'live' : 'draft',
        updatedAt: new Date(),
      })
      .where(eq(helixGadgets.id, input.gadgetId))
      .returning({ id: helixGadgets.id });
    return row;
  },
});

async function gadgetName(gadgetId: string): Promise<string> {
  const [row] = await db
    .select({ name: helixGadgets.name })
    .from(helixGadgets)
    .where(eq(helixGadgets.id, gadgetId))
    .limit(1);
  return row?.name ?? 'the gadget';
}

export const gadgetsGatekeeper = defineGatekeeper({
  name: 'gadgets',
  resourceKind: 'gadget',
  label: 'Gadgets',
  description:
    'Small private apps Helix writes — sandboxed, per client, shared only when you say so.',
  ops: {
    listGadgets,
    getGadgetSource: readGadget,
    buildGadget,
    reviseGadget,
    shareGadgetWithClient: shareGadget,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        version: helixGadgets.version,
        company: agencyClients.companyName,
      })
      .from(helixGadgets)
      .leftJoin(agencyClients, eq(helixGadgets.clientId, agencyClients.id))
      .where(eq(helixGadgets.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'gadget',
      id: row.id,
      label: row.name,
      detail: [row.company, `v${row.version}`].filter(Boolean).join(' · '),
    } satisfies ResourceRef;
  },
  async search(query, ctx) {
    const rows = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        version: helixGadgets.version,
        company: agencyClients.companyName,
      })
      .from(helixGadgets)
      .leftJoin(agencyClients, eq(helixGadgets.clientId, agencyClients.id))
      .where(eq(helixGadgets.ownerId, ctx.userId))
      .orderBy(desc(helixGadgets.updatedAt))
      .limit(30);
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => (needle ? row.name.toLowerCase().includes(needle) : true))
      .slice(0, 8)
      .map((row) => ({
        kind: 'gadget' as const,
        id: row.id,
        label: row.name,
        detail: [row.company, `v${row.version}`].filter(Boolean).join(' · '),
      }));
  },
});
