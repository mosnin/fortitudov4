import { NextResponse } from "next/server";
import { db } from "@/db";
import { decisionRequests, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAgentPrincipal } from "@/lib/agent-auth";

// All open decisions across the agent's projects — its work queue.
export async function GET(req: Request) {
  try {
    const agent = await getAgentPrincipal(req);

    const rows = await db
      .select({
        id: decisionRequests.id,
        projectId: decisionRequests.projectId,
        kind: decisionRequests.kind,
        title: decisionRequests.title,
        prompt: decisionRequests.prompt,
        schema: decisionRequests.schema,
        blocking: decisionRequests.blocking,
        createdAt: decisionRequests.createdAt,
      })
      .from(decisionRequests)
      .innerJoin(projects, eq(decisionRequests.projectId, projects.id))
      .where(
        and(eq(projects.userId, agent.id), eq(decisionRequests.status, "open"))
      );

    return NextResponse.json({
      decisions: rows.map((d) => ({
        ...d,
        answerUrl: `/api/agent/decisions/${d.id}/answer`,
      })),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent decisions list error:", error);
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}
