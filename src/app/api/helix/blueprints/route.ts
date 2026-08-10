import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { helixBlueprints, helixGadgets } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { BUILT_IN_BLUEPRINTS } from "@/lib/helix/gadgets/blueprints";
import { validateGadgetSource } from "@/lib/helix/gadgets/document";

/**
 * GET — everything installable: the blueprints that ship with the product,
 * plus any the agency has published from its own gadgets.
 *
 * Built-ins are served from code rather than seeded into the database. They
 * are part of the release, so a deploy updates them; a row in a table would
 * drift from the code that documents it.
 */
export async function GET() {
  try {
    await requireStaff();

    const published = await db
      .select({
        id: helixBlueprints.id,
        name: helixBlueprints.name,
        slug: helixBlueprints.slug,
        summary: helixBlueprints.summary,
        category: helixBlueprints.category,
        installCount: helixBlueprints.installCount,
        updatedAt: helixBlueprints.updatedAt,
      })
      .from(helixBlueprints)
      .where(eq(helixBlueprints.builtIn, false))
      .orderBy(desc(helixBlueprints.installCount));

    return NextResponse.json({
      builtIn: BUILT_IN_BLUEPRINTS.map((bp) => ({
        slug: bp.slug,
        name: bp.name,
        summary: bp.summary,
        category: bp.category,
        files: Object.keys(bp.source),
      })),
      published,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/blueprints] GET", error);
    return NextResponse.json(
      { error: "Could not load blueprints." },
      { status: 500 }
    );
  }
}

const publishSchema = z.object({
  gadgetId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  summary: z.string().max(1000).optional(),
  category: z.string().max(64).optional(),
});

/**
 * POST — publish one of your gadgets as a blueprint.
 *
 * The gadget's *source* is copied; its state is not. That separation is what
 * makes sharing safe: a delivery tracker built for one client becomes a
 * template without carrying that client's data into everyone else's copy.
 */
export async function POST(request: Request) {
  try {
    const user = await requireStaff();
    const parsed = publishSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Pick a gadget." }, { status: 400 });
    }

    const [gadget] = await db
      .select()
      .from(helixGadgets)
      .where(eq(helixGadgets.id, parsed.data.gadgetId))
      .limit(1);

    if (!gadget || gadget.ownerId !== user.id) {
      return NextResponse.json({ error: "No such gadget." }, { status: 404 });
    }

    const invalid = validateGadgetSource(gadget.source);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const name = parsed.data.name ?? gadget.name;
    const slug = await uniqueSlug(name);

    const [blueprint] = await db
      .insert(helixBlueprints)
      .values({
        name,
        slug,
        summary: parsed.data.summary ?? gadget.summary,
        category: parsed.data.category ?? "general",
        // Source only — never `gadget.state`.
        source: gadget.source as object,
        builtIn: false,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json({ blueprint }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/blueprints] POST", error);
    return NextResponse.json(
      { error: "Could not publish that blueprint." },
      { status: 500 }
    );
  }
}

/** Slugs are unique across blueprints, so a name collision gets a suffix. */
async function uniqueSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "blueprint";

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const [taken] = await db
      .select({ id: helixBlueprints.id })
      .from(helixBlueprints)
      .where(eq(helixBlueprints.slug, candidate))
      .limit(1);
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}
