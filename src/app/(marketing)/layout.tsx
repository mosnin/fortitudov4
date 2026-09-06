import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/shader/footer";
import { Nav } from "@/components/shader/nav";
import { Providers } from "@/components/shader/providers";
import { SkipToContent } from "@/components/shader/skip-to-content";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "Fortitudo — Websites, Ecommerce, Software & AI Agents",
  description: "Digital agency for websites, ecommerce stores, custom software, AI agents, consultation, and marketing. Defined scope, project pricing, design, development, and launch.",
  openGraph: {
    title: "Fortitudo — Digital Design & Development Agency",
    description: "Websites, ecommerce stores, custom software, AI agents, consultation, and marketing.",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div data-shader-site className={`dark min-h-screen bg-background text-foreground antialiased ${GeistSans.variable}`}>
        <SkipToContent />
        <Nav />
        <main id="main-content" className="relative z-10 min-h-screen bg-background">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
