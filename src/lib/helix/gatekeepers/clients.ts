/**
 * The clients gatekeeper — Helix's access to the CRM.
 *
 * Reads run immediately, filtered to whatever the thread has been introduced
 * to. Writes are described, previewed and simulated here; the runtime decides
 * when (or whether) `execute` ever runs.
 */

import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { agencyClients } from '@/db/schema';
import { CRM_STAGES, PACKAGE_LABELS, STAGE_LABELS } from '@/lib/crm';
import { formatCents, joinWords, truncate } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type HelixContext,
  type ResourceRef,
} from '../contract';
import { applyOverlay, applyOverlayToOne } from '../overlay';

/** Ids of clients this thread may see. Empty means "introduce one first". */
function introducedIds(ctx: HelixContext): string[] {
  return ctx.introduced
    .filter((ref) => ref.kind === 'client')
    .map((ref) => ref.id);
}

const CLIENT_SUMMARY_FIELDS = {
  id: agencyClients.id,
  companyName: agencyClients.companyName,
  contactName: agencyClients.contactName,
  stage: agencyClients.stage,
  status: agencyClients.status,
  package: agencyClients.package,
  monthlyFee: agencyClients.monthlyFee,
  setupFee: agencyClients.setupFee,
  email: agencyClients.email,
  businessType: agencyClients.businessType,
  notes: agencyClients.notes,
  nextDueDate: agencyClients.nextDueDate,
  startDate: agencyClients.startDate,
};

async function loadClient(id: string, ctx: HelixContext) {
  const [row] = await db
    .select(CLIENT_SUMMARY_FIELDS)
    .from(agencyClients)
    .where(eq(agencyClients.id, id))
    .limit(1);
  return applyOverlayToOne(row ?? null, ctx, 'client');
}

const listClients = readOp<
  {
    stage?: (typeof CRM_STAGES)[number];
    status?: 'active' | 'paused' | 'churned';
    search?: string;
  },
  unknown
>({
  name: 'listClients',
  description:
    'List the clients this thread has been introduced to. Optionally filter by pipeline stage, status, or a text search over company and contact name.',
  resourceKind: 'client',
  scopeMode: 'collection',
  input: z.object({
    stage: z.enum(CRM_STAGES).optional(),
    status: z.enum(['active', 'paused', 'churned']).optional(),
    search: z.string().optional(),
  }),
  async run(input, ctx) {
    const ids = introducedIds(ctx);
    if (ids.length === 0) return [];
    const filters = [inArray(agencyClients.id, ids)];
    if (input.stage) {
      filters.push(eq(agencyClients.stage, input.stage));
    }
    if (input.status) {
      filters.push(eq(agencyClients.status, input.status));
    }
    if (input.search) {
      const q = `%${input.search}%`;
      filters.push(
        or(
          ilike(agencyClients.companyName, q),
          ilike(agencyClients.contactName, q)
        )!
      );
    }
    const rows = await db
      .select(CLIENT_SUMMARY_FIELDS)
      .from(agencyClients)
      .where(and(...filters))
      .orderBy(desc(agencyClients.updatedAt));
    return applyOverlay(rows, ctx, 'client');
  },
});

const getClient = readOp<{ clientId: string }, unknown>({
  name: 'getClient',
  description:
    'Read one client in full: contact, offering, fees, pipeline stage and notes.',
  resourceKind: 'client',
  scopeMode: 'resource',
  input: z.object({ clientId: z.string().uuid() }),
  async run(input, ctx) {
    return loadClient(input.clientId, ctx);
  },
});

const moveStage = writeOp<
  { clientId: string; stage: (typeof CRM_STAGES)[number] },
  { id: string; stage: string }
>({
  name: 'moveClientStage',
  description:
    'Move a client to a different stage of the delivery pipeline. Use when work genuinely reaches that stage, not to signal intent.',
  resourceKind: 'client',
  risk: 'medium',
  effect: 'update',
  input: z.object({
    clientId: z.string().uuid(),
    stage: z.enum(CRM_STAGES),
  }),
  async describe(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    return `Move ${client?.companyName ?? 'client'} to ${STAGE_LABELS[input.stage]}`;
  },
  async preview(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    return {
      changes: [
        {
          label: 'Stage',
          before: client ? STAGE_LABELS[client.stage] : undefined,
          after: STAGE_LABELS[input.stage],
        },
      ],
      note:
        input.stage === 'launched'
          ? 'Launching notifies the client and closes the build checklist.'
          : undefined,
    };
  },
  async simulate(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    return { ...(client ?? {}), id: input.clientId, stage: input.stage };
  },
  async execute(input) {
    const [row] = await db
      .update(agencyClients)
      .set({ stage: input.stage, updatedAt: new Date() })
      .where(eq(agencyClients.id, input.clientId))
      .returning({ id: agencyClients.id, stage: agencyClients.stage });
    return row;
  },
});

const updateClient = writeOp<
  {
    clientId: string;
    contactName?: string;
    email?: string;
    businessType?: string;
    monthlyFee?: number;
    setupFee?: number;
    notes?: string;
  },
  { id: string }
