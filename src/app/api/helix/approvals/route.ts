import { NextResponse } from "next/server";
import { and, count, desc, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { helixActions, helixThreads, users } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import {
  approveActions,
  rejectActions,
  requeueActions,
} from "@/lib/helix/runtime";

/**
 * The approval queue.
 *
 * The surface the whole deferred-approval design exists to serve: the agent
 * worked while nobody was watching, and this is where a human takes or drops
 * what it did.
 *
 * Paged per tab, not per queue. Sharing one window across every status let a
 * large approval batch — whose rows are the newest — push still-pending work
 * off the end, so the queue quietly stopped showing what was waiting. Counts
 * come from a separate tally for the same reason.
 */
/** The three states a reviewer filters by, and the rows each one holds. */
const TAB_STATUSES = {
  pending: ["simulated"],
  applied: ["executed"],
  // A failure needs the same attention a decline does — it is work that did
  // not happen — so they share a tab rather than hiding failures elsewhere.
  declined: ["rejected", "failed"],
} as const;

type Tab = keyof typeof TAB_STATUSES;

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    await requireStaff();
    const url = new URL(request.url);
    const tab = (url.searchParams.get("tab") ?? "pending") as Tab;
    const before = url.searchParams.get("before");

    if (!(tab in TAB_STATUSES)) {
      return NextResponse.json({ error: "Unknown tab." }, { status: 400 });
    }

    const filters = [
      inArray(helixActions.status, [...TAB_STATUSES[tab]]),
      ...(before ? [lt(helixActions.createdAt, new Date(before))] : []),
    ];

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
      .where(and(...filters))
      .orderBy(desc(helixActions.createdAt))
      .limit(PAGE_SIZE);

    // Counted separately rather than derived from the page, so the tab labels
    // state the true totals instead of "however many fitted".
    const tallies = await db
      .select({ status: helixActions.status, count: count() })
      .from(helixActions)
      .groupBy(helixActions.status);

    const by = (statuses: readonly string[]) =>
      tallies
        .filter((row) => statuses.includes(row.status))
        .reduce((total, row) => total + row.count, 0);

    return NextResponse.json({
      actions: rows,
      nextBefore:
        rows.length === PAGE_SIZE ? rows[rows.length - 1].createdAt : null,
      counts: {
        pending: by(TAB_STATUSES.pending),
        applied: by(TAB_STATUSES.applied),
        declined: by(TAB_STATUSES.declined),
      },
    });
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
      decision?: "approve" | "reject" | "retry";
      actionIds?: string[];
      /** Take every pending action in one thread. */
      threadId?: string;
    };

    if (!["approve", "reject", "retry"].includes(body.decision ?? "")) {
      return NextResponse.json(
        { error: "decision must be 'approve', 'reject' or 'retry'." },
        { status: 400 }
      );
    }

    let ids = body.actionIds ?? [];
    if (body.threadId) {
      // Retrying a whole thread means its failures; approving or declining one
      // means its pending changes. Same shape, different set.
      const targetStatus = body.decision === "retry" ? "failed" : "simulated";
      const pending = await db
        .select({ id: helixActions.id })
        .from(helixActions)
        .where(
          and(
            eq(helixActions.threadId, body.threadId),
            eq(helixActions.status, targetStatus)
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

    if (body.decision === "retry") {
      const requeued = await requeueActions(ids, user.id);
      return NextResponse.json({ requeued });
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
