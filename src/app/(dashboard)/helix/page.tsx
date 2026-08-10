import type { Metadata } from "next";
import { HelixClientPanel } from "@/components/dashboard/helix-client-panel";

export const metadata: Metadata = { title: "Helix" };

export default function ClientHelixPage() {
  return <HelixClientPanel />;
}
