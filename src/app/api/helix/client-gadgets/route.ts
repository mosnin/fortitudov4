import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyClients, helixGadgets } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

/**
 * Gadgets a client can open.
 *
 * Two conditions, both required: the gadget belongs to this caller's own
 * engagement, and someone approved sharing it. `sharedWithClient` alone is not
 * enough — a gadget built for another client that was shared with *them* must
 * never appear here, so the engagement is resolved from the session rather
 * than taken from the request.
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    const [client] = await db
      .select({ id: agencyClients.id, companyName: agencyClients.companyName })
      .from(agencyClients)
      .where(eq(agencyClients.userId, user.id))
      .limit(1);

    if (!client) {
      return NextResponse.json({ gadgets: [], company: null });
    }

    const gadgets = await db
      .select({
        id: helixGadgets.id,
        name: helixGadgets.name,
        summary: helixGadgets.summary,
        source: helixGadgets.source,
        version: helixGadgets.version,
        updatedAt: helixGadgets.updatedAt,
      })
      .from(helixGadgets)
      .where(
        and(
          eq(helixGadgets.clientId, client.id),
          eq(helixGadgets.sharedWithClient, true),
          eq(helixGadgets.status, "live")
        )
      )
      .orderBy(desc(helixGadgets.updatedAt));

    return NextResponse.json({ gadgets, company: client.companyName });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("[helix/client-gadgets] GET", error);
    return NextResponse.json(
      { error: "Could not load your tools." },
      { status: 500 }
    );
  }
}
