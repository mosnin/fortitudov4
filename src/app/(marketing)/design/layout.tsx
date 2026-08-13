/**
 * Metadata carrier for `/design` — same reason as the `/services` one: the
 * page is a Client Component (it mounts the interactive film roller) and a
 * Client Component cannot export `metadata`; without this file the route
 * would silently inherit the root title in tabs and search results.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design · Fortitudo Agency",
  description:
    "Creative direction, UX, and UI run through everything we build. Every screen decided on purpose, inside the fixed price — never a line item.",
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
