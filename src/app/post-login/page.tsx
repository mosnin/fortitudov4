import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isPartner, isStaff } from "@/lib/permissions";
import { provisionSignedInUser } from "@/lib/provision-user";
import { safeAuthDestination } from "@/lib/auth-redirect";

/**
 * Post-login router. Clerk redirects here after sign-in; we resolve the user's
 * role and send them to the right home:
 *   - staff (admin / project_manager / va) → /admin
 *   - partner                              → /partner
 *   - client                               → /dashboard
 * A brand-new account whose Clerk→DB sync webhook hasn't landed yet is safely
 * provisioned from its verified identity before entering onboarding.
 *
 * The partner branch is named explicitly rather than left to fall through: the
 * default is /dashboard, and a partner sent there lands in the client portal —
 * a delivery-stage tracker for a project they do not own.
 */
export default async function PostLoginPage({ searchParams }: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!user) {
    user = await provisionSignedInUser();
    // Do not bypass role routing if a webhook won the provisioning race.
    if (user.role === "client") redirect("/onboarding");
  }

  const destination = safeAuthDestination((await searchParams).redirect_url);
  // Account setup must finish first. The destination retains its own role and
  // record-level authorization; a redirect never grants access.
  if (destination) redirect(destination);

  if (isStaff(user.role)) {
    redirect("/admin");
  }

  if (isPartner(user.role)) {
    redirect("/partner");
  }

  redirect("/dashboard");
}
