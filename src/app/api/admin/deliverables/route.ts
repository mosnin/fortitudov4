import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, deliverables } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { notify } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(["preview", "repo", "deploy_url", "design", "document", "other"]),
  title: z.string().min(1).max(255),
  url: z.string().url().max(2048).optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
});

// Admin posts a deliverable — a real asset lands in the client's Studio.
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

    const { projectId, kind, title, url, description } = parsed.data;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [deliverable] = await db
      .insert(deliverables)
      .values({
        projectId,
        kind,
        title,
        url: url || null,
        description: description || null,
      })
      .returning();

    await notify({
      userId: project.userId,
      projectId,
      type: "file_uploaded",
      title: `New deliverable: ${title}`,
      body: description || "A new deliverable is ready in your Studio.",
      actionUrl: `/projects/${projectId}`,
    });

    return NextResponse.json({ deliverable }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Admin deliverable create error:", error);
    return NextResponse.json({ error: "Failed to post deliverable" }, { status: 500 });
  }
}
