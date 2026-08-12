import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners, users, type Partner, type User } from "@/db/schema";
import { isPartner } from "@/lib/permissions";

/**
 * The gate on the whole /partner surface.
 *
 * Every page in this route group calls it FIRST, including the ones nested
 * under a layout that also calls it: a layout does not run again on a client
 * navigation to a sibling page, so a layout-only check is not a check. This is
 * the same shape `lib/auth-utils.ts` uses for the API, with `redirect` in place
 * of a thrown NextResponse because these are pages.
 *
 * Three ways in fail:
 *   - signed out            → /sign-in (the proxy already bounces them; this is
 *                             the second lock, not the first)
 *   - no users row yet      → /post-login, which owns that decision
 *   - any role but partner  → /post-login, which sends staff to /admin and a
 *                             client to /dashboard
 *
 * `partner` may still be null on success: a login can exist before anyone has
 * linked it to a partner organisation (`partners.userId` is nullable by
 * design). Callers must handle that rather than assume an id — with no
 * partnerId there is no scope, and no scope must never mean "everything".
 */
export interface PartnerContext {
  user: User;
  /** The partner organisation this login belongs to, or null if unlinked. */
  partner: Partner | null;
}

export async function requirePartnerAccess(): Promise<PartnerContext> {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!user) redirect("/post-login");
  if (!isPartner(user.role)) redirect("/post-login");

  // The ONLY place a partnerId comes from: the partners row whose userId is
  // this login. Never a URL segment, never a search param, never a request
  // body — those are all things the caller controls.
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, user.id))
    .limit(1);

  return { user, partner: partner ?? null };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guard a `[id]` segment before it reaches a uuid column.
 *
 * Postgres raises on a malformed uuid, so `/partner/requests/nonsense` would be
 * a 500 rather than the 404 it plainly is. It also keeps the two failures
 * indistinguishable, which is the point of the 404 in the first place.
 */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
