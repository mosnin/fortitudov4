import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { milestones, payments } from "@/db/schema";
import { getAuthenticatedUser, verifyProjectAccess } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Client starts payment for a milestone: create a pending payment and return a
// Creem checkout URL. The webhook settles it (metadata carries milestoneId).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (milestone.status === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
    }

    await verifyProjectAccess(milestone.projectId, user.id, user.role);

    const [payment] = await db
      .insert(payments)
      .values({
        projectId: milestone.projectId,
        userId: user.id,
        amount: milestone.amount,
        currency: "usd",
        status: "pending",
      })
      .returning({ id: payments.id });

    // Link the payment so the UI can reflect intent even before settlement.
    await db.update(milestones).set({ paymentId: payment.id }).where(eq(milestones.id, id));

    const base = process.env.NEXT_PUBLIC_CREEM_CHECKOUT_URL;
    const checkoutUrl = base
      ? `${base}?metadata[projectId]=${milestone.projectId}&metadata[paymentId]=${payment.id}&metadata[milestoneId]=${milestone.id}`
      : null;

    return NextResponse.json({ checkoutUrl, paymentId: payment.id, amount: milestone.amount });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
