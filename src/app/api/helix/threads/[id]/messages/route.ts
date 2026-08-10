import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { helixThreads } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { runTurn } from "@/lib/helix/agent";

const sendSchema = z.object({
  message: z.string().min(1).max(8000),
});

/**
 * POST — say something to Helix and run a turn.
 *
 * Deliberately not streamed. A turn can queue several actions and each one has
 * to be simulated and persisted before the reply means anything; streaming the
 * prose while the actions were still settling would show a reviewer a summary
 * of changes that did not yet exist. The turn returns once its record is
 * consistent.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaff();
    const { id } = await params;

    const [thread] = await db
      .select({ id: helixThreads.id })
      .from(helixThreads)
      .where(and(eq(helixThreads.id, id), eq(helixThreads.ownerId, user.id)))
      .limit(1);

    if (!thread) {
      return NextResponse.json({ error: "No such thread." }, { status: 404 });
    }

    const parsed = sendSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Say something first." },
        { status: 400 }
      );
    }

    const result = await runTurn(id, user.id, parsed.data.message);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/threads/:id/messages] POST", error);
    return NextResponse.json(
      { error: "Helix could not finish that turn." },
      { status: 500 }
    );
  }
}
