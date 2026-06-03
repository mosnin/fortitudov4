import { NextResponse } from "next/server";
import { getAgentPrincipal } from "@/lib/agent-auth";
import { createProjectFromBrief } from "@/lib/studio";
import { getCatalogItem } from "@/lib/catalog";
import { z } from "zod";

const briefSchema = z.object({
  discipline: z.enum(["software", "commerce", "ai", "infrastructure"]),
  catalogSlug: z.string().max(100).optional(),
  businessName: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  features: z.array(z.string().max(255)).max(50).optional(),
  targetAudience: z.string().max(2000).optional(),
  timeline: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  additionalNotes: z.string().max(5000).optional(),
});

// Agents submit a Brief and receive a Blueprint (scope + price) to accept.
export async function POST(req: Request) {
  try {
    const agent = await getAgentPrincipal(req);

    const body = await req.json();
    const parsed = briefSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // If a productized starting point is named, it must be agent-purchasable.
    if (parsed.data.catalogSlug) {
      const item = getCatalogItem(parsed.data.catalogSlug);
      if (!item) {
        return NextResponse.json({ error: "Unknown catalogSlug" }, { status: 400 });
      }
      if (!item.agentPurchasable) {
        return NextResponse.json(
          { error: "This starting point requires a human and cannot be purchased by an agent." },
          { status: 403 }
        );
      }
    }

    const { project, blueprint } = await createProjectFromBrief(agent.id, parsed.data);

    return NextResponse.json(
      {
        projectId: project.id,
        blueprint: {
          id: blueprint.id,
          title: blueprint.title,
          scope: blueprint.scope,
          lineItems: blueprint.lineItems,
          total: blueprint.total,
          currency: blueprint.currency,
          estimatedTimeline: blueprint.estimatedTimeline,
          status: blueprint.status,
        },
        acceptUrl: `/api/agent/blueprints/${blueprint.id}/accept`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent brief error:", error);
    return NextResponse.json({ error: "Failed to create brief" }, { status: 500 });
  }
}
