import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { credentials, projects, type Credential } from "@/db/schema";
import type { DbUser } from "./auth-utils";

/** Load a credential and confirm the caller can access its project (owner or staff). */
export async function loadCredentialWithAccess(
  credentialId: string,
  user: DbUser
): Promise<Credential | null> {
  const [cred] = await db.select().from(credentials).where(eq(credentials.id, credentialId));
  if (!cred) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, cred.projectId));
  if (!project) return null;
  const staff = user.role === "admin" || user.role === "team";
  if (!staff && project.userId !== user.id) return null;
  return cred;
}
