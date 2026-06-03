import { NextResponse } from "next/server";
import { db } from "@/db";
import { decisionRequests, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAgentPrincipal } from "@/lib/agent-auth";
import { answerDecisionRequest } from "@/lib/studio";
import { z } from "zod";

const answerSchema = z.object({
  response: z.record(z.string(), z.unknown()),
});

// An agent answers a decision request over the API — same object as the portal.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agent = await getAgentPrincipal(req);
    const { id } = await params;

    const [decision] = await db
      .select()
      .from(decisionRequests)
      .where(eq(decisionRequests.id, id));
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, decision.projectId));
    if (!project || project.userId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await answerDecisionRequest(id, agent.id, parsed.data.response);
    if (!updated) {
      return NextResponse.json(
        { error: "Decision already answered or closed." },
        { status: 409 }
      );
    }

    return NextResponse.json({ answered: true, decisionId: id });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent decision answer error:", error);
    return NextResponse.json({ error: "Failed to answer decision" }, { status: 500 });
  }
}
