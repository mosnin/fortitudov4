import { NextResponse } from "next/server";
import { db } from "@/db";
import { blueprints, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAgentPrincipal } from "@/lib/agent-auth";
import { acceptBlueprint } from "@/lib/studio";
import { z } from "zod";

// Optional spend authorization — an agent can cap what it's allowed to commit.
const acceptSchema = z
  .object({
    spendAuthorization: z
      .object({ maxAmount: z.number().int().nonnegative() })
      .optional(),
  })
  .optional();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agent = await getAgentPrincipal(req);
    const { id } = await params;

    const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.id, id));
    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, blueprint.projectId));
    if (!project || project.userId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Enforce spend authorization if provided.
    const raw = await req.json().catch(() => ({}));
    const parsed = acceptSchema.safeParse(raw);
    const maxAmount = parsed.success ? parsed.data?.spendAuthorization?.maxAmount : undefined;
    if (typeof maxAmount === "number" && blueprint.total > maxAmount) {
      return NextResponse.json(
        {
          error: "Blueprint total exceeds spend authorization.",
          total: blueprint.total,
          maxAmount,
          currency: blueprint.currency,
        },
        { status: 402 }
      );
    }

    const result = await acceptBlueprint(id, agent.id);
    if (!result) {
      return NextResponse.json(
        { error: "Blueprint cannot be accepted (already accepted or missing)." },
        { status: 409 }
      );
    }

    const checkoutBase = process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;
    const checkoutUrl = checkoutBase
      ? `${checkoutBase}?metadata[projectId]=${blueprint.projectId}&metadata[paymentId]=${result.paymentId}`
      : null;

    return NextResponse.json({
      accepted: true,
      projectId: blueprint.projectId,
      paymentId: result.paymentId,
      total: blueprint.total,
      currency: blueprint.currency,
      checkoutUrl,
      statusUrl: `/api/agent/projects/${blueprint.projectId}`,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent accept error:", error);
    return NextResponse.json({ error: "Failed to accept blueprint" }, { status: 500 });
  }
}
