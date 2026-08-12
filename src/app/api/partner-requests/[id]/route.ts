/**
 * PATCH /api/partner-requests/[id] — update a job.
 *
 * This is the route the partner rules exist for, so it asks them one at a
 * time rather than approximating them:
 *
 *   - the row is loaded first, and a partner who is not its owner gets **404,
 *     not 403** — a 403 would confirm the request exists, which is itself a
 *     read of someone else's data;
 *   - every field the body carries is put through `canPartnerEditRequest`,
 *     which refuses anything outside title / scope / serviceType /
 *     budgetCents / targetDate and refuses all five once the request has moved
 *     past `draft` / `submitted` — once we are quoting against it, the thing
 *     being quoted stops moving;
 *   - `status` goes through `canPartnerSubmitRequest`, which allows exactly
 *     one transition: their own `draft` → `submitted`;
 *   - `quotedCents`, `projectId` and `partnerId` are refused before any of
 *     that. Our price is not theirs to set.
 *
 * admin / project_manager may do all of it. A VA may not, and a client has no
 * reach here at all.
 */

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerRequests } from "@/db/schema";
import type { DbUser } from "@/lib/auth-utils";
import {
  canManagePartners,
  canPartnerEditRequest,
  canPartnerSubmitRequest,
  isPartner,
} from "@/lib/permissions";
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
  uuidSchema,
} from "@/app/api/partners/_shared";
import { partnerUpdateSchema, staffUpdateSchema } from "../_shared";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, failure } = await resolveCaller();
  if (failure) return failure;

  const staff = canManagePartners(user.role);
  if (!staff && !isPartner(user.role)) return forbidden();

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) return badRequest("Invalid id.");

  const { body, failure: bodyFailure } = await readJsonObject(request);
  if (bodyFailure) return bodyFailure;

  return staff ? updateAsStaff(id, body) : updateAsPartner(user, id, body);
}

async function updateAsPartner(
  user: DbUser,
  id: string,
  body: Record<string, unknown>
) {
  let record: Awaited<ReturnType<typeof partnerRecordFor>>;
  let existing: typeof partnerRequests.$inferSelect | undefined;
  try {
    record = await partnerRecordFor(user.id);
    if (!record) {
      return forbidden("This account is not linked to a partner record.");
    }
    [existing] = await db
      .select()
      .from(partnerRequests)
      .where(eq(partnerRequests.id, id))
      .limit(1);
  } catch (error) {
    console.error("[api/partner-requests/[id]] lookup", error);
    return serverError("Could not update that request. Please try again.");
  }

  // Missing and not-theirs are the same answer on purpose. A 403 here would
  // tell one partner that another partner's request id is real.
  if (!existing || existing.partnerId !== record.id) {
    return notFound("Request not found");
  }

  const reached = protectedFieldsIn(body, ["status"]);
  if (reached.length) {
    return forbidden(`${reached.join(", ")} is not a partner's to set.`);
  }

  const parsed = partnerUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { status, scope, budgetCents, targetDate, ...rest } = parsed.data;

  // Asked per field rather than per request: a body that mixes a legitimate
  // title with something out of bounds is refused whole, and nothing is
  // written — a partial write here would be a silent, partial permission.
  for (const field of Object.keys(parsed.data)) {
    if (field === "status") continue; // canPartnerSubmitRequest, below.
    if (!canPartnerEditRequest(user.role, record.id, existing, field)) {
      return forbidden(
        `"${field}" cannot be changed while this request is ${existing.status}.`
      );
    }
  }

  if (
    status !== undefined &&
    !canPartnerSubmitRequest(user.role, record.id, existing, status)
  ) {
    return forbidden(
      `A partner may not move a ${existing.status} request to "${status}".`
    );
  }

  try {
    const [updated] = await db
      .update(partnerRequests)
      .set({
        ...rest,
        ...(scope !== undefined && { scope: scope ?? null }),
        ...(budgetCents !== undefined && { budgetCents: budgetCents ?? null }),
        ...(targetDate !== undefined && {
          targetDate: targetDate ? toDate(targetDate) : null,
        }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      // Scoped by owner as well as by id: the ownership check above is the
      // authority, and this is the belt to its braces.
      .where(
        and(eq(partnerRequests.id, id), eq(partnerRequests.partnerId, record.id))
      )
      .returning();

    if (!updated) return notFound("Request not found");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[api/partner-requests/[id]] PATCH (partner)", error);
    return serverError("Could not update that request. Please try again.");
  }
}

async function updateAsStaff(id: string, body: Record<string, unknown>) {
  const parsed = staffUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { scope, budgetCents, quotedCents, targetDate, projectId, ...rest } =
    parsed.data;

  try {
    const [updated] = await db
      .update(partnerRequests)
      .set({
        ...rest,
        ...(scope !== undefined && { scope: scope ?? null }),
        ...(budgetCents !== undefined && { budgetCents: budgetCents ?? null }),
        ...(quotedCents !== undefined && { quotedCents: quotedCents ?? null }),
        ...(projectId !== undefined && { projectId: projectId ?? null }),
        ...(targetDate !== undefined && {
          targetDate: targetDate ? toDate(targetDate) : null,
        }),
        updatedAt: new Date(),
      })
      .where(eq(partnerRequests.id, id))
      .returning();

    if (!updated) return notFound("Request not found");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[api/partner-requests/[id]] PATCH (staff)", error);
    return serverError("Could not update that request. Please try again.");
  }
}
