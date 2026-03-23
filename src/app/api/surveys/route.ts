import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { satisfactionSurveys, users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const { projectId, score, feedback } = await req.json();

    const [survey] = await db
      .insert(satisfactionSurveys)
      .values({
        projectId,
        userId: dbUser.id,
        score,
        feedback,
      })
      .returning();

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Survey error:", error);
    return NextResponse.json(
      { error: "Failed to submit survey" },
      { status: 500 }
    );
  }
}
