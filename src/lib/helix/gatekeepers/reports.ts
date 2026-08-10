/**
 * The reports gatekeeper — the weekly performance loop.
 *
 * These exist for digital-marketing engagements only. Every op here checks the
 * client's offering first and refuses otherwise, rather than trusting the
 * agent to remember: a weekly leads-and-spend report against a websites client
 * is meaningless, and would read to that client as though we had been running
 * ads they never bought.
 */

import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { agencyClients, weeklyReports } from '@/db/schema';
import { formatCents, formatDay } from '@/lib/helix/format';
import {
  defineGatekeeper,
  readOp,
  writeOp,
  type ResourceRef,
} from '../contract';
import { applyOverlay } from '../overlay';

const REPORT_FIELDS = {
  id: weeklyReports.id,
  clientId: weeklyReports.clientId,
  weekStart: weeklyReports.weekStart,
  weekEnd: weeklyReports.weekEnd,
  leads: weeklyReports.leads,
  cpl: weeklyReports.cpl,
  totalSpend: weeklyReports.totalSpend,
  closes: weeklyReports.closes,
  revenue: weeklyReports.revenue,
  status: weeklyReports.status,
};

/** Throws unless the client is actually on a digital-marketing engagement. */
async function assertMarketingClient(clientId: string): Promise<string> {
  const [client] = await db
    .select({
      companyName: agencyClients.companyName,
      package: agencyClients.package,
    })
    .from(agencyClients)
    .where(eq(agencyClients.id, clientId))
    .limit(1);
  if (!client) throw new Error('No such client.');
  if (client.package !== 'digital_marketing') {
    throw new Error(
      `${client.companyName} is on ${client.package.replace(/_/g, ' ')}, not digital marketing. Weekly performance reports only exist for marketing engagements.`
    );
  }
  return client.companyName;
}

const listReports = readOp<{ clientId: string }, unknown>({
  name: 'listWeeklyReports',
  description:
    'Weekly performance reports for a digital-marketing client, newest first. Spend and cost-per-lead are in cents. Only valid for marketing engagements.',
  resourceKind: 'report',
  guard: { kind: 'client', field: 'clientId' },
  scopeMode: 'resource',
  input: z.object({ clientId: z.string().uuid() }),
  async run(input, ctx) {
    await assertMarketingClient(input.clientId);
    const rows = await db
      .select(REPORT_FIELDS)
      .from(weeklyReports)
      .where(eq(weeklyReports.clientId, input.clientId))
      .orderBy(desc(weeklyReports.weekStart));
    return applyOverlay(rows, ctx, 'report').filter(
      (row) => row.clientId === input.clientId
    );
  },
});

const draftReport = writeOp<
  {
    clientId: string;
    weekStart: string;
    weekEnd: string;
    leads: number;
    spendDollars: number;
  },
  { id: string }
>({
  name: 'draftWeeklyReport',
  description:
    "Start a week's performance report with the agency-side numbers: leads generated and ad spend. The client completes it with their closes and revenue, which is what produces true ROAS. Spend is in whole dollars.",
  resourceKind: 'report',
  guard: { kind: 'client', field: 'clientId' },
  risk: 'medium',
  effect: 'create',
  input: z.object({
    clientId: z.string().uuid(),
    weekStart: z.string(),
    weekEnd: z.string(),
    leads: z.number().int().nonnegative(),
    spendDollars: z.number().nonnegative(),
  }),
  async describe(input) {
    const company = await assertMarketingClient(input.clientId);
    return `Draft ${company}'s report for the week of ${formatDay(input.weekStart)}`;
  },
  async preview(input) {
    const spendCents = Math.round(input.spendDollars * 100);
    const cpl = input.leads > 0 ? Math.round(spendCents / input.leads) : 0;
    return {
      changes: [
        {
          label: 'Week',
          after: `${formatDay(input.weekStart)} – ${formatDay(input.weekEnd)}`,
        },
        { label: 'Leads', after: String(input.leads) },
        { label: 'Spend', after: formatCents(spendCents) },
        {
          label: 'Cost per lead',
          after: input.leads > 0 ? formatCents(cpl) : '—',
        },
      ],
      note: 'Lands on the client portal for them to add closes and revenue.',
    };
  },
  async simulate(input) {
    const spendCents = Math.round(input.spendDollars * 100);
    return {
      id: `pending-report-${input.clientId}-${input.weekStart}`,
      clientId: input.clientId,
      weekStart: new Date(input.weekStart),
      weekEnd: new Date(input.weekEnd),
      leads: input.leads,
      cpl: input.leads > 0 ? Math.round(spendCents / input.leads) : 0,
      totalSpend: spendCents,
      closes: null,
      revenue: null,
      status: 'pending_client' as const,
    };
  },
  async execute(input, ctx) {
    await assertMarketingClient(input.clientId);
    const spendCents = Math.round(input.spendDollars * 100);
    const [row] = await db
      .insert(weeklyReports)
      .values({
        clientId: input.clientId,
        weekStart: new Date(input.weekStart),
        weekEnd: new Date(input.weekEnd),
        leads: input.leads,
        cpl: input.leads > 0 ? Math.round(spendCents / input.leads) : 0,
        totalSpend: spendCents,
        status: 'pending_client',
        createdBy: ctx.userId,
      })
      .returning({ id: weeklyReports.id });
    return row;
  },
});

export const reportsGatekeeper = defineGatekeeper({
  name: 'reports',
  resourceKind: 'report',
  label: 'Weekly reports',
  description:
    'Leads, spend and true ROAS — digital-marketing engagements only.',
  ops: {
    listWeeklyReports: listReports,
    draftWeeklyReport: draftReport,
  } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: weeklyReports.id,
        weekStart: weeklyReports.weekStart,
        status: weeklyReports.status,
        company: agencyClients.companyName,
      })
      .from(weeklyReports)
      .innerJoin(agencyClients, eq(weeklyReports.clientId, agencyClients.id))
      .where(eq(weeklyReports.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'report',
      id: row.id,
      label: `${row.company} — week of ${formatDay(row.weekStart)}`,
      detail:
        row.status === 'completed' ? 'Completed' : 'Waiting on the client',
    } satisfies ResourceRef;
  },
  // Reached through the client, like every other per-client record.
  async search() {
    return [];
  },
});
