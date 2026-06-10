import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { isPendingUser } from "@/lib/team";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({ role: z.enum(["admin", "team", "client"]) });

// Admin-only: change a member's role (promote/demote, or remove from staff by
// setting them back to "client").
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getAuthenticatedUser();
    if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (id === me.id) return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });

    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    await db.update(users).set({ role: parsed.data.role, updatedAt: new Date() }).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Admin-only: revoke a team invite. Only pending (never-signed-in) placeholders
// can be deleted here — a real account is never destroyed from this endpoint.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getAuthenticatedUser();
    if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const [target] = await db.select().from(users).where(eq(users.id, id));
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isPendingUser(target.clerkId)) {
      return NextResponse.json(
        { error: "This member has an active account — set them to client to remove staff access instead." },
        { status: 400 }
      );
    }
    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
