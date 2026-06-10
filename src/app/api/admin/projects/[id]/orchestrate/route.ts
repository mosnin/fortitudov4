import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { orchestrateNext, orchestrateRevisions } from "@/lib/orchestrator";
import { notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = z.object({ all: z.boolean().optional(), mode: z.enum(["draft", "revise"]).optional() });

// Admin-only: run the supervised execution orchestrator. It drafts ready tasks
// (or revises sent-back tasks) and lands them in human review — never auto-approves.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    const all = parsed.success ? parsed.data.all === true : false;
    const mode = parsed.success ? parsed.data.mode ?? "draft" : "draft";

    const result =
      mode === "revise"
        ? await orchestrateRevisions(id, user.id, { max: 5 })
        : await orchestrateNext(id, user.id, { max: all ? 5 : 1 });

    // Ping the other reviewers — there's fresh agent work waiting on a human.
    if (result.drafted.length > 0) {
      await notifyAdmins(
        {
          projectId: id,
          type: "phase_update",
          title: mode === "revise" ? "Agent revised work for review" : "Agent drafted work for review",
          body: result.message,
          actionUrl: `/admin/projects/${id}`,
        },
        user.id
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // getAuthenticatedUser throws a NextResponse (401) for unauthenticated callers.
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Orchestration failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
