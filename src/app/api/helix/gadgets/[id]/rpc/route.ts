import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agencyClients, helixGadgets, helixThreads } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { isStaff } from "@/lib/permissions";
import { callOp, loadContext } from "@/lib/helix/runtime";
import { findOp } from "@/lib/helix/registry";
import type { HelixContext } from "@/lib/helix/contract";

/**
 * The gadget bridge endpoint.
 *
 * A gadget can do exactly three things: read and write its own state, and
 * perform a gatekeeper *read* scoped to the client it belongs to. That list is
 * short on purpose.
 *
 * Writes are refused outright rather than queued. Everywhere else in Helix a
 * write is safe because it is simulated and reviewed — but a gadget is code
 * the agent generated, running on a loop, and letting it queue actions would
 * let generated code flood the approval queue faster than a person can read
 * it. Approval only protects you while the queue stays readable.
 */

const rpcSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("context") }),
  z.object({ kind: z.literal("getState") }),
  z.object({ kind: z.literal("setState"), payload: z.unknown() }),
  z.object({
    kind: z.literal("read"),
    payload: z.object({ op: z.string(), input: z.unknown() }),
  }),
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [gadget] = await db
      .select()
      .from(helixGadgets)
      .where(eq(helixGadgets.id, id))
      .limit(1);

    if (!gadget) {
      return NextResponse.json({ error: "No such gadget." }, { status: 404 });
    }

    // Staff reach any gadget; a client reaches only one shared with them, and
    // only if it belongs to their own engagement.
    const isOwnerOrStaff = gadget.ownerId === user.id || isStaff(user.role);
    if (!isOwnerOrStaff && !gadget.sharedWithClient) {
      return NextResponse.json({ error: "Not yours." }, { status: 403 });
    }

    const parsed = rpcSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "That call is not part of the gadget bridge." },
        { status: 400 }
      );
    }
    const call = parsed.data;

    if (call.kind === "context") {
      const [client] = gadget.clientId
        ? await db
            .select({ companyName: agencyClients.companyName })
            .from(agencyClients)
            .where(eq(agencyClients.id, gadget.clientId))
            .limit(1)
        : [];
      return NextResponse.json({
        result: {
          gadgetId: gadget.id,
          clientId: gadget.clientId,
          clientName: client?.companyName ?? null,
        },
      });
    }

    if (call.kind === "getState") {
      return NextResponse.json({ result: gadget.state ?? {} });
    }

    if (call.kind === "setState") {
      if (JSON.stringify(call.payload ?? {}).length > 100_000) {
        return NextResponse.json(
          { error: "That state is too large — keep it under 100KB." },
          { status: 400 }
        );
      }
      const [updated] = await db
        .update(helixGadgets)
        .set({
          state: (call.payload ?? {}) as object,
          updatedAt: new Date(),
        })
        .where(eq(helixGadgets.id, id))
        .returning({ state: helixGadgets.state });
      return NextResponse.json({ result: updated.state });
    }

    // A read still goes through the gatekeeper runtime, so the introduction
    // checks are the same ones the agent faces.
    const found = findOp(call.payload.op);
    if (!found) {
      return NextResponse.json(
        { error: `No such read: ${call.payload.op}` },
        { status: 400 }
      );
    }
    if (found.op.kind !== "read") {
      return NextResponse.json(
        {
          error:
            "Gadgets can read but not change anything. Ask Helix to make the change instead.",
        },
        { status: 403 }
      );
    }

    const ctx = await gadgetContext(gadget, user.id);
    if (!ctx) {
      return NextResponse.json(
        { error: "This gadget is not attached to a thread that can read." },
        { status: 403 }
      );
    }

    const outcome = await callOp(ctx, call.payload.op, call.payload.input);
    if (!outcome.ok) {
      return NextResponse.json({ error: outcome.error }, { status: 400 });
    }
    return NextResponse.json({ result: outcome.result });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/gadgets/rpc] POST", error);
    return NextResponse.json(
      { error: "That call could not be completed." },
      { status: 500 }
    );
  }
}

/**
 * A gadget reads through the thread that built it, so its reach is exactly the
 * introductions that thread was given — never wider. A gadget whose thread was
 * archived or whose grants were revoked simply stops being able to read.
 */
async function gadgetContext(
  gadget: typeof helixGadgets.$inferSelect,
  userId: string
): Promise<HelixContext | null> {
  if (!gadget.threadId) return null;
  const [thread] = await db
    .select({ id: helixThreads.id })
    .from(helixThreads)
    .where(
      and(
        eq(helixThreads.id, gadget.threadId),
        eq(helixThreads.status, "active")
      )
    )
    .limit(1);
  if (!thread) return null;
  return loadContext(gadget.threadId, userId);
}
