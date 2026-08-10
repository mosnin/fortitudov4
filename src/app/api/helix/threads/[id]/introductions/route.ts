import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  helixIntroductions,
  helixResourceKindEnum,
  helixThreads,
} from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { gatekeeperForKind } from "@/lib/helix/registry";
import { loadContext, recordEvent } from "@/lib/helix/runtime";

const grantSchema = z.object({
  resourceKind: z.enum(helixResourceKindEnum.enumValues),
  resourceId: z.string().uuid(),
  /** false narrows the grant to reads; writes are refused rather than queued. */
  allowWrites: z.boolean().optional(),
});

/**
 * POST — introduce a resource to a thread.
 *
 * The label is resolved through the resource's own gatekeeper and stored
 * alongside the grant, so a revoked or later-deleted resource still reads
 * correctly in the audit trail.
 */
export async function POST(
  request: Request,
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

    const parsed = grantSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Pick a resource to introduce." },
        { status: 400 }
      );
    }
    const { resourceKind, resourceId, allowWrites = true } = parsed.data;

    const gatekeeper = gatekeeperForKind(resourceKind);
    if (!gatekeeper) {
      return NextResponse.json(
        { error: `Helix has no gatekeeper for ${resourceKind}.` },
        { status: 400 }
      );
    }

    const ctx = await loadContext(id, user.id);

    // A client-scoped thread can never be introduced to anything outside its
    // own client, whatever the request body says.
    if (thread.scope === "client" && thread.clientId) {
      const allowed =
        (resourceKind === "client" && resourceId === thread.clientId) ||
        resourceKind !== "client";
      if (!allowed) {
        return NextResponse.json(
          { error: "That is outside this thread's scope." },
          { status: 403 }
        );
      }
    }

    const ref = await gatekeeper.resolve(resourceId, ctx);
    if (!ref) {
      return NextResponse.json(
        { error: "That resource no longer exists." },
        { status: 404 }
      );
    }

    // Re-introducing something already granted just refreshes the write flag
    // rather than stacking duplicate grants.
    const [existing] = await db
      .select({ id: helixIntroductions.id })
      .from(helixIntroductions)
      .where(
        and(
          eq(helixIntroductions.threadId, id),
          eq(helixIntroductions.resourceKind, resourceKind),
          eq(helixIntroductions.resourceId, resourceId)
        )
      )
      .limit(1);

    const values = {
      threadId: id,
      resourceKind,
      resourceId,
      resourceLabel: ref.label,
      status: "granted" as const,
      allowWrites,
      grantedBy: user.id,
      decidedAt: new Date(),
    };

    const [introduction] = existing
      ? await db
          .update(helixIntroductions)
          .set(values)
          .where(eq(helixIntroductions.id, existing.id))
          .returning()
      : await db.insert(helixIntroductions).values(values).returning();

    await recordEvent(
      { threadId: id, userId: user.id },
      {
        kind: "introduction_granted",
        summary: `Introduced ${resourceKind} "${ref.label}"${allowWrites ? "" : " (read-only)"}`,
        resourceKind,
        resourceId,
      }
    );

    return NextResponse.json({ introduction }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/introductions] POST", error);
    return NextResponse.json(
      { error: "Could not grant that access." },
      { status: 500 }
    );
  }
}

/**
 * DELETE — revoke a grant. Anything Helix already queued against it stays in
 * the approval queue: revoking access does not rewrite what was proposed while
 * the access existed, and a reviewer should still see it to decide.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaff();
    const { id } = await params;
    const introductionId = new URL(request.url).searchParams.get("introductionId");

    if (!introductionId) {
      return NextResponse.json(
        { error: "Which grant?" },
        { status: 400 }
      );
    }

    const [thread] = await db
      .select({ id: helixThreads.id })
      .from(helixThreads)
      .where(and(eq(helixThreads.id, id), eq(helixThreads.ownerId, user.id)))
      .limit(1);
    if (!thread) {
      return NextResponse.json({ error: "No such thread." }, { status: 404 });
    }

    const [revoked] = await db
      .update(helixIntroductions)
      .set({ status: "revoked", decidedAt: new Date() })
      .where(
        and(
          eq(helixIntroductions.id, introductionId),
          eq(helixIntroductions.threadId, id)
        )
      )
      .returning({
        resourceKind: helixIntroductions.resourceKind,
        resourceLabel: helixIntroductions.resourceLabel,
      });

    if (!revoked) {
      return NextResponse.json({ error: "No such grant." }, { status: 404 });
    }

    await recordEvent(
      { threadId: id, userId: user.id },
      {
        kind: "introduction_revoked",
        summary: `Revoked access to ${revoked.resourceKind} "${revoked.resourceLabel}"`,
      }
    );

    return NextResponse.json({ revoked: introductionId });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/introductions] DELETE", error);
    return NextResponse.json(
      { error: "Could not revoke that access." },
      { status: 500 }
    );
  }
}
