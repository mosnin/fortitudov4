/**
 * Metadata carrier for `/faq`. See services/layout.tsx for why this is a
 * separate file — the page is a Client Component and cannot export `metadata`.
 *
 * The description names the page's four real category headings, in order, so
 * it stays accurate if the individual questions are reworded.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions · Fortitudo Agency",
  description:
    "What people ask before they hire us: getting started, price and payment, how your project runs, and the tech we build on.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
