/**
 * Metadata carrier for `/contact`. See services/layout.tsx for why this is a
 * separate file — the page is a Client Component and cannot export `metadata`.
 *
 * The 24-hour reply is stated on the page itself, so the description repeats a
 * commitment rather than making one.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to us · Fortitudo Agency",
  description:
    "Tell us what you want built and what it should do for you. We answer within 24 hours on working days.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
