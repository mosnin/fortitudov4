import type { Metadata } from "next";
import { ClientGadgets } from "@/components/dashboard/client-gadgets";

export const metadata: Metadata = { title: "Tools" };

export default function ClientToolsPage() {
  return <ClientGadgets />;
}
