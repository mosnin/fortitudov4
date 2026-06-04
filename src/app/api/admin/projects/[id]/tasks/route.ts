import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  phaseId: z.string().uuid().nullable().optional(),
});

// Staff create a task on a project (and optionally assign it).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin" && user.role !== "team") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.projectId, id));

    const [created] = await db
      .insert(tasks)
      .values({
        projectId: id,
        title: parsed.data.title,
        description: parsed.data.description,
        assigneeId: parsed.data.assigneeId ?? null,
        phaseId: parsed.data.phaseId ?? null,
        order: count ?? 0,
        createdBy: user.id,
      })
      .returning({ id: tasks.id });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
