import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { createDecisionRequest } from "@/lib/studio";
import { recordEvent } from "@/lib/activity";
import { z } from "zod";

const schema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(["info", "asset", "credential", "approval", "choice"]),
  title: z.string().min(1).max(255),
  prompt: z.string().min(1).max(2000),
  options: z.array(z.string().max(120)).max(8).optional(),
  blocking: z.boolean().optional(),
  dueAt: z.string().datetime().optional(),
});

// Admin raises a decision request — the studio asking the client for something.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, kind, title, prompt, options, blocking, dueAt } = parsed.data;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const decision = await createDecisionRequest({
      projectId,
      userId: project.userId, // notify the client (or their agent)
      kind,
      title,
      prompt,
      schema: options && options.length ? { options } : undefined,
      blocking,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      createdBy: user.id,
    });

    await recordEvent({
      projectId,
      actorId: user.id,
      kind: "decision_opened",
      summary: `Decision raised: ${title}`,
    });

    return NextResponse.json({ decision }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Admin decision create error:", error);
    return NextResponse.json({ error: "Failed to create decision" }, { status: 500 });
  }
}
