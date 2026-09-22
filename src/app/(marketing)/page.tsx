import { CinematicHero } from "@/components/imageworks/cinematic-hero";
import { OurWork } from "@/components/imageworks/our-work";
import { SourceServiceCards } from "@/components/imageworks/source-service-cards";
import { HomeProcess, HomeAgency, HomeDecks } from "@/components/imageworks/homepage-sections";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Home() { return <div className="hero-page"><CinematicHero/><section className="hero-section-01-next" data-hero-next aria-label="Fortitudo work and services"><OurWork/><SourceServiceCards/><HomeProcess/><HomeAgency/><HomeDecks/><FinalCta/></section></div>; }
