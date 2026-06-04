import { NextResponse } from "next/server";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { loadCredentialWithAccess } from "@/lib/credentials";
import { decryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reveal a provided credential's secret (decrypted server-side, access-checked).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const cred = await loadCredentialWithAccess(id, user);
    if (!cred) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (cred.status !== "provided" || !cred.secret) {
      return NextResponse.json({ error: "Nothing to reveal yet" }, { status: 409 });
    }

    return NextResponse.json({ secret: decryptSecret(cred.secret) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reveal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
