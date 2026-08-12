import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { RequestDetail } from "@/components/partner/request-detail";
import { toRequestView } from "@/components/partner/request-view";
import { db } from "@/db";
import { partnerRequests } from "@/db/schema";
import { isUuid, requirePartnerAccess } from "../../../access";

/**
 * One request.
 *
 * The id in the URL is a filter, never an authority. It is ANDed with this
 * login's own `partnerId` in a single query, so a row belonging to another
 * partner and a row that does not exist come back identically — nothing — and
 * both leave here as a 404.
 *
 * That is deliberate and it is not the same as a 403. A 403 answers "does this
 * id exist?" with yes, which is enough to walk a competitor's request list one
 * uuid at a time. plans/partners.md: "a partner reaching another partner's
 * requests is the failure that ends the relationship" — so the surface does not
 * confirm the reach even by refusing it.
 */
export default async function PartnerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { partner } = await requirePartnerAccess();

  // No partner row means no scope, and no scope must never widen to "any row".
  if (!partner) notFound();
  if (!isUuid(id)) notFound();

  const [row] = await db
    .select()
    .from(partnerRequests)
    .where(
      and(
        eq(partnerRequests.id, id),
        eq(partnerRequests.partnerId, partner.id)
      )
    )
    .limit(1);

  if (!row) notFound();

  return <RequestDetail request={toRequestView(row)} />;
}
