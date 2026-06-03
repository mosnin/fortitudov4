import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { getAgentPrincipal } from "@/lib/agent-auth";

// Agent-facing catalog: only items an autonomous agent is allowed to purchase.
export async function GET(req: Request) {
  try {
    await getAgentPrincipal(req);
    const items = catalog
      .filter((c) => c.agentPurchasable)
      .map((c) => ({
        slug: c.slug,
        discipline: c.discipline,
        name: c.name,
        summary: c.summary,
        fromPrice: c.fromPrice,
        currency: "usd",
        estimatedTimeline: c.estimatedTimeline,
        features: c.features,
      }));
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent catalog error:", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}
