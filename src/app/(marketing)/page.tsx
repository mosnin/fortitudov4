import { CinematicHero } from "@/components/imageworks/cinematic-hero";
import { AgencyIntroduction, AgencyServices, AgencyDelivery } from "@/components/imageworks/agency-services";
import { OurWork } from "@/components/imageworks/our-work";
import { ResourceCards } from "@/components/imageworks/resource-cards";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Home() { return <div className="hero-page"><CinematicHero/><section className="hero-section-01-next" data-hero-next aria-label="Fortitudo services and selected work"><AgencyIntroduction/><OurWork/><AgencyServices/><AgencyDelivery/><ResourceCards featured/><FinalCta/></section></div>; }
