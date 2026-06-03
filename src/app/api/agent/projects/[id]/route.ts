import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectPhases, deliverables, decisionRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAgentPrincipal } from "@/lib/agent-auth";

// Machine-readable project status: phases, deliverables, and any open decisions
// the agent needs to answer to unblock the build.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agent = await getAgentPrincipal(req);
    const { id } = await params;

    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project || project.userId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [phases, deliverableRows, openDecisions] = await Promise.all([
      db.select().from(projectPhases).where(eq(projectPhases.projectId, id)),
      db.select().from(deliverables).where(eq(deliverables.projectId, id)),
      db
        .select()
        .from(decisionRequests)
        .where(
          and(eq(decisionRequests.projectId, id), eq(decisionRequests.status, "open"))
        ),
    ]);

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        discipline: project.serviceType,
        status: project.status,
        currentPhase: project.currentPhase,
      },
      phases: phases
        .sort((a, b) => a.order - b.order)
        .map((p) => ({ name: p.name, status: p.status })),
      deliverables: deliverableRows.map((d) => ({
        kind: d.kind,
        title: d.title,
        url: d.url,
        releasedAt: d.releasedAt,
      })),
      openDecisions: openDecisions.map((d) => ({
        id: d.id,
        kind: d.kind,
        title: d.title,
        prompt: d.prompt,
        schema: d.schema,
        blocking: d.blocking,
        answerUrl: `/api/agent/decisions/${d.id}/answer`,
      })),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Agent project status error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
