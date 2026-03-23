import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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

    // If admin, return all projects; otherwise just their own
    const userProjects =
      dbUser.role === "admin"
        ? await db.select().from(projects)
        : await db
            .select()
            .from(projects)
            .where(eq(projects.userId, dbUser.id));

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error("Projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
