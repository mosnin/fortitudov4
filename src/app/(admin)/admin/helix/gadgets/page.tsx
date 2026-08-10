import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyClients } from "@/db/schema";
import { HelixGadgets } from "@/components/admin/helix-gadgets";
import { HelixBlueprints } from "@/components/admin/helix-blueprints";

export const metadata: Metadata = { title: "Gadgets · Helix" };

export default async function HelixGadgetsPage() {
  // Active clients only — a gadget is always built for someone currently
  // being delivered to.
  const clients = await db
    .select({
      id: agencyClients.id,
      companyName: agencyClients.companyName,
    })
    .from(agencyClients)
    .where(eq(agencyClients.status, "active"))
    .orderBy(asc(agencyClients.companyName));

  return (
    <div className="space-y-10 pb-12">
      <HelixGadgets />
      <div className="mx-auto max-w-5xl">
        <HelixBlueprints clients={clients} />
      </div>
    </div>
  );
}
