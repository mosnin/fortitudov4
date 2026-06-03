import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export type DbUser = typeof users.$inferSelect;

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
      role: "client",
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
  if (existing) return existing;

  return syncUser(cu);
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
  if (existing) return existing;

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
