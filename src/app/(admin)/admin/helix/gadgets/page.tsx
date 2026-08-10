import type { Metadata } from "next";
import { HelixGadgets } from "@/components/admin/helix-gadgets";

export const metadata: Metadata = { title: "Gadgets · Helix" };

export default function HelixGadgetsPage() {
  return <HelixGadgets />;
}
