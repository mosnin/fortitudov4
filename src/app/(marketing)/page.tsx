import { CinematicHero } from "@/components/imageworks/cinematic-hero";
import { OurWork } from "@/components/imageworks/our-work";
import { SourceServiceCards } from "@/components/imageworks/source-service-cards";
import { ResourceCards } from "@/components/imageworks/resource-cards";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Home() { return <div className="hero-page"><CinematicHero/><section className="hero-section-01-next" data-hero-next aria-label="Fortitudo work and services"><OurWork/><SourceServiceCards/><ResourceCards featured/><FinalCta/></section></div>; }