>({
  name: 'updateClient',
  description:
    'Change a client record. Fees are in whole dollars and are converted to cents on write. Only pass the fields that should change.',
  resourceKind: 'client',
  risk: 'medium',
  effect: 'update',
  input: z.object({
    clientId: z.string().uuid(),
    contactName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    businessType: z.string().optional(),
    monthlyFee: z.number().nonnegative().optional(),
    setupFee: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  }),
  async describe(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    const fields = changedFieldLabels(input);
    return `Update ${fields} on ${client?.companyName ?? 'client'}`;
  },
  async preview(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    const changes: { label: string; before?: string; after: string }[] = [];
    if (input.contactName)
      changes.push({
        label: 'Contact',
        before: client?.contactName,
        after: input.contactName,
      });
    if (input.email)
      changes.push({
        label: 'Email',
        before: client?.email ?? undefined,
        after: input.email,
      });
    if (input.businessType)
      changes.push({
        label: 'Industry',
        before: client?.businessType ?? undefined,
        after: input.businessType,
      });
    if (input.monthlyFee !== undefined)
      changes.push({
        label: 'Monthly',
        before: client ? formatCents(client.monthlyFee) : undefined,
        after: formatCents(input.monthlyFee * 100),
      });
    if (input.setupFee !== undefined)
      changes.push({
        label: 'Setup',
        before: client ? formatCents(client.setupFee) : undefined,
        after: formatCents(input.setupFee * 100),
      });
    if (input.notes)
      changes.push({ label: 'Notes', after: truncate(input.notes, 120) });
    return { changes };
  },
  async simulate(input, ctx) {
    const client = await loadClient(input.clientId, ctx);
    return { ...(client ?? {}), ...toColumns(input), id: input.clientId };
  },
  async execute(input) {
    const [row] = await db
      .update(agencyClients)
      .set({ ...toColumns(input), updatedAt: new Date() })
      .where(eq(agencyClients.id, input.clientId))
      .returning({ id: agencyClients.id });
    return row;
  },
});

function toColumns(input: {
  contactName?: string;
  email?: string;
  businessType?: string;
  monthlyFee?: number;
  setupFee?: number;
  notes?: string;
}) {
  const patch: Record<string, unknown> = {};
  if (input.contactName) patch.contactName = input.contactName;
  if (input.email) patch.email = input.email;
  if (input.businessType) patch.businessType = input.businessType;
  // Dollars in, cents stored — money is integer cents everywhere in this app.
  if (input.monthlyFee !== undefined)
    patch.monthlyFee = Math.round(input.monthlyFee * 100);
  if (input.setupFee !== undefined)
    patch.setupFee = Math.round(input.setupFee * 100);
  if (input.notes) patch.notes = input.notes;
  return patch;
}

function changedFieldLabels(input: Record<string, unknown>): string {
  const labels: Record<string, string> = {
    contactName: 'contact',
    email: 'email',
    businessType: 'industry',
    monthlyFee: 'monthly fee',
    setupFee: 'setup fee',
    notes: 'notes',
  };
  const names = Object.keys(input)
    .filter((key) => key !== 'clientId' && input[key] !== undefined)
    .map((key) => labels[key] ?? key);
  return names.length === 0 ? 'nothing' : joinWords(names);
}

export const clientsGatekeeper = defineGatekeeper({
  name: 'clients',
  resourceKind: 'client',
  label: 'Clients',
  description:
    'The CRM: who the agency works for, what they bought, and where their delivery stands.',
  ops: {
    listClients,
    getClient,
    moveClientStage: moveStage,
    updateClient,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: agencyClients.id,
        companyName: agencyClients.companyName,
        package: agencyClients.package,
        stage: agencyClients.stage,
      })
      .from(agencyClients)
      .where(eq(agencyClients.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'client',
      id: row.id,
      label: row.companyName,
      detail: `${PACKAGE_LABELS[row.package]} · ${STAGE_LABELS[row.stage]}`,
    } satisfies ResourceRef;
  },
  async search(query, ctx) {
    // A client-scoped thread can only ever reach its own record, whatever it
    // types — the ceiling is applied before the query, not after.
    const filters = ctx.clientId
      ? [eq(agencyClients.id, ctx.clientId)]
      : query
        ? [
            or(
              ilike(agencyClients.companyName, `%${query}%`),
              ilike(agencyClients.contactName, `%${query}%`)
            )!,
          ]
        : [];
    const rows = await db
      .select({
        id: agencyClients.id,
        companyName: agencyClients.companyName,
        package: agencyClients.package,
        stage: agencyClients.stage,
      })
      .from(agencyClients)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(agencyClients.updatedAt))
      .limit(8);
    return rows.map((row) => ({
      kind: 'client' as const,
      id: row.id,
      label: row.companyName,
      detail: `${PACKAGE_LABELS[row.package]} · ${STAGE_LABELS[row.stage]}`,
    }));
  },
});
