import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, onboardingSubmissions, projectPhases } from "@/db/schema";
import { projectPhaseNames } from "@/lib/services";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      serviceType,
      businessName,
      industry,
      website,
      description,
      targetAudience,
      timeline,
      budget,
      brandColors,
      additionalNotes,
    } = body;

    // Look up user by Clerk ID
    const { users } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create project
    const [project] = await db
      .insert(projects)
      .values({
        userId: dbUser.id,
        name: businessName,
        serviceType,
        status: "onboarding",
      })
      .returning();

    // Create onboarding submission
    await db.insert(onboardingSubmissions).values({
      projectId: project.id,
      businessName,
      industry,
      website,
      description,
      targetAudience,
      timeline,
      budget,
      brandColors,
      additionalNotes,
    });

    // Create default phases
    for (let i = 0; i < projectPhaseNames.length; i++) {
      await db.insert(projectPhases).values({
        projectId: project.id,
        name: projectPhaseNames[i],
        order: i,
        status: "pending",
      });
    }

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
