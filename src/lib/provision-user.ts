import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { claimStaffInvitation } from "@/lib/claim-staff-invitation";

/**
 * Complete the Clerk-to-app handoff without depending on webhook delivery.
 * Identity comes only from the verified server session, never a form/email
 * lookup. Linked accounts are never modified; verified staff can claim only
 * their exact, previously authorized invitation placeholder.
 */
export async function provisionSignedInUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in before setting up your account.");

  const [existing] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (existing) return existing;

  const profile = await currentUser();
  if (!profile || profile.id !== userId) {
    throw new Error("Your sign-in could not be verified. Please sign in again.");
  }

  const email = profile.emailAddresses.find(
    (address) => address.id === profile.primaryEmailAddressId
  );
  if (!email || email.verification?.status !== "verified") {
    throw new Error("Verify your primary email before opening your workspace.");
  }

  const invited = await claimStaffInvitation(userId, email.emailAddress);
  if (invited) return invited;

  await db.insert(users).values({
    clerkId: userId,
    email: email.emailAddress,
    firstName: profile.firstName,
    lastName: profile.lastName,
    imageUrl: profile.imageUrl,
    role: "client",
  }).onConflictDoNothing({ target: users.clerkId });

  // A webhook or another request may have won the race. Read its row rather
  // than overwriting its role, ownership, or profile with our defaults.
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user) throw new Error("Your workspace could not be opened. Please try again.");
  return user;
}
