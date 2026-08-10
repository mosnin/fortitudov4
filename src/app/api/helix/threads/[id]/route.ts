import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  helixActions,
  helixIntroductions,
  helixMessages,
  helixThreads,
} from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { helixIsLive } from "@/lib/helix/agent";

/**
 * GET — one thread in full: transcript, what it has been introduced to, and
 * the actions it has queued. A thread is only ever readable by the person it
 * is accountable to.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaff();
    const { id } = await params;

    const [thread] = await db
      .select()
      .from(helixThreads)
      .where(and(eq(helixThreads.id, id), eq(helixThreads.ownerId, user.id)))
      .limit(1);

    if (!thread) {
      return NextResponse.json({ error: "No such thread." }, { status: 404 });
    }

    const [messages, introductions, actions] = await Promise.all([
      db
        .select({
          id: helixMessages.id,
          role: helixMessages.role,
          content: helixMessages.content,
          thinking: helixMessages.thinking,
          sequence: helixMessages.sequence,
          createdAt: helixMessages.createdAt,
        })
        .from(helixMessages)
        .where(eq(helixMessages.threadId, id))
        .orderBy(asc(helixMessages.sequence)),
      db
        .select()
        .from(helixIntroductions)
        .where(
          and(
            eq(helixIntroductions.threadId, id),
            inArray(helixIntroductions.status, ["granted", "requested"])
          )
        )
        .orderBy(asc(helixIntroductions.createdAt)),
      db
        .select({
          id: helixActions.id,
          messageId: helixActions.messageId,
          summary: helixActions.summary,
          risk: helixActions.risk,
          status: helixActions.status,
          preview: helixActions.preview,
          sequence: helixActions.sequence,
        })
        .from(helixActions)
        .where(eq(helixActions.threadId, id))
        .orderBy(asc(helixActions.sequence)),
    ]);

    return NextResponse.json({
      thread,
      messages,
      introductions,
      actions,
      // The client renders an honest banner when there is no model key rather
      // than letting the rule-based planner pass for the real thing.
      live: helixIsLive(),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/threads/:id] GET", error);
    return NextResponse.json(
      { error: "Could not load that thread." },
      { status: 500 }
    );
  }
}

/** DELETE — archive a thread. Its audit trail is kept. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaff();
    const { id } = await params;

    const [updated] = await db
      .update(helixThreads)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(helixThreads.id, id), eq(helixThreads.ownerId, user.id)))
      .returning({ id: helixThreads.id });

    if (!updated) {
      return NextResponse.json({ error: "No such thread." }, { status: 404 });
    }
    return NextResponse.json({ archived: updated.id });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/threads/:id] DELETE", error);
    return NextResponse.json(
      { error: "Could not archive that thread." },
      { status: 500 }
    );
  }
}
