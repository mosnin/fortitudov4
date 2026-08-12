/**
 * Metadata carrier for `/faq`. See services/layout.tsx for why this is a
 * separate file — the page is a Client Component and cannot export `metadata`.
 *
 * The description names the page's four real category headings, in order, so
 * it stays accurate if the individual questions are reworded.
 */

import type { Metadata } from "next";
import { FAQ } from "@/lib/i18n/dictionaries/faq-page";

/**
 * English because this file is the unprefixed route. Title and description come
 * from the same dictionary as the questions, so the description cannot name the
 * four categories in an order the page no longer uses, and cannot stay English
 * once the page is translated. The `[lang]` tree will read `FAQ[lang]` from a
 * `generateMetadata` here.
 *
 * The dictionary is plain data with no `'use client'`, which is what lets this
 * Server Component import it.
 */
export const metadata: Metadata = {
  title: FAQ.en.meta.title,
  description: FAQ.en.meta.description,
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
