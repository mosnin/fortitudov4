import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  // In production, verify the webhook signature with Creem's secret
  try {
    const body = await req.json();

    // Handle Creem.io payment webhook
    const { event, data } = body;

    if (event === "payment.completed" || event === "checkout.completed") {
      const projectId = data.metadata?.projectId;

      if (projectId) {
        // Update payment status
        await db
          .update(payments)
          .set({
            status: "completed",
            creemPaymentId: data.id,
            updatedAt: new Date(),
          })
          .where(eq(payments.projectId, projectId));

        // Update project status to in_progress
        await db
          .update(projects)
          .set({
            status: "in_progress",
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
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
