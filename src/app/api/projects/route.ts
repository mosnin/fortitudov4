import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuthenticatedUser, getAccessibleProjectIds } from "@/lib/auth-utils";
import { isStaff } from "@/lib/permissions";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    let userProjects;
    if (isStaff(user.role)) {
      // Admins/PMs see everything; VAs only projects they hold a task on.
      const ids = await getAccessibleProjectIds(user.id, user.role);
      userProjects =
        ids === "all"
          ? await db.select().from(projects).limit(100)
          : ids.length === 0
            ? []
            : await db.select().from(projects).where(inArray(projects.id, ids));
    } else {
      userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, user.id));
    }

    return NextResponse.json(userProjects);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
