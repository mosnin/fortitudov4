import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  estimatedHours: z.number().int().min(0).max(100000).nullable(),
  actualHours: z.number().int().min(0).max(100000).nullable(),
});

// Admin records scoped vs. actual effort for the estimation feedback loop.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await db
      .update(projects)
      .set({ estimatedHours: parsed.data.estimatedHours, actualHours: parsed.data.actualHours })
      .where(eq(projects.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save estimate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
