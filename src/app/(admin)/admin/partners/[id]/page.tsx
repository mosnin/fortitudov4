import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerRequests, partners, users } from "@/db/schema";
import {
  PartnerDetail,
  type PartnerRequestRow,
} from "@/components/admin/partner-detail";

export const metadata: Metadata = { title: "Partner · Operations" };

/**
 * One partner and the requests hanging off them. Reads directly from the
 * database; the guard is the `partners` layout (admin + project_manager).
 */
export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partner = await db.query.partners.findFirst({
    where: eq(partners.id, id),
  });
  if (!partner) notFound();

  const [rows, loginRows] = await Promise.all([
    db
      .select({
        request: partnerRequests,
        authorId: users.id,
        authorFirst: users.firstName,
        authorLast: users.lastName,
        authorEmail: users.email,
      })
      .from(partnerRequests)
      // Every read is scoped by partnerId — the rule the whole surface rests on.
      .where(eq(partnerRequests.partnerId, id))
      .leftJoin(users, eq(users.id, partnerRequests.createdBy))
      .orderBy(desc(partnerRequests.createdAt)),
    partner.userId
      ? db.select({ email: users.email }).from(users).where(eq(users.id, partner.userId))
      : Promise.resolve([]),
  ]);

  const requests: PartnerRequestRow[] = rows.map(
    ({ request, authorId, authorFirst, authorLast, authorEmail }) => ({
      id: request.id,
      title: request.title,
      serviceType: request.serviceType,
      status: request.status,
      budgetCents: request.budgetCents,
      quotedCents: request.quotedCents,
      targetDate: request.targetDate?.toISOString() ?? null,
      createdAt: request.createdAt.toISOString(),
      // Which side of the door opened it. `createdBy` is the whole record of
      // that — one object, either author (plans/partners.md).
      openedBy:
        authorId === null
          ? null
          : partner.userId && authorId === partner.userId
            ? "partner"
            : "agency",
      openedByName:
        [authorFirst, authorLast].filter(Boolean).join(" ") ||
        authorEmail ||
        null,
    })
  );

  return (
    <PartnerDetail
      partner={{
        id: partner.id,
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
        kind: partner.kind,
        status: partner.status,
        notes: partner.notes,
        loginEmail: loginRows[0]?.email ?? null,
      }}
      requests={requests}
    />
  );
}
