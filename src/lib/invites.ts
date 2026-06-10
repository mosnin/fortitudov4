import "server-only";
import { randomBytes, randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, invites } from "@/db/schema";
import { createProjectFromBrief } from "./studio";
import type { ServiceType } from "./services";

// Readable, unambiguous invite code (no 0/O/1/I).
function genCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(10);
  let s = "";
  for (let i = 0; i < 10; i++) s += alphabet[b[i] % alphabet.length];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

export interface InvitedBuildInput {
  email: string;
  firstName?: string;
  businessName: string;
  discipline: ServiceType;
  description: string;
  features?: string[];
  timeline?: string;
  budget?: string;
  additionalNotes?: string;
}

/**
 * Admin creates a build for a client identified by email. If the client has no
 * account yet we create a placeholder user (clerkId `pending:…`) which is
 * auto-adopted on their first sign-in with that email. Returns an invite code.
 */
export async function createInvitedBuild(adminId: string, input: InvitedBuildInput) {
  const email = input.email.trim().toLowerCase();

  let [u] = await db.select().from(users).where(eq(users.email, email));
  const isNewClient = !u;
  if (!u) {
    [u] = await db
      .insert(users)
      .values({
        clerkId: `pending:${randomUUID()}`,
        email,
        firstName: input.firstName,
        role: "client",
      })
      .returning();
  }

  const { project, blueprint } = await createProjectFromBrief(u.id, {
    discipline: input.discipline,
    businessName: input.businessName,
    description: input.description,
    features: input.features,
    timeline: input.timeline,
    budget: input.budget,
    additionalNotes: input.additionalNotes,
  });

  const code = genCode();
  await db.insert(invites).values({ code, email, projectId: project.id, createdBy: adminId });

  return { code, email, projectId: project.id, blueprintId: blueprint.id, isNewClient };
}
