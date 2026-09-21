import { PageIntro } from "@/components/imageworks/page-intro";
import { ServiceDirectory } from "@/components/imageworks/service-directory";
import { FinalCta } from "@/components/imageworks/final-cta";
export const metadata = { title: "Services — Fortitudo", description: "Website design, ecommerce, custom software, AI implementation, brand and advisory. Explore our services and download detailed pitch decks.", alternates: { canonical: "/services" } };
export default function ServicesPage() { return <><PageIntro label="Services" title="The right team for your next chapter." lead="Design and development for your business. Commission a complete product, strengthen an existing platform or bring us a focused technical challenge."/><ServiceDirectory/><FinalCta/></>; }
