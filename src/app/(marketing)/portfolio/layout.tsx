/**
 * Metadata carrier for `/portfolio`. See services/layout.tsx for why this is a
 * separate file — the page is a Client Component and cannot export `metadata`.
 *
 * The description deliberately promises structure rather than volume. The page
 * currently renders an empty state: its six case studies were template filler
 * with invented clients and invented results, and they were removed rather
 * than restyled. A meta description implying a body of published work would
 * put that same claim back, in the one place nobody would think to check.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our work · Fortitudo Agency",
  description:
    "The projects we have built, with the client's name on them. We would rather show you nothing than show you someone else's work.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
