import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agencyClients, helixGadgets } from "@/db/schema";
import { requireStaff } from "@/lib/auth-utils";
import { validateGadgetSource } from "@/lib/helix/gadgets/document";
import { recordEvent } from "@/lib/helix/runtime";

/** GET — gadgets this staff member owns, most recently changed first. */
export async function GET() {
  try {
    const user = await requireStaff();
    const rows = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        slug: helixGadgets.slug,
        summary: helixGadgets.summary,
        version: helixGadgets.version,
        status: helixGadgets.status,
        sharedWithClient: helixGadgets.sharedWithClient,
        updatedAt: helixGadgets.updatedAt,
        client: agencyClients.companyName,
      })
      .from(helixGadgets)
      .leftJoin(agencyClients, eq(helixGadgets.clientId, agencyClients.id))
      .where(eq(helixGadgets.ownerId, user.id))
      .orderBy(desc(helixGadgets.updatedAt))
      .limit(100);

    return NextResponse.json({ gadgets: rows });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/gadgets] GET", error);
    return NextResponse.json(
      { error: "Could not load your gadgets." },
      { status: 500 }
    );
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(255),
  summary: z.string().max(1000).optional(),
  clientId: z.string().uuid().optional(),
  threadId: z.string().uuid().optional(),
  source: z.record(z.string(), z.string()),
});

/** POST — create a gadget by hand. Helix creates them through its gatekeeper. */
export async function POST(request: Request) {
  try {
    const user = await requireStaff();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid gadget." }, { status: 400 });
    }

    const invalid = validateGadgetSource(parsed.data.source);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const [gadget] = await db
      .insert(helixGadgets)
      .values({
        ownerId: user.id,
        clientId: parsed.data.clientId ?? null,
        threadId: parsed.data.threadId ?? null,
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        summary: parsed.data.summary ?? null,
        source: parsed.data.source,
      })
      .returning();

    if (parsed.data.threadId) {
      await recordEvent(
        { threadId: parsed.data.threadId, userId: user.id },
        {
          kind: "gadget_created",
          summary: `Created gadget "${gadget.name}"`,
          resourceKind: "gadget",
          resourceId: gadget.id,
        }
      );
    }

    return NextResponse.json({ gadget }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/gadgets] POST", error);
    return NextResponse.json(
      { error: "Could not create that gadget." },
      { status: 500 }
    );
  }
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "gadget"
  );
}
