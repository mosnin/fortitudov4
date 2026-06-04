import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ role: z.enum(["client", "team", "admin"]) });

// Owner-only: set a user's role (client / team / admin).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getAuthenticatedUser();
    if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    if (id === me.id && parsed.data.role !== "admin") {
      return NextResponse.json({ error: "You can't demote yourself." }, { status: 400 });
    }

    await db.update(users).set({ role: parsed.data.role, updatedAt: new Date() }).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
