import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
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
    const projectMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId));

    return NextResponse.json(projectMessages);
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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

    const { projectId, content } = await req.json();

    const [message] = await db
      .insert(messages)
      .values({
        projectId,
        senderId: dbUser.id,
        role: dbUser.role === "admin" ? "admin" : "client",
        content,
      })
      .returning();

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
