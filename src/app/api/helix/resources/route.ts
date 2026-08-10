import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { helixThreads, type helixResourceKindEnum } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { GATEKEEPERS, introducibleKinds } from "@/lib/helix/registry";
import { loadContext } from "@/lib/helix/runtime";
import type { ResourceRef } from "@/lib/helix/contract";

type ResourceKind = (typeof helixResourceKindEnum.enumValues)[number];

/**
 * GET — candidates a person may introduce to a thread.
 *
 * Each gatekeeper answers for its own kind, so the picker widens exactly as
 * the registry does. Gatekeepers whose resources are reached through a parent
 * (tasks, via their client) return nothing and simply do not appear.
 */
export async function GET(request: Request) {
  try {
    const user = await requireStaff();
    const url = new URL(request.url);
    const threadId = url.searchParams.get("threadId");
    const query = url.searchParams.get("q") ?? "";
    const kind = url.searchParams.get("kind") as ResourceKind | null;

    if (!threadId) {
      return NextResponse.json({ error: "Which thread?" }, { status: 400 });
    }

    const [thread] = await db
      .select({ id: helixThreads.id })
      .from(helixThreads)
      .where(
        and(eq(helixThreads.id, threadId), eq(helixThreads.ownerId, user.id))
      )
      .limit(1);
    if (!thread) {
      return NextResponse.json({ error: "No such thread." }, { status: 404 });
    }

    const ctx = await loadContext(threadId, user.id);
    const searched = kind
      ? GATEKEEPERS.filter((gk) => gk.resourceKind === kind)
      : GATEKEEPERS;

    const groups = await Promise.all(
      searched.map(async (gatekeeper) => ({
        kind: gatekeeper.resourceKind,
        label: gatekeeper.label,
        results: await gatekeeper.search(query, ctx),
      }))
    );

    // Anything already introduced is filtered out — offering it again would
    // read as a second grant rather than the no-op it is.
    const held = new Set(
      ctx.introduced.map((ref) => `${ref.kind}:${ref.id}`)
    );
    const filtered = groups
      .map((group) => ({
        ...group,
        results: group.results.filter(
          (ref: ResourceRef) => !held.has(`${ref.kind}:${ref.id}`)
        ),
      }))
      .filter((group) => group.results.length > 0);

    return NextResponse.json({ groups: filtered, kinds: introducibleKinds() });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/resources] GET", error);
    return NextResponse.json(
      { error: "Could not search resources." },
      { status: 500 }
    );
  }
}
