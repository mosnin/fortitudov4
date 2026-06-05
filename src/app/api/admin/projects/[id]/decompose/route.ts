import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { decomposeBuild, DecomposeBlockedError } from "@/lib/decompose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Admin-only: decompose the Blueprint into a full phase + task DAG.
// Pass { force: true } to replace a plan that already has started work.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { force?: boolean };
    const result = await decomposeBuild(id, { force: body?.force === true });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // Started work would be wiped — surface as a confirmable conflict, not a 500.
    if (error instanceof DecomposeBlockedError) {
      return NextResponse.json({ error: error.message, needsForce: true }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Decomposition failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
