import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { SPECTRUM_CLASS } from "./lib/spectrum";
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

function TierCard({ tier }: { tier: Tier }): ReactNode {
  const inner = (
    <div className="flex h-full flex-col rounded-[15px] bg-background p-6 sm:p-7">
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
      <p className="mt-3 text-sm text-muted-foreground">{tier.terms}</p>
      <div className="mt-7 border-t border-border pt-6 pb-10">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Includes
        </p>
        <FeatureList items={tier.features} className="mt-4" />
      </div>

      <Link
        href={tier.href}
        className={`group mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-[opacity,background-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] ${
          tier.featured
            ? "bg-foreground text-background hover:opacity-85"
            : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.14]"
        }`}
      >
        {tier.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );

  if (tier.featured) {
    return (
      <div className="relative h-full rounded-2xl shadow-[0_28px_60px_-32px_rgba(0,0,0,0.28)] dark:shadow-none">
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-2xl [background-size:200%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
        />
        <div className="relative h-full p-px">{inner}</div>
      </div>
    );
  }
  return (
    <div className="h-full rounded-2xl border border-border transition-colors hover:border-foreground/20">
      {inner}
    </div>
  );
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
        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
          {TIERS.map((tier, i) => (
            <li key={tier.name} className="min-w-0">
              <Reveal inView delay={0.08 * i} y={24} className="h-full">
                <TierCard tier={tier} />
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
