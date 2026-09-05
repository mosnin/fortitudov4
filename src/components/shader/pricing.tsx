"use client";

import { motion, useInView } from "motion/react";
import { Check } from "lucide-react";
import { ArrowChip } from "@/components/shader/arrow-chip";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { RevealHeadline } from "./reveal-headline";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

interface Tier {

  name: string;

  price: string | null;

  unit?: string;

  body: string;

  cta: { label: string; href: string };
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Get it built",
    price: null,
    body: "For the launch, rebuild, or business problem you are ready to tackle. We agree on what needs to happen and what it costs before we start.",
    cta: { label: "Talk through your project", href: "/contact" },
    features: [
      "A written scope and agreed milestones",
      "Direct access to the people building it",
      "Progress, decisions, and files in one place",
      "Review, testing, and launch",
      "Your code, assets, and accounts handed over",
    ],
  },
  {
    name: "Keep it moving",
    price: null,
    body: "For improvements after launch: a better customer journey, reliable business systems, and marketing that keeps working. We agree on the monthly scope and response expectations together.",
    cta: { label: "Talk about support", href: "/contact" },
    features: [
      "A clear monthly scope",
      "Improvements tied to your business priorities",
      "Maintenance and monitoring",
      "Website and campaign improvements as agreed",
      "The same visible project workflow",
    ],
  },
];

export function Pricing(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);

  const inView = useInView(sectionRef, { once: true, amount: 0.25 });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative w-full bg-background text-foreground"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-[1680px] mx-auto px-10 max-[850px]:px-6 py-32 max-[850px]:py-24">
        <div className="grid grid-cols-12 gap-x-10 gap-y-6 max-[850px]:grid-cols-1">
          <div className="col-span-3 max-[1100px]:col-span-12 max-[850px]:col-span-1 pt-2">
            <motion.span
              initial={false}
              animate={{ y: inView ? 0 : 8 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              className="inline-flex items-center rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70"
            >
              Pricing
            </motion.span>
          </div>

          <div className="col-span-7 col-start-6 max-[1100px]:col-span-12 max-[1100px]:col-start-1 max-[850px]:col-span-1">
            <RevealHeadline
              id="pricing-heading"
              delay={0.05}
              className="text-balance text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[0.85] tracking-tight"
            >
              Know what you’re getting. Know what it costs.
            </RevealHeadline>
            <motion.p
              initial={false}
              animate={{ y: inView ? 0 : 8 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.18 }}
              className="mt-6 max-w-[60ch] text-balance text-xl max-[850px]:text-lg font-light leading-snug text-foreground/60"
            >
              We price the work around your actual needs, with the scope, cost, and
              next steps in front of you. Your project price stays fixed unless
              we agree on a change together.
            </motion.p>
          </div>
        </div>

        <div className="mt-20 max-[850px]:mt-12 grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1 max-[1100px]:gap-4">
          {TIERS.map((tier, i) => (
            <motion.article
              key={tier.name}
              initial={false}
              animate={{ y: inView ? 0 : 20 }}
              transition={{
                duration: 0.8,
                ease: easeOutExpo,
                delay: 0.25 + i * 0.08,
              }}

              className="relative flex"
            >
              <div
                className={[
                  "group relative flex flex-1 flex-col",
                  "rounded-2xl p-10 max-[850px]:p-7",

                  "bg-foreground/[0.04] hover:bg-foreground/[0.06]",

                  "transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                ].join(" ")}
              >
              <div>
                <h3 className="text-3xl max-[850px]:text-2xl font-medium leading-tight tracking-tight">
                  {tier.name}
                </h3>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl max-[850px]:text-4xl font-medium tracking-tight">
                    {tier.price ?? "Quoted"}
                  </span>
                  {tier.price && tier.unit ? (
                    <span className="text-sm text-foreground/55">
                      {tier.unit}
                    </span>
                  ) : null}
                </div>

                <p className="mt-6 text-sm leading-relaxed text-foreground/60 max-w-[42ch]">
                  {tier.body}
                </p>
              </div>

              <ul className="mt-10 space-y-4">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-foreground/85"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60"
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-2">
                <Link
                  href={tier.cta.href}
                  className="group/cta inline-flex items-stretch gap-1"
                >
                  <span className="px-5 py-3 rounded-md bg-foreground text-background text-xs font-medium tracking-widest uppercase">
                    {tier.cta.label}
                  </span>
                  <ArrowChip
                    className="bg-foreground text-background"
                    name="cta"
                  />
                </Link>
              </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
