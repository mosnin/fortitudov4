import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MotionSwitch } from "@/components/imageworks/motion-switch";
import { Footer } from "@/components/imageworks/footer";
import { Nav } from "@/components/imageworks/nav";
import { Providers } from "@/components/imageworks/providers";
import { SkipToContent } from "@/components/imageworks/skip-to-content";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif } from "next/font/google";
import "./imageworks.css";
const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fortitudo — Websites, Ecommerce, Software & AI Agents",
  description:
    "Digital agency for websites, ecommerce stores, custom software, AI agents, consultation, and marketing. Defined scope, project pricing, design, development, and launch.",
  openGraph: {
    title: "Fortitudo — Digital Design & Development Agency",
    description:
      "Websites, ecommerce stores, custom software, AI agents, consultation, and marketing.",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div
        data-imageworks-site
        className={`dark min-h-screen bg-background text-foreground antialiased ${GeistSans.variable} ${display.variable}`}
      >
        <SkipToContent />
        <Nav />
        <main
          id="main-content"
          className="relative z-10 min-h-screen bg-background"
        >
          {children}
        </main>
        <Footer />
        <MotionSwitch />
      </div>
    </Providers>
  );
}
