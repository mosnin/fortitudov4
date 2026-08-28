import type { ReactNode } from "react";
import { Footer } from "@/components/shader/footer";
import { Nav } from "@/components/shader/nav";
import { Providers } from "@/components/shader/providers";
import { SkipToContent } from "@/components/shader/skip-to-content";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div data-shader-site className="dark min-h-screen bg-background text-foreground antialiased">
        <SkipToContent />
        <Nav />
        <main id="main-content" className="relative z-10 min-h-screen bg-background">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
