import type { Metadata } from "next";
import { HelixApprovals } from "@/components/admin/helix-approvals";

export const metadata: Metadata = {
  title: "Approvals · Helix",
};

export default function HelixApprovalsPage() {
  return <HelixApprovals />;
}
