import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { runBriefTurn } from "@/lib/brief-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(60),
});

export async function POST(req: Request) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rate = checkRateLimit(user.id + ":brief-chat", 40);
    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { reply, proposal } = await runBriefTurn(user.id, parsed.data.messages);
    return NextResponse.json({ reply, proposal });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Brief chat failed";
    console.error("Brief chat error:", message);
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
