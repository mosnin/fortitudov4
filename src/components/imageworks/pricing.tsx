import { ArrowButton } from "@/components/imageworks/arrow-button";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
interface Tier {
  name: string;
  blurb: string;
  price: string;
  terms: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}
const TIERS: Tier[] = [
  {
    name: "Plan the project",
    blurb: "For a decision that needs technical clarity.",
    price: "Consultation",
    terms: "A defined review, quoted before work starts.",
    features: [
      "Review your current site, product or workflow",
      "Compare the practical options",
      "Identify dependencies and risks",
      "Receive a written plan for what comes next",
    ],
    cta: "Discuss a consultation",
    href: "/contact?service=consultation",
  },
  {
    name: "Build and launch",
    blurb: "For a website, store or product ready to be built.",
    price: "Fixed scope",
    terms: "One agreed project price. Changes priced separately.",
    features: [
      "A written scope and review milestones",
      "Design and development together",
      "Agreed integrations and testing",
      "Launch, documentation and handover",
    ],
    cta: "Request a project proposal",
    href: "/contact",
    featured: true,
  },
  {
    name: "Improve what’s live",
    blurb: "For an existing product with more to do.",
    price: "Ongoing",
    terms: "A monthly scope and support terms agreed together.",
    features: [
      "Priorities tied to your business needs",
      "Website or software improvements",
      "Maintenance and monitoring as agreed",
      "Clear reviews and next steps",
    ],
    cta: "Discuss ongoing work",
    href: "/contact",
  },
];
function FeatureList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}): ReactNode {
  return (
    <ul className={`space-y-2.5 text-[15px] ${className ?? ""}`}>
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <Check
            className="mt-[3px] h-4 w-4 shrink-0 text-foreground/60"
            strokeWidth={2.25}
            aria-hidden
          />
          <span className="text-foreground/85">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function TierCard({ tier }: { tier: Tier; index: number }): ReactNode {
  const inner = (
    <div className="flex h-full flex-col border-t border-border pt-7 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.375rem] leading-tight font-medium tracking-[-0.01em]">
            {tier.name}
          </h3>
          <p className="mt-1 text-[15px] text-muted-foreground">{tier.blurb}</p>
        </div>
      </div>

      <p className="mt-8 font-sans text-[2.75rem] leading-none tracking-[-0.02em]">
        {tier.price}
      </p>
      <div className="mt-5"><div className="flex items-center gap-3.5"><p className="text-sm leading-6 text-muted-foreground">{tier.terms}</p></div></div>
      <div className="mt-7 border-t border-border pt-6 pb-10">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Includes
        </p>
        <FeatureList items={tier.features} className="mt-4" />
      </div>

      <ArrowButton href={tier.href} className="mt-auto text-[15px]">{tier.cta}</ArrowButton>
    </div>
  );

  return inner;
}

export function Pricing(): ReactNode {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="pricing-heading"
          title="Start where the work needs to start."
          description="Get a clear plan, commission the build, or keep improving after launch. Your proposal defines the deliverables, responsibilities and price before you commit."
        />
        <ul className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:mt-14">
          {TIERS.map((tier, i) => (
            <li key={tier.name} className="min-w-0">
              <Reveal inView delay={0.08 * i} y={24} className="h-full">
                <TierCard tier={tier} index={i} />
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
          Timing depends on scope and the materials we need from you.
          Third-party subscriptions, licenses and ongoing support are identified
          separately in your proposal. Ownership transfers on full payment under
          the agreed terms.
        </p>
      </div>
    </section>
  );
}
