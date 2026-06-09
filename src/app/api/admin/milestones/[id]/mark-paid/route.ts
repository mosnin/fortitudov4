import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { milestones, payments, projects, invoices } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function genInvoiceNumber(): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${d}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

// Admin marks a milestone paid manually (e.g. an offline / wire payment).
// Not a status flip in isolation: it records a real (manual) payment + invoice
// naming the admin who settled it, and advances the project — so manual
// settlements stay consistent with and auditable like webhook ones.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (milestone.status === "paid") return NextResponse.json({ ok: true, skipped: "already paid" });

    const [project] = await db.select().from(projects).where(eq(projects.id, milestone.projectId));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          projectId: project.id,
          userId: project.userId,
          amount: milestone.amount,
          status: "completed",
        })
        .returning({ id: payments.id });

      await tx
        .update(milestones)
        .set({ status: "paid", paidAt: new Date(), paymentId: payment.id })
        .where(eq(milestones.id, id));

      if (project.status === "payment_pending" || project.status === "onboarding") {
        await tx
          .update(projects)
          .set({ status: "in_progress", updatedAt: new Date() })
          .where(eq(projects.id, project.id));
      }

      await tx.insert(invoices).values({
        paymentId: payment.id,
        projectId: project.id,
        userId: project.userId,
        invoiceNumber: genInvoiceNumber(),
        items: [
          {
            description: `Milestone — ${milestone.label} (manual settlement recorded by ${user.email})`,
            amount: (milestone.amount / 100).toFixed(2),
          },
        ],
        subtotal: milestone.amount,
        tax: 0,
        total: milestone.amount,
        status: "paid",
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
