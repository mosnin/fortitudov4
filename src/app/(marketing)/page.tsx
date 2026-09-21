import { CinematicHero } from "@/components/imageworks/cinematic-hero";
import { StackedFeatures } from "@/components/imageworks/stacked-features";
import { Capabilities } from "@/components/imageworks/capabilities";
import { OurWork } from "@/components/imageworks/our-work";
import { Pricing } from "@/components/imageworks/pricing";
import { Faq } from "@/components/imageworks/faq";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Home() {
  return <div className="hero-page"><CinematicHero /><section className="hero-section-01-next" data-hero-next aria-label="Our capabilities and work"><StackedFeatures /><OurWork /><Capabilities /><Pricing /><Faq /><FinalCta /></section></div>;
}
