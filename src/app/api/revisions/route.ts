import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { revisionRequests, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  try {
    const revisions = await db
      .select()
      .from(revisionRequests)
      .where(eq(revisionRequests.projectId, projectId));

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("Revisions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { projectId, description } = await req.json();

    const [revision] = await db
      .insert(revisionRequests)
      .values({
        projectId,
        userId: dbUser.id,
        description,
      })
      .returning();

    return NextResponse.json(revision);
  } catch (error) {
    console.error("Revision error:", error);
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}
