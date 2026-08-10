/**
 * The money gatekeeper — collected payments against a client.
 *
 * Every write here is `high` risk without exception. Recording a payment that
 * did not arrive corrupts revenue reporting quietly and is the kind of error
 * nobody notices until a reconciliation months later, so these are the actions
 * a reviewer should read rather than bulk-approve.
 *
 * Amounts cross the boundary in whole dollars because that is how a person
 * says them; they are stored in cents, like all money in this app.
 */

import { desc, eq, sum } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { agencyClients, clientPayments } from '@/db/schema';
import { formatCents, formatDay } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type ResourceRef,
} from '../contract';
import { applyOverlay } from '../overlay';

const PAYMENT_TYPES = ['setup_fee', 'monthly_retainer'] as const;

const TYPE_LABELS: Record<(typeof PAYMENT_TYPES)[number], string> = {
  setup_fee: 'Setup fee',
  monthly_retainer: 'Monthly retainer',
};

const PAYMENT_FIELDS = {
  id: clientPayments.id,
  clientId: clientPayments.clientId,
  paymentType: clientPayments.paymentType,
  method: clientPayments.method,
  amount: clientPayments.amount,
  paidAt: clientPayments.paidAt,
  notes: clientPayments.notes,
};

const listPayments = readOp<{ clientId: string }, unknown>({
  name: 'listClientPayments',
  description:
    'What a client has actually paid, most recent first. Amounts are in cents.',
  resourceKind: 'payment',
  guard: { kind: 'client', field: 'clientId' },
  scopeMode: 'resource',
  input: z.object({ clientId: z.string().uuid() }),
  async run(input, ctx) {
    const rows = await db
      .select(PAYMENT_FIELDS)
      .from(clientPayments)
      .where(eq(clientPayments.clientId, input.clientId))
      .orderBy(desc(clientPayments.paidAt));
    return applyOverlay(rows, ctx, 'payment').filter(
      (row) => row.clientId === input.clientId
    );
  },
});

const billingPosition = readOp<{ clientId: string }, unknown>({
  name: 'getBillingPosition',
  description:
    "A client's billing position: contracted fees, what has been collected, and when the next payment is due. Use this before saying anything about money.",
  resourceKind: 'payment',
  guard: { kind: 'client', field: 'clientId' },
  scopeMode: 'resource',
  input: z.object({ clientId: z.string().uuid() }),
  async run(input) {
    const [client] = await db
      .select({
        companyName: agencyClients.companyName,
        setupFee: agencyClients.setupFee,
        monthlyFee: agencyClients.monthlyFee,
        nextDueDate: agencyClients.nextDueDate,
        startDate: agencyClients.startDate,
      })
      .from(agencyClients)
      .where(eq(agencyClients.id, input.clientId))
      .limit(1);
    if (!client) return null;

    const [collected] = await db
      .select({ total: sum(clientPayments.amount) })
      .from(clientPayments)
      .where(eq(clientPayments.clientId, input.clientId));

    return {
      ...client,
      collectedCents: Number(collected?.total ?? 0),
      // Stated rather than left to be inferred: the agent reads this and would
      // otherwise have to guess the unit from magnitude alone.
      unit: 'cents',
    };
  },
});

const recordPayment = writeOp<
  {
    clientId: string;
    paymentType: (typeof PAYMENT_TYPES)[number];
    amountDollars: number;
    method?: string;
    paidOn?: string;
    notes?: string;
  },
  { id: string }
>({
  name: 'recordClientPayment',
  description:
    'Record money received from a client. Only do this when you have been told the payment actually landed — never to represent an invoice, an expectation, or a plan.',
  resourceKind: 'payment',
  guard: { kind: 'client', field: 'clientId' },
  risk: 'high',
  effect: 'create',
  input: z.object({
    clientId: z.string().uuid(),
    paymentType: z.enum(PAYMENT_TYPES),
    amountDollars: z.number().positive(),
    method: z.string().max(50).optional(),
    paidOn: z.string().optional(),
    notes: z.string().max(2000).optional(),
  }),
  async describe(input) {
    const company = await companyName(input.clientId);
    return `Record ${formatCents(Math.round(input.amountDollars * 100))} from ${company}`;
  },
  async preview(input) {
    return {
      changes: [
        {
          label: 'Amount',
          after: formatCents(Math.round(input.amountDollars * 100)),
        },
        { label: 'Type', after: TYPE_LABELS[input.paymentType] },
        { label: 'Method', after: input.method ?? 'zelle' },
        { label: 'Received', after: formatDay(input.paidOn ?? new Date()) },
      ],
      note: 'Counts toward revenue immediately once approved.',
    };
  },
  async simulate(input) {
    return {
      id: `pending-payment-${input.clientId}-${Math.round(input.amountDollars * 100)}`,
      clientId: input.clientId,
      paymentType: input.paymentType,
      method: input.method ?? 'zelle',
      amount: Math.round(input.amountDollars * 100),
      paidAt: input.paidOn ? new Date(input.paidOn) : new Date(),
      notes: input.notes ?? null,
    };
  },
  async execute(input, ctx) {
    const [row] = await db
      .insert(clientPayments)
      .values({
        clientId: input.clientId,
        paymentType: input.paymentType,
        method: input.method ?? 'zelle',
        amount: Math.round(input.amountDollars * 100),
        paidAt: input.paidOn ? new Date(input.paidOn) : new Date(),
        notes: input.notes ?? null,
        // Attributed to the human who approved it, not to Helix — money always
        // has a person's name against it.
        createdBy: ctx.userId,
      })
      .returning({ id: clientPayments.id });
    return row;
  },
});

async function companyName(clientId: string): Promise<string> {
  const [row] = await db
    .select({ companyName: agencyClients.companyName })
    .from(agencyClients)
    .where(eq(agencyClients.id, clientId))
    .limit(1);
  return row?.companyName ?? 'the client';
}

export const moneyGatekeeper = defineGatekeeper({
  name: 'money',
  resourceKind: 'payment',
  label: 'Payments',
  description:
    'What clients have paid and what they still owe. Every change here is significant.',
  ops: {
    listClientPayments: listPayments,
    getBillingPosition: billingPosition,
    recordClientPayment: recordPayment,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: clientPayments.id,
        amount: clientPayments.amount,
        paymentType: clientPayments.paymentType,
        company: agencyClients.companyName,
      })
      .from(clientPayments)
      .innerJoin(agencyClients, eq(clientPayments.clientId, agencyClients.id))
      .where(eq(clientPayments.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'payment',
      id: row.id,
      label: `${formatCents(row.amount)} — ${row.company}`,
      detail: TYPE_LABELS[row.paymentType],
    } satisfies ResourceRef;
  },
  // Payments are reached through their client; introducing them one at a time
  // would be busywork that buys no extra safety.
  async search() {
    return [];
  },
});
