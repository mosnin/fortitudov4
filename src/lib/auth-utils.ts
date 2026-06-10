import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects, invites } from "@/db/schema";
import { eq, and, like } from "drizzle-orm";

export type DbUser = typeof users.$inferSelect;

/**
 * Bootstrap admins: any email listed in the ADMIN_EMAILS env var (comma-
 * separated) is provisioned/promoted to `admin`. This is how the first admin
 * is made without DB access — set the env var and sign in. Promote-only; it
 * never demotes, so removing an email later won't strip an existing admin.
 */
function isBootstrapAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/** Promote a user to admin if their email is in the bootstrap allowlist. */
async function promoteIfBootstrapAdmin(user: DbUser): Promise<DbUser> {
  if (user.role === "admin" || !isBootstrapAdmin(user.email)) return user;
  const [updated] = await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();
  return updated ?? user;
}

/**
 * Upsert a DB user row from a Clerk profile. The Clerk webhook is only a
 * best-effort sync — we never depend on it. Any authenticated entry point
 * provisions the row on demand, so a Clerk account always has a matching
 * Supabase `users` row.
 */
async function syncUser(cu: ClerkUser): Promise<DbUser | null> {
  const email = cu.emailAddresses?.[0]?.emailAddress ?? "";
  await db
    .insert(users)
    .values({
      clerkId: cu.id,
      email,
      firstName: cu.firstName ?? undefined,
      lastName: cu.lastName ?? undefined,
      imageUrl: cu.imageUrl ?? undefined,
      role: isBootstrapAdmin(email) ? "admin" : "client",
    })
    .onConflictDoNothing({ target: users.clerkId });

  const [row] = await db.select().from(users).where(eq(users.clerkId, cu.id));
  return row ?? null;
}

/**
 * Get the current user's DB row, creating it from the Clerk session if needed.
 * Returns null only when there is no signed-in user.
 */
export async function getOrCreateCurrentUser(): Promise<DbUser | null> {
  const cu = await currentUser();
  if (!cu) return null;

  const [existing] = await db.select().from(users).where(eq(users.clerkId, cu.id));
  if (existing) return promoteIfBootstrapAdmin(existing);

  // Claim a build an admin created for this email before they had an account.
  const claimed = await claimPendingInvite(cu);
  if (claimed) return claimed;

  return syncUser(cu);
}

/**
 * If an admin pre-created a build for this email (a placeholder user with a
 * `pending:` clerkId), adopt that row instead of creating a new one — so the
 * client sees the build immediately. Best-effort: any error falls through.
 */
async function claimPendingInvite(cu: ClerkUser): Promise<DbUser | null> {
  try {
    const email = cu.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    if (!email) return null;

    const [pending] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), like(users.clerkId, "pending:%")))
      .limit(1);
    if (!pending) return null;

    await db
      .update(users)
      .set({
        clerkId: cu.id,
        firstName: cu.firstName ?? pending.firstName,
        lastName: cu.lastName ?? pending.lastName,
        imageUrl: cu.imageUrl ?? pending.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, pending.id));

    await db.update(invites).set({ claimedAt: new Date() }).where(eq(invites.email, email));

    const [adopted] = await db.select().from(users).where(eq(users.id, pending.id));
    return adopted ?? null;
  } catch {
    return null;
  }
}

/**
 * For API routes: get the authenticated DB user (provisioning it if needed),
 * or throw a NextResponse error. Callers catch `NextResponse` in their handler.
 */
export async function getAuthenticatedUser(): Promise<DbUser> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fast path: row already exists.
  const [existing] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (existing) return promoteIfBootstrapAdmin(existing);

  // Provision from the full Clerk profile.
  const cu = await currentUser();
  if (!cu) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const created = await syncUser(cu);
  if (!created) {
    throw NextResponse.json({ error: "Failed to provision user" }, { status: 500 });
  }
  return created;
}

/**
 * Verify the authenticated user owns a project (or is admin).
 * Throws NextResponse on failure.
 */
export async function verifyProjectAccess(projectId: string, userId: string, role: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    throw NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (role !== "admin" && project.userId !== userId) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return project;
}
