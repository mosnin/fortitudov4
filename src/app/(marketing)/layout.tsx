import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MotionSwitch } from "@/components/imageworks/motion-switch";
import { ThemeSwitch } from "@/components/imageworks/theme-switch";
import { Footer } from "@/components/imageworks/footer";
import { MotionShell } from "@/components/imageworks/motion-shell";
import { Providers } from "@/components/imageworks/providers";
import { SkipToContent } from "@/components/imageworks/skip-to-content";
import { GeistSans } from "geist/font/sans";
import "./imageworks.css";
import "./premium.css";
import "./animation-library.css";
import "./expansion.css";
import "./agency.css";

export const metadata: Metadata = {
  title: "Fortitudo — Websites, Ecommerce, Software & AI Agents",
  description:
    "Digital agency for websites, ecommerce stores, custom software, AI agents, brand implementation, Unslop and consultation. Defined scope, project pricing, design, development, and launch.",
  openGraph: {
    title: "Fortitudo — Digital Design & Development Agency",
    description:
      "Websites, ecommerce stores, custom software, AI agents, brand implementation, Unslop and consultation.",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div
        data-imageworks-site
        className={`min-h-screen bg-background text-foreground antialiased ${GeistSans.variable}`}
      >
        <SkipToContent />
        <MotionShell controls={<><MotionSwitch /><ThemeSwitch /></>}>
        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 min-h-screen bg-background"
        >
          {children}
        </main>
        <Footer />
        </MotionShell>
      </div>
    </Providers>
  );
}
