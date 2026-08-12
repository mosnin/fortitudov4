import type { Metadata } from "next";
import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { partnerRequests, partners } from "@/db/schema";
import { PartnerRoster, type PartnerRow } from "@/components/admin/partner-roster";
import {
  AWAITING_QUOTE_STATUSES,
  isOpenRequestStatus,
} from "@/components/admin/partner-status";

export const metadata: Metadata = { title: "Partners · Operations" };

/**
 * The partner roster. A Server Component reading the database directly — the
 * app's convention for reads; only the mutations go through the API.
 *
 * Access is gated one level up, in `layout.tsx`: admin and project_manager
 * only, a VA is redirected.
 */
export default async function AdminPartnersPage() {
  const [partnerRows, requestCounts] = await Promise.all([
    db.select().from(partners).orderBy(desc(partners.createdAt)),
    // Grouped in the database rather than counted over every row in JS.
    db
      .select({
        partnerId: partnerRequests.partnerId,
        status: partnerRequests.status,
        total: count(),
      })
      .from(partnerRequests)
      .groupBy(partnerRequests.partnerId, partnerRequests.status),
  ]);

  const tally = new Map<
    string,
    { open: number; total: number; awaiting: number }
  >();
  for (const row of requestCounts) {
    const entry = tally.get(row.partnerId) ?? { open: 0, total: 0, awaiting: 0 };
    entry.total += row.total;
    if (isOpenRequestStatus(row.status)) entry.open += row.total;
    if ((AWAITING_QUOTE_STATUSES as readonly string[]).includes(row.status)) {
      entry.awaiting += row.total;
    }
    tally.set(row.partnerId, entry);
  }

  const rows: PartnerRow[] = partnerRows.map((partner) => ({
    id: partner.id,
    companyName: partner.companyName,
    contactName: partner.contactName,
    email: partner.email,
    kind: partner.kind,
    status: partner.status,
    hasLogin: partner.userId !== null,
    openRequests: tally.get(partner.id)?.open ?? 0,
    totalRequests: tally.get(partner.id)?.total ?? 0,
    awaitingQuote: tally.get(partner.id)?.awaiting ?? 0,
  }));

  return <PartnerRoster partners={rows} />;
}
