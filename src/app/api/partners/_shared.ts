/**
 * Shared plumbing for the partner write layer — `/api/partners` and
 * `/api/partner-requests`.
 *
 * Not a route: only `route.ts` is routable, so this file is invisible to the
 * router and is imported by all four handlers.
 *
 * It exists because the four handlers must agree, exactly, about three things:
 * who the caller is, which partner record is theirs, and which columns are
 * never theirs to write. Four copies of that would drift, and the direction it
 * drifts in is one partner reaching another partner's request.
 *
 * The rules themselves are NOT here. They live in `@/lib/permissions`
 * (`isPartner`, `canManagePartners`, `canPartnerEditRequest`,
 * `canPartnerSubmitRequest`) and `@/lib/partners`; this module only carries the
 * plumbing that gets a handler to the point of asking them.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  partnerKindEnum,
  partnerStatusEnum,
  partners,
  users,
} from "@/db/schema";
import { getAuthenticatedUser, type DbUser } from "@/lib/auth-utils";
import { PARTNER_PROTECTED_REQUEST_FIELDS } from "@/lib/partners";

export const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: 400 });
export const forbidden = (error = "Forbidden") =>
  NextResponse.json({ error }, { status: 403 });
export const notFound = (error = "Not found") =>
  NextResponse.json({ error }, { status: 404 });
export const serverError = (error: string) =>
  NextResponse.json({ error }, { status: 500 });

/**
 * `getAuthenticatedUser` signals refusal by throwing a NextResponse (401 with
 * no session, 404 with no row). Handlers here branch on the caller's role
 * rather than wrapping everything in one try/catch, so the throw is turned
 * back into a value the caller can return directly.
 */
export async function resolveCaller(): Promise<
  { user: DbUser; failure?: undefined } | { user?: undefined; failure: Response }
> {
  try {
    return { user: await getAuthenticatedUser() };
  } catch (thrown) {
    if (thrown instanceof Response) return { failure: thrown };
    console.error("[api/partners] caller lookup", thrown);
    return { failure: serverError("Something went wrong. Please try again.") };
  }
}

/**
 * Read the body as a JSON object.
 *
 * Parsed on its own, before anything touches the database, and with its own
 * catch: a body that is not JSON is the caller's mistake and must be a 400. It
 * shares no catch with the insert, because a database that will not accept the
 * row is ours and must stay a 500 (see the note in /api/leads).
 */
export async function readJsonObject(
  request: Request
): Promise<
  | { body: Record<string, unknown>; failure?: undefined }
  | { body?: undefined; failure: Response }
> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return { failure: badRequest("That request could not be read.") };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { failure: badRequest("Expected a JSON object.") };
  }
  return { body: parsed as Record<string, unknown> };
}

/**
 * The partner record belonging to a login, or null.
 *
 * This is the ONLY way a partner's `partnerId` is ever established. A
 * `partnerId` in a request body is never trusted for anything: the whole
 * scoping rule is "rows whose partnerId matches the one on their own row", and
 * a body-supplied id would let a caller nominate whose rows those are.
 */
export async function partnerRecordFor(
  userId: string
): Promise<{ id: string; status: string } | null> {
  // partners.userId is nullable, so an empty caller id must never be allowed
  // to reach the comparison — the same shape of bug canUpdateTask guards.
  if (!userId) return null;
  const [row] = await db
    .select({ id: partners.id, status: partners.status })
    .from(partners)
    .where(eq(partners.userId, userId))
    .limit(1);
  return row ?? null;
}

/**
 * Which never-partner-writable columns a body is trying to set.
 *
 * `PARTNER_PROTECTED_REQUEST_FIELDS` is the list, kept in lib/partners.ts so
 * the deny is testable directly. Unknown fields are not consulted here at all
 * — they are dropped by the zod schemas, because a caller sending junk is not
 * the same event as a caller reaching for `quotedCents`.
 *
 * `exempt` names the columns a particular handler validates itself:
 *   - `status`, everywhere, is answered by canPartnerSubmitRequest;
 *   - `partnerId`, on create only, is overwritten with the caller's own rather
 *     than refused, so the row still lands where it belongs.
 *
 * hasOwnProperty rather than `in`, so `__proto__` and `constructor` in a body
 * are ordinary misses instead of inherited truthy members.
 */
export function protectedFieldsIn(
  body: Record<string, unknown>,
  exempt: readonly string[] = []
): string[] {
  return PARTNER_PROTECTED_REQUEST_FIELDS.filter(
    (field) =>
      !exempt.includes(field) &&
      Object.prototype.hasOwnProperty.call(body, field)
  );
}

/**
 * Money, in integer cents, as everywhere else in this codebase. A float, a
 * negative, or a string is refused rather than rounded or coerced — the number
 * ends up on an invoice. Capped at the int4 ceiling so an absurd figure is a
 * 400 from us and not an overflow from Postgres.
 */
export const centsSchema = z.number().int().min(0).max(2_147_483_647);

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date the UI can actually produce: either a full ISO timestamp or the
 * `YYYY-MM-DD` an `<input type="date">` submits.
 */
export const dateSchema = z
  .string()
  .trim()
  .refine((value) => DATE_ONLY.test(value) || !Number.isNaN(Date.parse(value)), {
    message: "Expected a date",
  });

export function toDate(value: string): Date {
  return DATE_ONLY.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);
}

/**
 * Name the fields that actually failed, so a 400 is actionable. A whole-object
 * failure — the "nothing to update" refine — has no field path, so its own
 * message is used instead of a generic sentence.
 */
export function invalidFields(error: z.ZodError): string {
  const names = [
    ...new Set(error.issues.map((issue) => String(issue.path[0] ?? "")).filter(Boolean)),
  ];
  if (names.length) return `Please check: ${names.join(", ")}.`;
  return error.issues[0]?.message || "Invalid request.";
}

export const uuidSchema = z.string().uuid();

// ─────────────────────────────────────────────────────────────────────────────
// The partner record
//
// Shared by POST /api/partners and PATCH /api/partners/[id]. It lives here
// rather than in route.ts because a route file may only export HTTP handlers
// and the framework's own config keys — anything else exported from one is a
// build error, not a shared module.
// ─────────────────────────────────────────────────────────────────────────────

export const partnerSchema = z.object({
  companyName: z.string().trim().min(1).max(255),
  contactName: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).nullable().optional(),
  // A label describing who someone is, never a mechanism that moves money.
  kind: z.enum(partnerKindEnum.enumValues).optional(),
  status: z.enum(partnerStatusEnum.enumValues).optional(),
  // Their portal login. Nullable: the relationship exists before the account.
  userId: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

/**
 * Linking a partner to a login that does not exist would be a foreign-key
 * violation — a 500 that reads like an outage for what is really a stale id in
 * a form. Checked so it is a 400 with a sentence instead.
 */
export async function userExists(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return Boolean(row);
}
