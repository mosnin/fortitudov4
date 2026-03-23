import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projectPhases, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const phases = await db
      .select()
      .from(projectPhases)
      .where(eq(projectPhases.projectId, id));

    return NextResponse.json(phases);
  } catch (error) {
    console.error("Phases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch phases" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can update phases
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { phaseId, status } = await req.json();

    const [updated] = await db
      .update(projectPhases)
      .set({
        status,
        ...(status === "in_progress" ? { startedAt: new Date() } : {}),
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      })
      .where(
        and(
          eq(projectPhases.id, phaseId),
          eq(projectPhases.projectId, id)
        )
      )
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Phase update error:", error);
    return NextResponse.json(
      { error: "Failed to update phase" },
      { status: 500 }
    );
  }
}
