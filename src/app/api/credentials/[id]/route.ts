import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { credentials } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { loadCredentialWithAccess } from "@/lib/credentials";
import { encryptSecret, hasCredentialsKey } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const provideSchema = z.object({ secret: z.string().min(1).max(4000) });

// Fulfill a requested credential by providing the (encrypted) secret.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const cred = await loadCredentialWithAccess(id, user);
    if (!cred) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const parsed = provideSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    if (!hasCredentialsKey()) {
      return NextResponse.json({ error: "Secret storage isn't configured (CREDENTIALS_KEY)." }, { status: 503 });
    }

    await db
      .update(credentials)
      .set({ secret: encryptSecret(parsed.data.secret.trim()), status: "provided", updatedAt: new Date() })
      .where(eq(credentials.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const cred = await loadCredentialWithAccess(id, user);
    if (!cred) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.delete(credentials).where(eq(credentials.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
