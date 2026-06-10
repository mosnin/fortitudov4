import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { addMemory, searchMemory } from "@/lib/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  scope: z.enum(["global", "client", "project"]),
  kind: z.enum(["preference", "pattern", "decision", "fact", "component"]),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(4000),
  userId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

// What the studio knows. Search the agency's compounding memory.
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const projectId = searchParams.get("projectId") ?? undefined;

    const rows = await searchMemory({ query, userId, projectId, limit: 50 });
    return NextResponse.json({ rows });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Admin memory search error:", error);
    return NextResponse.json({ error: "Failed to search memory" }, { status: 500 });
  }
}

// Record a new piece of agency knowledge.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await addMemory({ ...parsed.data, createdBy: user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Admin memory create error:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}
