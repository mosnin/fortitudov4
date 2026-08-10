import type { Metadata } from "next";
import { HelixGadgetView } from "@/components/admin/helix-gadgets";

export const metadata: Metadata = { title: "Gadget · Helix" };

export default async function HelixGadgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HelixGadgetView gadgetId={id} />;
}
