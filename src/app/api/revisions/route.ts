import { NextResponse } from "next/server";
import { db } from "@/db";
import { revisionRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { canManageProjects } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";

const createRevisionSchema = z.object({
  projectId: z.string().uuid(),
  description: z.string().min(1).max(5000),
});

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    await verifyProjectAccess(projectId, user.id, user.role);

    const revisions = await db
      .select()
      .from(revisionRequests)
      .where(eq(revisionRequests.projectId, projectId))
      .limit(50);

    return NextResponse.json(revisions);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Revisions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const parsed = createRevisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, description } = parsed.data;

    await verifyProjectAccess(projectId, user.id, user.role);

    const rateLimit = checkRateLimit(user.id + ":revisions", 10);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const [revision] = await db
      .insert(revisionRequests)
      .values({
        projectId,
        userId: user.id,
        description,
      })
      .returning();

    return NextResponse.json(revision);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Revision error:", error);
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}

const patchRevisionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "rejected"]),
  adminNotes: z.string().max(5000).optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!canManageProjects(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patchRevisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, status, adminNotes } = parsed.data;

    const [updated] = await db
      .update(revisionRequests)
      .set({
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        updatedAt: new Date(),
      })
      .where(eq(revisionRequests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Revision update error:", error);
    return NextResponse.json(
      { error: "Failed to update revision" },
      { status: 500 }
    );
  }
}
