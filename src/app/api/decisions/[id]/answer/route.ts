import { NextResponse } from "next/server";
import { db } from "@/db";
import { decisionRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { answerDecisionRequest } from "@/lib/studio";
import { recordEvent } from "@/lib/activity";
import { z } from "zod";

const answerSchema = z.object({
  response: z.record(z.string(), z.unknown()),
});

// Answer a decision request -> unblocks the build.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [decision] = await db
      .select()
      .from(decisionRequests)
      .where(eq(decisionRequests.id, id));

    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    await verifyProjectAccess(decision.projectId, user.id, user.role);

    const body = await req.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await answerDecisionRequest(id, user.id, parsed.data.response);
    if (!updated) {
      return NextResponse.json(
        { error: "Decision already answered or closed." },
        { status: 409 }
      );
    }

    await recordEvent({
      projectId: decision.projectId,
      actorId: user.id,
      kind: "decision_answered",
      summary: `Answered: ${decision.title}`,
    });

    return NextResponse.json({ decision: updated });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Decision answer error:", error);
    return NextResponse.json({ error: "Failed to answer decision" }, { status: 500 });
  }
}
