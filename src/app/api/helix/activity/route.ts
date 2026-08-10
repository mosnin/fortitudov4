import { NextResponse } from "next/server";
import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  helixEventKindEnum,
  helixEvents,
  helixThreads,
  users,
} from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";

type EventKind = (typeof helixEventKindEnum.enumValues)[number];

/**
 * The audit trail.
 *
 * Written as a byproduct of the work rather than typed up afterwards — every
 * grant, read, simulation, approval and execution lands here as it happens.
 *
 * Reads are excluded by default. They are the overwhelming majority of events
 * and reviewing them is not what anyone opens this page to do; a trail nobody
 * reads is not an audit trail. They stay one filter away.
 */
const CONSEQUENTIAL: EventKind[] = [
  "thread_created",
  "introduction_requested",
  "introduction_granted",
  "introduction_denied",
  "introduction_revoked",
  "action_simulated",
  "action_approved",
  "action_rejected",
  "action_executed",
  "action_failed",
  "gadget_created",
  "gadget_updated",
  "blueprint_installed",
];

export async function GET(request: Request) {
  try {
    await requireStaff();
    const url = new URL(request.url);
    const includeReads = url.searchParams.get("reads") === "1";
    const threadId = url.searchParams.get("threadId");
    const before = url.searchParams.get("before");

    const filters = [];
    if (!includeReads) {
      filters.push(inArray(helixEvents.kind, CONSEQUENTIAL));
    }
    if (threadId) filters.push(eq(helixEvents.threadId, threadId));
    if (before) filters.push(lt(helixEvents.createdAt, new Date(before)));

    const rows = await db
      .select({
        id: helixEvents.id,
        threadId: helixEvents.threadId,
        threadTitle: helixThreads.title,
        kind: helixEvents.kind,
        summary: helixEvents.summary,
        byHelix: helixEvents.byHelix,
        resourceKind: helixEvents.resourceKind,
        createdAt: helixEvents.createdAt,
        actorFirst: users.firstName,
        actorLast: users.lastName,
      })
      .from(helixEvents)
      .leftJoin(helixThreads, eq(helixEvents.threadId, helixThreads.id))
      .leftJoin(users, eq(helixEvents.actorId, users.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(helixEvents.createdAt))
      .limit(100);

    return NextResponse.json({
      events: rows,
      // A cursor rather than a page number: the trail is append-only and
      // high-volume, so offsets would skip or repeat rows as it grows.
      nextBefore:
        rows.length === 100 ? rows[rows.length - 1].createdAt : null,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/activity] GET", error);
    return NextResponse.json(
      { error: "Could not load activity." },
      { status: 500 }
    );
  }
}
