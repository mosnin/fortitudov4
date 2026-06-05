import "server-only";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export type TeamInviteInput = { email: string; firstName?: string; lastName?: string };

/**
 * Admin invites a team member by email. If they already have an account we
 * promote it to `team`; otherwise we create a placeholder user (clerkId
 * `pending:…`) that `claimPendingInvite` adopts on their first sign-in with
 * that email — preserving the `team` role. No code to share: they just sign up
 * with this email. Returns the row and whether it was newly created.
 */
export async function inviteTeamMember(input: TeamInviteInput) {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("An email is required.");

  const [existing] = await db.select().from(users).where(eq(users.email, email));

  if (existing) {
    // Promote an existing client/team to team; never silently demote an admin.
    if (existing.role === "admin") return { user: existing, isNew: false, alreadyStaff: true };
    const [updated] = await db
      .update(users)
      .set({
        role: "team",
        firstName: existing.firstName ?? input.firstName ?? null,
        lastName: existing.lastName ?? input.lastName ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return { user: updated ?? existing, isNew: false, alreadyStaff: existing.role === "team" };
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: `pending:${randomUUID()}`,
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: "team",
    })
    .returning();
  return { user: created, isNew: true, alreadyStaff: false };
}

/** A placeholder team member who hasn't signed in yet. */
export function isPendingUser(clerkId: string): boolean {
  return clerkId.startsWith("pending:");
}
