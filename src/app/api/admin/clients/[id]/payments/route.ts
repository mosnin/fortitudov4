import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  agencyClients,
  clientPayments,
  clientPaymentTypeEnum,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-utils";
import { z } from "zod";
import { addMonthsUTC } from "@/lib/dates";

const recordSchema = z.object({
  paymentType: z.enum(clientPaymentTypeEnum.enumValues),
  method: z.string().min(1).max(50),
  // Optional override in cents; defaults to the client's fee for the type.
  amount: z.number().int().positive().optional(),
  // When the money actually landed; defaults to now.
  paidAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

/**
 * POST /api/admin/clients/[id]/payments — record a collected payment.
 * Amount defaults from the client's setup/monthly fee; a monthly retainer
 * advances the client's next due date by one month (from the later of the
 * current due date or today, so overdue clients land back in the future).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const parsed = recordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { paymentType, method, amount, notes, paidAt } = parsed.data;

    const [client] = await db
      .select()
      .from(agencyClients)
      .where(eq(agencyClients.id, id));
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const finalAmount =
      amount ??
      (paymentType === "setup_fee" ? client.setupFee : client.monthlyFee);
    if (finalAmount <= 0) {
      return NextResponse.json(
        { error: "This client has no fee set for that payment type" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(clientPayments)
      .values({
        clientId: id,
        paymentType,
        method,
        amount: finalAmount,
        notes,
        ...(paidAt && { paidAt: new Date(paidAt) }),
        createdBy: admin.id,
      })
      .returning();

    // A collected retainer pushes the next due date a month out and brings a
    // paused/overdue client back to Active (an overdue client is Active with a
    // past-due date, so advancing the date clears the overdue flag too).
    if (paymentType === "monthly_retainer") {
      const base =
        client.nextDueDate && new Date(client.nextDueDate) > new Date()
          ? new Date(client.nextDueDate)
          : new Date();
      const next = addMonthsUTC(base, 1);
      await db
        .update(agencyClients)
        .set({
          nextDueDate: next,
          ...(client.status !== "churned" && { status: "active" as const }),
          updatedAt: new Date(),
        })
        .where(eq(agencyClients.id, id));
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
