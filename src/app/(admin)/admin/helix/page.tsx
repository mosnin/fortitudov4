import type { Metadata } from "next";
import { HelixThreadList } from "@/components/admin/helix-thread-list";

export const metadata: Metadata = {
  title: "Threads · Helix",
};

export default function HelixThreadsPage() {
  return <HelixThreadList />;
}
