/**
 * Metadata carrier for `/services`.
 *
 * The page is a Client Component — it uses motion and the interactive service
 * cards — and a Client Component cannot export `metadata`. Without this file
 * the route silently inherits the root layout's title, which is why four
 * marketing pages were all shipping as "Fortitudo Agency | We build it. You
 * own it." in search results and in browser tabs.
 *
 * A layout is the smallest correct fix: it stays a Server Component, exports
 * the metadata, and renders its children untouched.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What we build · Fortitudo Agency",
  description:
    "Websites, software, AI tools, consultation, and digital marketing. Five things, each with a fixed price before we start.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
