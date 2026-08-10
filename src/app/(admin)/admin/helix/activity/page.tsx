import type { Metadata } from "next";
import { HelixActivity } from "@/components/admin/helix-activity";

export const metadata: Metadata = { title: "Activity · Helix" };

export default function HelixActivityPage() {
  return <HelixActivity />;
}
