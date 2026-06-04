import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
});

function isStaff(role: string) {
  return role === "admin" || role === "team";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!isStaff(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.status !== undefined) set.status = parsed.data.status;
    if (parsed.data.assigneeId !== undefined) set.assigneeId = parsed.data.assigneeId;
    if (parsed.data.title !== undefined) set.title = parsed.data.title;

    await db.update(tasks).set(set).where(eq(tasks.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!isStaff(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
