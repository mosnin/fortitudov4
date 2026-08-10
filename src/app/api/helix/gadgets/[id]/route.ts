import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  agencyClients,
  helixGadgetVersions,
  helixGadgets,
} from "@/db/schema";
import { getAuthenticatedUser, requireStaff } from "@/lib/auth-utils";
import { isStaff } from "@/lib/permissions";
import { validateGadgetSource } from "@/lib/helix/gadgets/document";

/** GET — one gadget, with its version history. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [gadget] = await db
      .select({
        id: helixGadgets.id,
        ownerId: helixGadgets.ownerId,
        clientId: helixGadgets.clientId,
        threadId: helixGadgets.threadId,
        name: helixGadgets.name,
        summary: helixGadgets.summary,
        source: helixGadgets.source,
        version: helixGadgets.version,
        status: helixGadgets.status,
        sharedWithClient: helixGadgets.sharedWithClient,
        updatedAt: helixGadgets.updatedAt,
        client: agencyClients.companyName,
      })
      .from(helixGadgets)
      .leftJoin(agencyClients, eq(helixGadgets.clientId, agencyClients.id))
      .where(eq(helixGadgets.id, id))
      .limit(1);

    if (!gadget) {
      return NextResponse.json({ error: "No such gadget." }, { status: 404 });
    }
    if (
      gadget.ownerId !== user.id &&
      !isStaff(user.role) &&
      !gadget.sharedWithClient
    ) {
      return NextResponse.json({ error: "Not yours." }, { status: 403 });
    }

    const versions = await db
      .select({
        id: helixGadgetVersions.id,
        version: helixGadgetVersions.version,
        note: helixGadgetVersions.note,
        createdAt: helixGadgetVersions.createdAt,
      })
      .from(helixGadgetVersions)
      .where(eq(helixGadgetVersions.gadgetId, id))
      .orderBy(desc(helixGadgetVersions.version));

    return NextResponse.json({ gadget, versions });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/gadgets/:id] GET", error);
    return NextResponse.json(
      { error: "Could not load that gadget." },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  summary: z.string().max(1000).nullable().optional(),
  source: z.record(z.string(), z.string()).optional(),
  note: z.string().max(500).optional(),
  sharedWithClient: z.boolean().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  /** Roll back to a stored version instead of supplying new source. */
  restoreVersion: z.number().int().positive().optional(),
});

/**
 * PATCH — edit a gadget.
 *
 * Any source change snapshots the *outgoing* source first, so every version
 * that ever ran is recoverable. The sandbox is what makes experimenting safe;
 * history is what makes it cheap.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaff();
    const { id } = await params;

    const [gadget] = await db
      .select()
      .from(helixGadgets)
      .where(and(eq(helixGadgets.id, id), eq(helixGadgets.ownerId, user.id)))
      .limit(1);
    if (!gadget) {
      return NextResponse.json({ error: "No such gadget." }, { status: 404 });
    }

    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid change." }, { status: 400 });
    }
    const patch = parsed.data;

    let nextSource = patch.source;

    if (patch.restoreVersion !== undefined) {
      const [snapshot] = await db
        .select({ source: helixGadgetVersions.source })
        .from(helixGadgetVersions)
        .where(
          and(
            eq(helixGadgetVersions.gadgetId, id),
            eq(helixGadgetVersions.version, patch.restoreVersion)
          )
        )
        .limit(1);
      if (!snapshot) {
        return NextResponse.json(
          { error: "No such version." },
          { status: 404 }
        );
      }
      nextSource = snapshot.source as Record<string, string>;
    }

    if (nextSource) {
      const invalid = validateGadgetSource(nextSource);
      if (invalid) {
        return NextResponse.json({ error: invalid }, { status: 400 });
      }
      // Snapshot what is being replaced, not what is replacing it — the point
      // is being able to get back to the version that was working.
      await db.insert(helixGadgetVersions).values({
        gadgetId: id,
        version: gadget.version,
        source: gadget.source as object,
        note: patch.note ?? null,
        createdBy: user.id,
      });
    }

    const [updated] = await db
      .update(helixGadgets)
      .set({
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
        ...(patch.sharedWithClient !== undefined
          ? { sharedWithClient: patch.sharedWithClient }
          : {}),
        ...(patch.status ? { status: patch.status } : {}),
        ...(nextSource
          ? { source: nextSource, version: gadget.version + 1 }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(helixGadgets.id, id))
      .returning();

    return NextResponse.json({ gadget: updated });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/gadgets/:id] PATCH", error);
    return NextResponse.json(
      { error: "Could not update that gadget." },
      { status: 500 }
    );
  }
}
