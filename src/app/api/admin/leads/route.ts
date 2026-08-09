import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { canManageLeads } from "@/lib/permissions";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

/** Require the caller to be allowed to view/triage leads (admin or PM). */
async function requireLeadManager() {
  const user = await getAuthenticatedUser();
  if (!canManageLeads(user.role)) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

/**
 * GET /api/admin/leads — leads inbox feed for the pipeline triage page.
 * Optional ?status= filter. Lead PII (name/email/phone/budget) is gated to
 * admins and project managers via canManageLeads.
 */
export async function GET(req: Request) {
  try {
    await requireLeadManager();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const statusFilter =
      status && (leadStatuses as readonly string[]).includes(status)
        ? eq(leads.status, status as (typeof leadStatuses)[number])
        : undefined;

    const rows = await db
      .select()
      .from(leads)
      .where(statusFilter)
      .orderBy(desc(leads.createdAt))
      .limit(200);

    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(leadStatuses),
});

/**
 * PATCH /api/admin/leads — lead status update (pipeline triage).
 */
export async function PATCH(req: Request) {
  try {
    await requireLeadManager();

    const body = await req.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(leads)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(leads.id, parsed.data.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Lead update error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
