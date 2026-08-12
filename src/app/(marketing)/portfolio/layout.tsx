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
import { PORTFOLIO } from "@/lib/i18n/dictionaries/portfolio";

/**
 * English because this file is the unprefixed route. Title and description come
 * from the same dictionary as the empty state, so the promise made in search
 * results stays the one the page keeps — in every language, not just this one.
 * The `[lang]` tree will read `PORTFOLIO[lang]` from a `generateMetadata` here.
 *
 * The dictionary is plain data with no `'use client'`, which is what lets this
 * Server Component import it.
 */
export const metadata: Metadata = {
  title: PORTFOLIO.en.meta.title,
  description: PORTFOLIO.en.meta.description,
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
