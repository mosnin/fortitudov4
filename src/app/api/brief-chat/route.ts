import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { streamBriefTurn } from "@/lib/brief-agent";

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
  // Pre-flight checks return clean status codes BEFORE we open the stream.
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rate = await checkRateLimit(user.id + ":brief-chat", 40);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "The Brief is not configured yet (missing OPENAI_API_KEY)." },
      { status: 503 }
    );
  }

  // Stream NDJSON: { type:"status", status } lines while the agent works, then a
  // final { type:"done", reply, proposal } (or { type:"error", error }).
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        send({ type: "status", status: "thinking" });
        const { reply, proposal } = await streamBriefTurn(
          user.id,
          parsed.data.messages,
          (status) => send({ type: "status", status })
        );
        send({ type: "done", reply, proposal });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Brief chat failed";
        console.error("Brief chat error:", message);
        send({ type: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
