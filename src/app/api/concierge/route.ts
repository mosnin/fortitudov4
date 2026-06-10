import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { conciergeReply } from "@/lib/concierge";

// LLM call + DB reads — always run on demand, on the Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  projectId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectId, message, history } = parsed.data;

    await verifyProjectAccess(projectId, user.id, user.role);

    const rateLimit = await checkRateLimit(user.id + ":concierge", 20);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { reply, acted } = await conciergeReply({ userId: user.id, projectId, message, history });

    return NextResponse.json({ reply, acted });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Concierge error:", error);
    return NextResponse.json({ error: "Failed to get a reply" }, { status: 500 });
  }
}
