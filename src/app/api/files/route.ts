import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { files, users } from "@/db/schema";
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
    const projectFiles = await db
      .select()
      .from(files)
      .where(eq(files.projectId, projectId));

    return NextResponse.json(projectFiles);
  } catch (error) {
    console.error("Files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
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

    const { projectId, name, url, size, type } = await req.json();

    const [file] = await db
      .insert(files)
      .values({
        projectId,
        uploadedBy: dbUser.id,
        name,
        url,
        size,
        type,
      })
      .returning();

    return NextResponse.json(file);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }
}
