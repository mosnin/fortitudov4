import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { helixActions, helixThreads } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { recordEvent } from "@/lib/helix/runtime";

/** GET — the staff member's own threads, most recently worked first. */
export async function GET() {
  try {
    const user = await requireStaff();

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
          eq(helixThreads.status, "active")
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
