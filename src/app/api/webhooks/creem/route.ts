import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { payments, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

function getSignatureHeader(req: Request): string | null {
  return (
    req.headers.get("x-creem-signature") ??
    req.headers.get("x-signature") ??
    req.headers.get("webhook-signature") ??
    null
  );
}

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateLimit = await checkRateLimit(`creem-webhook:${ip}`, 100, 60_000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // Verify webhook signature
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (!secret) {
      console.error("CREEM_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const signature = getSignatureHeader(req);
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    if (!verifySignature(rawBody, signature, secret)) {
      console.error("Creem webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);
    const { event, data } = body;

    if (event === "payment.completed" || event === "checkout.completed") {
      // The checkout URL is built with metadata[projectId] and
      // metadata[paymentId], so resolve the specific payment row to settle.
      const projectId: string | undefined = data.metadata?.projectId;
      const paymentId: string | undefined = data.metadata?.paymentId;
      const creemPaymentId: string | undefined = data.id;

      if (!projectId) {
        return NextResponse.json({ received: true, skipped: "no projectId" });
      }

      // Idempotency: if we've already settled this Creem payment, ack and stop.
      // Keyed on the unique creemPaymentId so a redelivered webhook is a no-op.
      if (creemPaymentId) {
        const [already] = await db
          .select({ id: payments.id })
          .from(payments)
          .where(eq(payments.creemPaymentId, creemPaymentId))
          .limit(1);

        if (already) {
          return NextResponse.json({
            received: true,
            skipped: "already processed",
          });
        }
      }

      // Resolve the exact payment to settle. Prefer the paymentId carried in
      // metadata; fall back to the project's pending payment. We must NOT update
      // by projectId alone — that would stamp every payment for the project with
      // the same creemPaymentId and violate its unique constraint.
      const [payment] = paymentId
        ? await db
            .select({ id: payments.id })
            .from(payments)
            .where(and(eq(payments.id, paymentId), eq(payments.projectId, projectId)))
            .limit(1)
        : await db
            .select({ id: payments.id })
            .from(payments)
            .where(and(eq(payments.projectId, projectId), eq(payments.status, "pending")))
            .limit(1);

      if (!payment) {
        // Nothing to settle (already done or unknown) — ack so Creem stops retrying.
        return NextResponse.json({ received: true, skipped: "no matching payment" });
      }

      // Update the specific payment, then advance the project.
      try {
        await db
          .update(payments)
          .set({
            status: "completed",
            creemPaymentId: creemPaymentId ?? null,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        await db
          .update(projects)
          .set({
            status: "in_progress",
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      } catch (dbError) {
        console.error(
          "Creem webhook: failed to update payment/project",
          {
            projectId,
            paymentId: payment.id,
            creemPaymentId,
            error: dbError instanceof Error ? dbError.message : dbError,
          }
        );
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Creem webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
