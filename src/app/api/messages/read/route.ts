import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ projectId: z.string().uuid() });

// Mark the *other* party's messages in a thread as read for the current user.
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { projectId } = parsed.data;
    await verifyProjectAccess(projectId, user.id, user.role);

    const incoming = user.role === "admin" || user.role === "team" ? "client" : "admin";
    await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.projectId, projectId), eq(messages.role, incoming), eq(messages.read, false)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
