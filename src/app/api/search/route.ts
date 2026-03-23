import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, messages, files, users } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pattern = `%${q}%`;

    // Search projects
    const projectResults = await db
      .select()
      .from(projects)
      .where(
        dbUser.role === "admin"
          ? ilike(projects.name, pattern)
          : or(
              eq(projects.userId, dbUser.id),
              ilike(projects.name, pattern)
            ) ?? ilike(projects.name, pattern)
      )
      .limit(5);

    // Search messages
    const messageResults = await db
      .select()
      .from(messages)
      .where(ilike(messages.content, pattern))
      .limit(5);

    // Search files
    const fileResults = await db
      .select()
      .from(files)
      .where(ilike(files.name, pattern))
      .limit(5);

    const results = [
      ...projectResults.map((p) => ({
        id: p.id,
        type: "project" as const,
        title: p.name,
        subtitle: `${p.serviceType} · ${p.status}`,
        href: `/projects/${p.id}`,
      })),
      ...messageResults.map((m) => ({
        id: m.id,
        type: "message" as const,
        title: m.content.substring(0, 80),
        subtitle: `Message · ${m.role}`,
        href: "/messages",
      })),
      ...fileResults.map((f) => ({
        id: f.id,
        type: "file" as const,
        title: f.name,
        subtitle: `File · ${f.type || "unknown"}`,
        href: `/projects/${f.projectId}`,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
