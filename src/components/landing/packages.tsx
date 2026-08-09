"use client";

import { motion } from "motion/react";
import { PressButton } from "./press-button";
import { SectionRails, CrossRule } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";
import { Chip } from "./chip";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Package {
  name: string;
  description: string;
  propLabel: string;
  propRotation: number;
  chips: string[];
  price: string;
  href: string;
  cta: string;
  darkCta?: boolean;
}

const packages: Package[] = [
  {
    name: "Validate",
    description: "Prove demand before the big build",
    propLabel: "Card prop — funnel object",
    propRotation: -28,
    chips: ["Landing pages", "Funnels", "Email capture", "A/B testing"],
    price: "From $1,200",
    href: "/sign-up?service=funnels",
    cta: "Get a quote instantly",
  },
  {
    name: "Launch",
    description: "Your first storefront, ready to sell",
    propLabel: "Card prop — storefront object",
    propRotation: 22,
    chips: ["Storefront", "Payments", "Inventory", "SEO"],
    price: "From $1,800",
    href: "/sign-up?service=ecommerce_store",
    cta: "Get a quote instantly",
  },
  {
    name: "Scale",
    description: "Custom software that grows with you",
    propLabel: "Card prop — ladder object",
    propRotation: -18,
    chips: ["SaaS", "Dashboards", "Auth", "APIs"],
    price: "From $2,500",
    href: "/sign-up?service=web_application",
    cta: "Get a quote instantly",
  },
  {
    name: "Custom Package",
    description: "Scoped around whatever you're building",
    propLabel: "Card prop — gift box object",
    propRotation: 26,
    chips: ["AI workflows", "Open Claw", "Integrations", "Migrations"],
    price: "Custom quote",
    href: "/contact",
    cta: "Talk to our team",
    darkCta: true,
  },
];

export function PackagesSection() {
  return (
    <section className="relative flex items-center overflow-clip border-b border-line bg-surface px-4 py-16 md:min-h-[max(720px,90vh)] md:px-6 md:py-20 lg:px-16">
      <SectionRails />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-6 px-4 md:px-6">
          <h2 className="font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[40px] lg:text-[48px]">
            Builds Designed Around Your Startup&apos;s Journey
          </h2>
          <p className="text-[18px] leading-[120%] tracking-[-0.015em] text-ink-soft md:text-[20px]">
            From your first check to your next round, we&apos;ve built packages
            for every phase.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <CrossRule className="top-0" />
          <CrossRule className="bottom-0" />

          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: EASE }}
              className="flex h-full flex-col overflow-clip rounded-[24px] border border-line bg-white shadow-[0_0_24px_0_rgba(25,25,25,0.05)]"
            >
              {/* Nested header card with tilted prop hanging off the edge */}
              <div className="relative -mx-px -mt-px flex h-[160px] flex-col justify-end gap-3 overflow-clip rounded-[24px] border border-line bg-white p-5 shadow-[0_0_24px_0_rgba(25,25,25,0.35)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{ top: 7, right: -31, width: 120, height: 143 }}
                >
                  <div style={{ transform: `rotate(${pkg.propRotation}deg)` }}>
                    <ImagePlaceholder
                      label={pkg.propLabel}
                      className="h-[125px] w-[80px] rounded-[10px]"
                    />
                  </div>
                </div>
                <div className="relative flex flex-col items-start gap-3">
                  <h3 className="font-mono text-[24px] leading-none tracking-[-1.024px] text-ink md:text-[32px]">
                    {pkg.name}
                  </h3>
                  <p className="text-[14px] leading-[1.2] font-medium tracking-[-0.21px] text-ink-soft [text-wrap:balance]">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Chip body */}
              <div className="flex flex-1 flex-col border-b border-line p-5">
                <p className="text-center text-[12px] font-medium text-ink-soft [text-wrap:balance]">
                  Included in this package:
                </p>
                <div className="mt-3 flex flex-wrap items-start justify-center gap-3">
                  {pkg.chips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
                <p className="mt-auto pt-4 text-center text-[12px] font-medium text-ink">
                  {pkg.price}
                </p>
              </div>

              {/* CTA footer */}
              <div className="p-3">
                <PressButton
                  href={pkg.href}
                  variant={pkg.darkCta ? "dark" : "orange"}
                  size="md"
                  className="w-full"
                >
                  {pkg.cta}
                </PressButton>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[12px] font-medium text-ink-soft">
          ✱ Every package ships with real-time build tracking in your
          dashboard.
        </p>
      </div>
    </section>
  );
}
