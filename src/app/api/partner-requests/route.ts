/**
 * POST /api/partner-requests — open a job.
 *
 * Two callers reach this route and they are not variations of each other:
 *
 *   a partner  — opens a request for THEIR OWN partner record. The `partnerId`
 *                is read from `partners.userId = <their user id>` and nothing
 *                else; a `partnerId` in the body is ignored outright, because
 *                a body-supplied owner is how one partner's request ends up in
 *                another partner's queue.
 *   admin / PM — open a request on any partner's behalf, including the shell
 *                we create for a partner to fill in (plans/partners.md: one
 *                object, either author, `createdBy` records which).
 *
 * A VA is refused: a partner request is a commercial document with someone
 * else's budget in it. A client has no reach here at all.
 *
 * Reads are not here — the /partner and /admin/partners pages are Server
 * Components and query the database directly.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerRequests, partners } from "@/db/schema";
import type { DbUser } from "@/lib/auth-utils";
import { canManagePartners, canPartnerSubmitRequest, isPartner } from "@/lib/permissions";
import {
  badRequest,
  forbidden,
  invalidFields,
  notFound,
  partnerRecordFor,
  protectedFieldsIn,
  readJsonObject,
  resolveCaller,
  serverError,
  toDate,
} from "@/app/api/partners/_shared";
import { partnerCreateSchema, staffCreateSchema } from "./_shared";

export async function POST(request: Request) {
  const { user, failure } = await resolveCaller();
  if (failure) return failure;

  const staff = canManagePartners(user.role);
  if (!staff && !isPartner(user.role)) return forbidden();

  const { body, failure: bodyFailure } = await readJsonObject(request);
  if (bodyFailure) return bodyFailure;

  return staff ? createAsStaff(user, body) : createAsPartner(user, body);
}

async function createAsPartner(user: DbUser, body: Record<string, unknown>) {
  let record: Awaited<ReturnType<typeof partnerRecordFor>>;
  try {
    record = await partnerRecordFor(user.id);
  } catch (error) {
    console.error("[api/partner-requests] partner lookup", error);
    return serverError("Could not open that request. Please try again.");
  }
  if (!record) {
    return forbidden("This account is not linked to a partner record.");
  }

  // `partnerId` is exempt because it is overwritten below rather than refused;
  // `status` because canPartnerSubmitRequest answers it. Everything else on
  // the protected list — quotedCents loudest — is a refusal.
  const reached = protectedFieldsIn(body, ["status", "partnerId"]);
  if (reached.length) {
    return forbidden(`${reached.join(", ")} is not a partner's to set.`);
  }

  const parsed = partnerCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { status, scope, budgetCents, targetDate, ...rest } = parsed.data;

  // Opening a request already submitted is the partner's own draft →
  // submitted, in one step, which is the single transition they own. Any other
  // status is refused by the same predicate that guards the PATCH route.
  if (
    status !== undefined &&
    status !== "draft" &&
    !canPartnerSubmitRequest(
      user.role,
      record.id,
      { partnerId: record.id, status: "draft" },
      status
    )
  ) {
    return forbidden(`A partner may not open a request as "${status}".`);
  }

  try {
    const [created] = await db
      .insert(partnerRequests)
      .values({
        ...rest,
        // Theirs, whatever the body said.
        partnerId: record.id,
        scope: scope ?? null,
        budgetCents: budgetCents ?? null,
        targetDate: targetDate ? toDate(targetDate) : null,
        status: status ?? "draft",
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[api/partner-requests] POST (partner)", error);
    return serverError("Could not open that request. Please try again.");
  }
}

async function createAsStaff(user: DbUser, body: Record<string, unknown>) {
  const parsed = staffCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { partnerId, scope, budgetCents, quotedCents, targetDate, projectId, status, ...rest } =
    parsed.data;

  try {
    const [partner] = await db
      .select({ id: partners.id })
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);
    if (!partner) return notFound("Partner not found");

    const [created] = await db
      .insert(partnerRequests)
      .values({
        ...rest,
        partnerId,
        scope: scope ?? null,
        budgetCents: budgetCents ?? null,
        quotedCents: quotedCents ?? null,
        targetDate: targetDate ? toDate(targetDate) : null,
        projectId: projectId ?? null,
        status: status ?? "draft",
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[api/partner-requests] POST (staff)", error);
    return serverError("Could not open that request. Please try again.");
  }
}
