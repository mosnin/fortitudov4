import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Call only with a provider-verified primary email and authenticated identity. */
export async function claimStaffInvitation(clerkId: string, verifiedEmail: string) {
  const email = verifiedEmail.trim().toLowerCase();
  // This is not an email-based account merge. Only the exact unclaimed record
  // created by the admin-only team endpoint can be claimed. Its UUID, role,
  // assigned tasks and other foreign keys are retained; linked accounts cannot
  // be reassigned. The predicate also prevents a second request claiming it.
  const [invited] = await db.update(users).set({ clerkId, updatedAt: new Date() })
    .where(and(
      eq(users.clerkId, `invite:${email}`),
      eq(users.email, email),
      inArray(users.role, ["admin", "project_manager", "va"]),
    )).returning();
  return invited;
}
