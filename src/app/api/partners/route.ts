/**
 * POST /api/partners — create a partner organisation.
 *
 * Ours, not theirs. A partner is created by the agency (plans/partners.md: a
 * partner exists before their login does, the same way an agencyClient does),
 * so this route is `admin` / `project_manager` only via `canManagePartners`.
 *
 * A VA is refused here as firmly as a client is: a VA is scoped to the tasks
 * they hold, and the partner roster is the commercial relationship. A partner
 * is refused their own record too — they may describe work, not edit who we
 * think they are, and `userId` decides which login the whole /partner surface
 * scopes to.
 *
 * Reads are not here. The /admin/partners pages are Server Components and
 * query the database directly; this file is the write layer only.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { canManagePartners } from "@/lib/permissions";
import {
  badRequest,
  forbidden,
  invalidFields,
  partnerSchema,
  readJsonObject,
  resolveCaller,
  serverError,
  userExists,
} from "./_shared";

export async function POST(request: Request) {
  const { user, failure } = await resolveCaller();
  if (failure) return failure;
  if (!canManagePartners(user.role)) return forbidden();

  const { body, failure: bodyFailure } = await readJsonObject(request);
  if (bodyFailure) return bodyFailure;

  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { email, userId, notes, ...rest } = parsed.data;

  try {
    if (userId && !(await userExists(userId))) {
      return badRequest("That portal account does not exist.");
    }

    // Built from the parsed data, so nothing a caller invented can reach the
    // insert: `id`, `createdBy` and the timestamps are ours.
    const [created] = await db
      .insert(partners)
      .values({
        ...rest,
        email: email ?? null,
        userId: userId ?? null,
        notes: notes ?? null,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[api/partners] POST", error);
    return serverError("Could not create that partner. Please try again.");
  }
}
