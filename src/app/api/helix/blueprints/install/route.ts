import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agencyClients, helixBlueprints, helixGadgets } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { findBuiltIn } from "@/lib/helix/gadgets/blueprints";
import {
  validateGadgetSource,
  type GadgetSource,
} from "@/lib/helix/gadgets/document";
import { recordEvent } from "@/lib/helix/runtime";

const installSchema = z.object({
  /** Built-in blueprints are addressed by slug, published ones by id. */
  slug: z.string().optional(),
  blueprintId: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
});

/**
 * POST — install a blueprint for a client.
 *
 * Installing copies the source into a new gadget you own outright. It is not a
 * subscription to someone else's app: from this moment the copy is yours to
 * change, and later edits to the blueprint do not reach it. That is the
 * trade — you give up automatic updates and get the ability to fix your own
 * problems without asking anyone.
 *
 * The installed gadget starts as a draft. Nothing reaches a client until
 * someone shares it.
 */
export async function POST(request: Request) {
  try {
    const user = await requireStaff();
    const parsed = installSchema.safeParse(await request.json());
    if (!parsed.success || (!parsed.data.slug && !parsed.data.blueprintId)) {
      return NextResponse.json(
        { error: "Pick a blueprint and a client." },
        { status: 400 }
      );
    }
    const { clientId, threadId } = parsed.data;

    const [client] = await db
      .select({
        id: agencyClients.id,
        companyName: agencyClients.companyName,
      })
      .from(agencyClients)
      .where(eq(agencyClients.id, clientId))
      .limit(1);
    if (!client) {
      return NextResponse.json({ error: "No such client." }, { status: 404 });
    }

    let name: string;
    let summary: string | null;
    let source: GadgetSource;
    let publishedId: string | null = null;

    if (parsed.data.blueprintId) {
      const [blueprint] = await db
        .select()
        .from(helixBlueprints)
        .where(eq(helixBlueprints.id, parsed.data.blueprintId))
        .limit(1);
      if (!blueprint) {
        return NextResponse.json(
          { error: "No such blueprint." },
          { status: 404 }
        );
      }
      name = blueprint.name;
      summary = blueprint.summary;
      source = blueprint.source as GadgetSource;
      publishedId = blueprint.id;
    } else {
      const builtIn = findBuiltIn(parsed.data.slug!);
      if (!builtIn) {
        return NextResponse.json(
          { error: "No such blueprint." },
          { status: 404 }
        );
      }
      name = builtIn.name;
      summary = builtIn.summary;
      source = builtIn.source;
    }

    const invalid = validateGadgetSource(source);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const gadgetName = parsed.data.name ?? `${name} — ${client.companyName}`;

    const [gadget] = await db
      .insert(helixGadgets)
      .values({
        ownerId: user.id,
        clientId,
        threadId: threadId ?? null,
        blueprintId: publishedId,
        name: gadgetName,
        slug: gadgetName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80),
        summary,
        source,
        // A fresh instance carries no state from the blueprint or from any
        // other copy of it.
        state: {},
      })
      .returning();

    if (publishedId) {
      await db
        .update(helixBlueprints)
        .set({ installCount: sql`${helixBlueprints.installCount} + 1` })
        .where(eq(helixBlueprints.id, publishedId));
    }

    if (threadId) {
      await recordEvent(
        { threadId, userId: user.id },
        {
          kind: "blueprint_installed",
          summary: `Installed "${name}" for ${client.companyName}`,
          resourceKind: "gadget",
          resourceId: gadget.id,
        }
      );
    }

    return NextResponse.json({ gadget }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/blueprints/install] POST", error);
    return NextResponse.json(
      { error: "Could not install that blueprint." },
      { status: 500 }
    );
  }
}
