import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canManagePartners, isAdmin } from "@/lib/permissions";

/**
 * Server-side guards for a route-group layout.
 *
 * The parent `(admin)` layout admits all staff so PMs and VAs can reach the
 * operational pages. Surfaces narrower than "staff" call one of these to
 * redirect anyone who does not belong there — on direct URL access included,
 * which is the case a hidden nav link does nothing about. Route groups keep
 * the URLs unchanged.
 *
 * Both do the same three things: resolve the session, load the row, redirect
 * on the predicate. Only the predicate differs, which is why the body is
 * shared — two copies would be two places to forget the `!user` case, and a
 * missing DB row must fail closed.
 */
async function assertRole(allowed: (role: string) => boolean): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  // No row means the Clerk→DB sync has not landed. Fail closed: an unknown
  // caller is not an admin.
  if (!user || !allowed(user.role)) redirect("/admin");
}

/**
 * Admin only — the agency's own money and access: P&L, payouts, team roles,
 * integration secrets.
 */
export async function assertAdminPage(): Promise<void> {
  await assertRole(isAdmin);
}

/**
 * Admin and project managers — the partner surfaces.
 *
 * Deliberately NOT `assertAdminPage`. A PM runs client work day to day and has
 * to be able to quote a partner; bouncing them would make the feature
 * admin-only by accident. Equally deliberately not the parent layout's "any
 * staff": a VA is scoped to the tasks they hold, and a partner request is a
 * commercial document carrying another company's budget.
 */
export async function assertPartnersPage(): Promise<void> {
  await assertRole(canManagePartners);
}
