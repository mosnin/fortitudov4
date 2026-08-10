import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  agencyClients,
  helixIntroductions,
  helixMessages,
  helixThreads,
  projects,
} from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { helixIsLive, runTurn } from "@/lib/helix/agent";
import { recordEvent } from "@/lib/helix/runtime";

/**
 * Helix on the client portal.
 *
 * The same agent, hard-scoped to the client's own engagement — and read-only,
 * without exception. Every introduction on a client thread is granted with
 * `allowWrites: false`, so a write is refused outright rather than queued.
 *
 * That is not caution about the model; it is who is asking. Approval works
 * because the person reviewing has authority over the change, and a client
 * does not have authority over their own delivery stage, their own fees, or
 * what the agency tells them is done. A client thread that could queue changes
 * would put a client's request in front of a reviewer wearing the agency's
 * face, which is precisely the confusion this whole design exists to prevent.
 *
 * A client with something to ask for uses Messages. A person answers.
 */

/** Resolve the caller's own engagement, or null if they are not a client. */
async function ownEngagement(userId: string) {
  const [client] = await db
    .select({
      id: agencyClients.id,
      companyName: agencyClients.companyName,
    })
    .from(agencyClients)
    .where(eq(agencyClients.userId, userId))
    .limit(1);
  return client ?? null;
}

/**
 * Find or open this client's thread. One per client rather than many: a client
 * has a single ongoing relationship with the agency, not a set of workstreams.
 */
async function resolveThread(userId: string, clientId: string) {
  const [existing] = await db
    .select()
    .from(helixThreads)
    .where(
      and(
        eq(helixThreads.ownerId, userId),
        eq(helixThreads.scope, "client"),
        eq(helixThreads.status, "active")
      )
    )
    .orderBy(desc(helixThreads.lastMessageAt))
    .limit(1);
  if (existing) return existing;

  const [thread] = await db
    .insert(helixThreads)
    .values({
      ownerId: userId,
      scope: "client",
      clientId,
      title: "Your project",
    })
    .returning();

  await recordEvent(
    { threadId: thread.id, userId },
    { kind: "thread_created", summary: "Client thread opened" }
  );

  // Seeded read-only, so the client can ask about their own work without any
  // path to changing it.
  await grantReadOnly(thread.id, userId, "client", clientId);

  const owned = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(eq(projects.userId, userId));
  for (const project of owned) {
    await grantReadOnly(thread.id, userId, "project", project.id, project.name);
  }

  return thread;
}

async function grantReadOnly(
  threadId: string,
  userId: string,
  kind: "client" | "project",
  resourceId: string,
  label?: string
) {
  const resolvedLabel =
    label ??
    (
      await db
        .select({ name: agencyClients.companyName })
        .from(agencyClients)
        .where(eq(agencyClients.id, resourceId))
        .limit(1)
    )[0]?.name ??
    "Your engagement";

  await db.insert(helixIntroductions).values({
    threadId,
    resourceKind: kind,
    resourceId,
    resourceLabel: resolvedLabel,
    status: "granted",
    // Never true on a client thread.
    allowWrites: false,
    grantedBy: userId,
    decidedAt: new Date(),
  });
}

/** GET — the client's thread and transcript. */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const client = await ownEngagement(user.id);
    if (!client) {
      return NextResponse.json(
        { error: "No engagement is linked to this account yet." },
        { status: 404 }
      );
    }

    const thread = await resolveThread(user.id, client.id);

    const [messages, introductions] = await Promise.all([
      db
        .select({
          id: helixMessages.id,
          role: helixMessages.role,
          content: helixMessages.content,
          createdAt: helixMessages.createdAt,
        })
        .from(helixMessages)
        .where(eq(helixMessages.threadId, thread.id))
        .orderBy(asc(helixMessages.sequence)),
      db
        .select({
          id: helixIntroductions.id,
          resourceKind: helixIntroductions.resourceKind,
          resourceLabel: helixIntroductions.resourceLabel,
        })
        .from(helixIntroductions)
        .where(
          and(
            eq(helixIntroductions.threadId, thread.id),
            eq(helixIntroductions.status, "granted")
          )
        ),
    ]);

    return NextResponse.json({
      threadId: thread.id,
      company: client.companyName,
      messages,
      introductions,
      live: helixIsLive(),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/client-thread] GET", error);
    return NextResponse.json(
      { error: "Could not open Helix." },
      { status: 500 }
    );
  }
}

const sendSchema = z.object({ message: z.string().min(1).max(4000) });

/** POST — ask Helix something about your own project. */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const client = await ownEngagement(user.id);
    if (!client) {
      return NextResponse.json(
        { error: "No engagement is linked to this account yet." },
        { status: 404 }
      );
    }

    const parsed = sendSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Ask something." }, { status: 400 });
    }

    const thread = await resolveThread(user.id, client.id);
    const result = await runTurn(thread.id, user.id, parsed.data.message);

    // A client thread cannot queue anything, so there is nothing to report
    // about approvals — and saying so would imply a queue they can reach.
    return NextResponse.json({ reply: result.reply, offline: result.offline });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/client-thread] POST", error);
    return NextResponse.json(
      { error: "Helix could not answer that." },
      { status: 500 }
    );
  }
}
