/**
 * PATCH /api/partners/[id] — update a partner organisation.
 *
 * Same authority as creating one: `admin` / `project_manager` through
 * `canManagePartners`. A partner cannot edit their own record — `status` is a
 * statement about the relationship (`active` / `paused` / `archived`), and
 * `userId` decides which login the whole /partner surface scopes to, which is
 * the one field that must never be self-service.
 */

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { canManagePartners } from "@/lib/permissions";
import {
  badRequest,
  forbidden,
  invalidFields,
  notFound,
  partnerSchema,
  readJsonObject,
  resolveCaller,
  serverError,
  userExists,
  uuidSchema,
} from "../_shared";

/** Every field optional, but a PATCH that changes nothing is a mistake. */
const updateSchema = partnerSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Nothing to update",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, failure } = await resolveCaller();
  if (failure) return failure;
  if (!canManagePartners(user.role)) return forbidden();

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) return badRequest("Invalid id.");

  const { body, failure: bodyFailure } = await readJsonObject(request);
  if (bodyFailure) return bodyFailure;

  // Unknown keys are dropped by the schema rather than written; a body of
  // nothing but unknown keys therefore parses to {} and fails the refine.
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest(invalidFields(parsed.error));
  const { email, userId, notes, ...rest } = parsed.data;

  try {
    if (userId && !(await userExists(userId))) {
      return badRequest("That portal account does not exist.");
    }

    const [updated] = await db
      .update(partners)
      .set({
        ...rest,
        ...(email !== undefined && { email: email ?? null }),
        ...(userId !== undefined && { userId: userId ?? null }),
        ...(notes !== undefined && { notes: notes ?? null }),
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();

    if (!updated) return notFound("Partner not found");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[api/partners/[id]] PATCH", error);
    return serverError("Could not update that partner. Please try again.");
  }
}
