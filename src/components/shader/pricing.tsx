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
    name: "Fixed project",
    price: null,
    body: "For a defined website, software, AI, or marketing build. You approve one written scope and one price before work begins.",
    cta: { label: "Get a fixed price", href: "/contact" },
    features: [
      "Scope written before kickoff",
      "Senior builders on the work",
      "A project page you can follow",
      "Review and launch included",
      "Complete handover at launch",
    ],
  },
  {
    name: "Ongoing support",
    price: null,
    body: "For continued improvements, campaigns, and help after the initial build. The work and response rhythm are agreed up front.",
    cta: { label: "Talk to us", href: "/contact" },
    features: [
      "A clear monthly scope",
      "Prioritized improvements",
      "Maintenance and monitoring",
      "Marketing iteration when needed",
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
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
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
              A clear price before the work. No public guesswork.
            </RevealHeadline>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.18 }}
              className="mt-6 max-w-[60ch] text-balance text-xl max-[850px]:text-lg font-light leading-snug text-foreground/60"
            >
              Every build is different, so we price the actual scope. You see
              the total before you approve it and it stays fixed unless the scope changes.
            </motion.p>
          </div>
        </div>

        <div className="mt-20 max-[850px]:mt-12 grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1 max-[1100px]:gap-4">
          {TIERS.map((tier, i) => (
            <motion.article
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
