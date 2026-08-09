import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { IntroPanel } from "@/components/landing/intro-panel";
import { FeaturedQuote } from "@/components/landing/featured-quote";
import { PackagesSection } from "@/components/landing/packages";
import { AdvantageSection } from "@/components/landing/advantage";
import { StartSplitSection } from "@/components/landing/start-split";
import { FoundersSection } from "@/components/landing/founders";
import { CapabilitiesSection } from "@/components/landing/capabilities";
import { FAQSection } from "@/components/landing/faq";
import { FinalCTASection } from "@/components/landing/final-cta";
import { StackBand } from "@/components/landing/stack-band";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="bg-cream">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LogoMarquee />
        <IntroPanel />
        <FeaturedQuote />
        <PackagesSection />
        <AdvantageSection />
        <StartSplitSection />
        <FoundersSection />
        <CapabilitiesSection />
        <FAQSection />
        <FinalCTASection />
        <StackBand />
      </main>
      <Footer />
    </div>
  );
}
