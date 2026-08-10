import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { helixActions, helixThreads, users } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { approveActions, rejectActions } from "@/lib/helix/runtime";

/**
 * The approval queue.
 *
 * Everything Helix has proposed but not committed, newest thread first. This
 * is the surface the whole deferred-approval design exists to serve: the agent
 * worked while nobody was watching, and this is where a human takes or drops
 * what it did.
 */
export async function GET() {
  try {
    await requireStaff();

    const rows = await db
      .select({
        id: helixActions.id,
        threadId: helixActions.threadId,
        threadTitle: helixThreads.title,
        gatekeeper: helixActions.gatekeeper,
        op: helixActions.op,
        resourceKind: helixActions.resourceKind,
        resourceId: helixActions.resourceId,
        summary: helixActions.summary,
        risk: helixActions.risk,
        preview: helixActions.preview,
        status: helixActions.status,
        sequence: helixActions.sequence,
        error: helixActions.error,
        createdAt: helixActions.createdAt,
        reviewedAt: helixActions.reviewedAt,
        reviewerFirst: users.firstName,
        reviewerLast: users.lastName,
      })
      .from(helixActions)
      .innerJoin(helixThreads, eq(helixActions.threadId, helixThreads.id))
      .leftJoin(users, eq(helixActions.reviewedBy, users.id))
      .where(
        inArray(helixActions.status, [
          "simulated",
          "executed",
          "rejected",
          "failed",
        ])
      )
      .orderBy(desc(helixActions.createdAt))
      .limit(200);

    return NextResponse.json({ actions: rows });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/approvals] GET", error);
    return NextResponse.json(
      { error: "Could not load the approval queue." },
      { status: 500 }
    );
  }
}

/**
 * Approve or reject. Approval executes for real, in proposal order — a later
 * action may have been simulated against an earlier one's result, so running
 * them out of order can fail on constraints the agent never saw.
 */
export async function POST(request: Request) {
  try {
    const user = await requireStaff();

    const body = (await request.json()) as {
      decision?: "approve" | "reject";
      actionIds?: string[];
      /** Take every pending action in one thread. */
      threadId?: string;
    };

    if (body.decision !== "approve" && body.decision !== "reject") {
      return NextResponse.json(
        { error: "decision must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    let ids = body.actionIds ?? [];
    if (body.threadId) {
      const pending = await db
        .select({ id: helixActions.id })
        .from(helixActions)
        .where(
          and(
            eq(helixActions.threadId, body.threadId),
            eq(helixActions.status, "simulated")
          )
        );
      ids = pending.map((row) => row.id);
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Nothing to review." },
        { status: 400 }
      );
    }

    if (body.decision === "reject") {
      const rejected = await rejectActions(ids, user.id);
      return NextResponse.json({ rejected });
    }

    const result = await approveActions(ids, user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/approvals] POST", error);
    return NextResponse.json(
      { error: "Could not apply that decision." },
      { status: 500 }
    );
  }
}
