import { ArrowButton } from "./arrow-button";
import { SectionHeading } from "./section-heading";
export function FinalCta() {
  return <section className="px-4 py-28 sm:px-6 sm:py-40"><div className="mx-auto max-w-[1440px] border-t border-border pt-16"><SectionHeading id="cta-heading" title="Tell us what you want to build." description="Bring your current site or product, what needs to change, and your target date. We will put the proposed scope, milestones and price in writing." aside={<ArrowButton href="/contact">Request a proposal</ArrowButton>} /></div></section>;
}
