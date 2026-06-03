import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  label: z.string().min(1).max(255),
  amountUsd: z.number().positive().max(1_000_000),
  description: z.string().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
});

// Admin creates a payable milestone for a project.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(milestones)
      .where(eq(milestones.projectId, id));

    const [created] = await db
      .insert(milestones)
      .values({
        projectId: id,
        label: parsed.data.label,
        description: parsed.data.description,
        amount: Math.round(parsed.data.amountUsd * 100),
        order: count ?? 0,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      })
      .returning({ id: milestones.id });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
