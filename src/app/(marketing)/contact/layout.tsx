/**
 * Metadata carrier for `/contact`. See services/layout.tsx for why this is a
 * separate file — the page is a Client Component and cannot export `metadata`.
 *
 * The 24-hour reply is stated on the page itself, so the description repeats a
 * commitment rather than making one.
 */

import type { Metadata } from "next";
import { CONTACT } from "@/lib/i18n/dictionaries/contact";

/**
 * English because this file is the unprefixed route. The title and description
 * come from the same dictionary as the page's prose — a page title left in
 * English under a translated tree is the most visible translation miss there
 * is, so the two travel together. The `[lang]` tree will read `CONTACT[lang]`
 * from a `generateMetadata` here.
 *
 * The dictionary is plain data with no `'use client'`, which is what lets this
 * Server Component import it.
 */
export const metadata: Metadata = {
  title: CONTACT.en.meta.title,
  description: CONTACT.en.meta.description,
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
