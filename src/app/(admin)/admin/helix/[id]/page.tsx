import type { Metadata } from "next";
import { HelixThread } from "@/components/admin/helix-thread";

export const metadata: Metadata = {
  title: "Thread · Helix",
};

export default async function HelixThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HelixThread threadId={id} />;
}
