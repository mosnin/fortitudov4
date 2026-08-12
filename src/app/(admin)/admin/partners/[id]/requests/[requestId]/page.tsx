import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerRequests, partners, projects, users } from "@/db/schema";
import { PartnerRequestDetail } from "@/components/admin/partner-request-detail";

export const metadata: Metadata = { title: "Request · Partners" };

/**
 * One partner request — the commercial document, and the surface where we
 * answer it with a price.
 *
 * The row is fetched by BOTH ids: a request only exists here as one of this
 * partner's, so a mismatched pair is a 404 rather than a row from somewhere
 * else. Access to the surface at all is the `partners` layout's job.
 */
export default async function AdminPartnerRequestPage({
  params,
}: {
  params: Promise<{ id: string; requestId: string }>;
}) {
  const { id, requestId } = await params;

  const [row] = await db
    .select({
      request: partnerRequests,
      partnerName: partners.companyName,
      partnerUserId: partners.userId,
      authorId: users.id,
      authorFirst: users.firstName,
      authorLast: users.lastName,
      authorEmail: users.email,
      projectName: projects.name,
    })
    .from(partnerRequests)
    .where(
      and(eq(partnerRequests.id, requestId), eq(partnerRequests.partnerId, id))
    )
    .innerJoin(partners, eq(partners.id, partnerRequests.partnerId))
    .leftJoin(users, eq(users.id, partnerRequests.createdBy))
    .leftJoin(projects, eq(projects.id, partnerRequests.projectId));

  if (!row) notFound();

  const { request } = row;

  return (
    <PartnerRequestDetail
      partnerId={id}
      partnerName={row.partnerName}
      request={{
        id: request.id,
        title: request.title,
        scope: request.scope,
        serviceType: request.serviceType,
        status: request.status,
        budgetCents: request.budgetCents,
        quotedCents: request.quotedCents,
        targetDate: request.targetDate?.toISOString() ?? null,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        projectName: row.projectName,
        openedBy:
          row.authorId === null
            ? null
            : row.partnerUserId && row.authorId === row.partnerUserId
              ? "partner"
              : "agency",
        openedByName:
          [row.authorFirst, row.authorLast].filter(Boolean).join(" ") ||
          row.authorEmail ||
          null,
      }}
    />
  );
}
