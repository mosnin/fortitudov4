import { NextResponse } from "next/server";
import { db } from "@/db";
import { agencyClients, clientPayments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-utils";

/**
 * GET /api/admin/client-payments — every collected client payment, newest
 * first, joined to the roster client it belongs to. Admin-only.
 *
 * This is the money the agency actually took in; the Payments page filters,
 * charts, and edits it in place. Amounts are cents.
 */
export async function GET() {
  try {
    await requireAdmin();

    const rows = await db
      .select({
        id: clientPayments.id,
        clientId: clientPayments.clientId,
        companyName: agencyClients.companyName,
        contactName: agencyClients.contactName,
        paymentType: clientPayments.paymentType,
        method: clientPayments.method,
        amount: clientPayments.amount,
        paidAt: clientPayments.paidAt,
        notes: clientPayments.notes,
      })
      .from(clientPayments)
      .leftJoin(agencyClients, eq(clientPayments.clientId, agencyClients.id))
      .orderBy(desc(clientPayments.paidAt));

    return NextResponse.json({ payments: rows });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Client payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
