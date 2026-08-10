import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  helixActions,
  helixIntroductions,
  helixResourceKindEnum,
  helixThreads,
} from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { gatekeeperForKind } from "@/lib/helix/registry";
import { loadContext, recordEvent } from "@/lib/helix/runtime";

/**
 * GET — the staff member's own threads, most recently worked first.
 *
 * Active only by default. `?archived=1` returns the archived ones instead,
 * because finished work should not compete for attention with live work — but
 * it must stay reachable, since a thread carries the reasoning behind changes
 * that already shipped.
 */
export async function GET(request: Request) {
  try {
    const user = await requireStaff();
    const archived =
      new URL(request.url).searchParams.get("archived") === "1";

    const rows = await db
      .select({
        id: helixThreads.id,
        title: helixThreads.title,
        standing: helixThreads.standing,
        status: helixThreads.status,
        lastMessageAt: helixThreads.lastMessageAt,
        pending: sql<number>`(
          select count(*) from ${helixActions}
          where ${helixActions.threadId} = ${helixThreads.id}
            and ${helixActions.status} = 'simulated'
        )`.mapWith(Number),
      })
      .from(helixThreads)
      .where(
        and(
          eq(helixThreads.ownerId, user.id),
          eq(helixThreads.status, archived ? "archived" : "active")
        )
      )
      .orderBy(desc(helixThreads.lastMessageAt))
      .limit(50);

    return NextResponse.json({ threads: rows });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/threads] GET", error);
    return NextResponse.json(
      { error: "Could not load your threads." },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  /**
   * Resources to introduce as the thread opens. Opening from a client row
   * already names the client, so making someone re-pick it in a modal would
   * be ceremony — but it is still a real grant, recorded like any other.
   */
  introduce: z
    .array(
      z.object({
        resourceKind: z.enum(helixResourceKindEnum.enumValues),
        resourceId: z.string().uuid(),
        allowWrites: z.boolean().optional(),
      })
    )
    .max(5)
    .optional(),
});

/**
 * POST — open a thread. It starts introduced to nothing, which is the point:
 * access is granted per thread, for the work at hand.
 */
export async function POST(request: Request) {
  try {
    const user = await requireStaff();
    const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const [thread] = await db
      .insert(helixThreads)
      .values({
        ownerId: user.id,
        scope: "agency",
        title: parsed.data.title ?? "New thread",
      })
      .returning();

    await recordEvent(
      { threadId: thread.id, userId: user.id },
      { kind: "thread_created", summary: "Thread opened" }
    );

    // One context for the whole loop — resolve only needs it to label a
    // resource, and rebuilding it per grant would be a query per iteration.
    const ctx = parsed.data.introduce?.length
      ? await loadContext(thread.id, user.id)
      : null;

    for (const grant of parsed.data.introduce ?? []) {
      const gatekeeper = gatekeeperForKind(grant.resourceKind);
      if (!gatekeeper || !ctx) continue;
      const ref = await gatekeeper.resolve(grant.resourceId, ctx);
      // Silently skipped rather than failing the whole open: a stale link
      // should still get you a working thread.
      if (!ref) continue;

      await db.insert(helixIntroductions).values({
        threadId: thread.id,
        resourceKind: grant.resourceKind,
        resourceId: grant.resourceId,
        resourceLabel: ref.label,
        status: "granted",
        allowWrites: grant.allowWrites ?? true,
        grantedBy: user.id,
        decidedAt: new Date(),
      });

      await recordEvent(
        { threadId: thread.id, userId: user.id },
        {
          kind: "introduction_granted",
          summary: `Introduced ${grant.resourceKind} "${ref.label}"`,
          resourceKind: grant.resourceKind,
          resourceId: grant.resourceId,
        }
      );
    }

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/threads] POST", error);
    return NextResponse.json(
      { error: "Could not open a thread." },
      { status: 500 }
    );
  }
}
