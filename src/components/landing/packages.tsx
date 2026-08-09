"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { EASE_OUT, Reveal } from "./reveal";
import { cn } from "@/lib/utils";

interface Package {
  stage: string;
  name: string;
  description: string;
  tags: string[];
  price: string;
  href: string;
  cta: string;
  dark?: boolean;
  illustration: React.ReactNode;
}

function FunnelIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-full w-full">
      <path d="M20 14h80l-28 26v20l-24 6V40L20 14Z" stroke="#1A1A18" strokeWidth="2.5" strokeLinejoin="round" fill="#FFFDF8" />
      <circle cx="94" cy="52" r="11" fill="#F97316" />
      <path d="M90 52l3 3 5.5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 22h48M44 30h32" stroke="#1A1A18" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}

function StorefrontIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-full w-full">
      <path d="M26 32v28h68V32" stroke="#1A1A18" strokeWidth="2.5" fill="#FFFDF8" />
      <path d="M20 32l6-18h68l6 18c0 4.4-4.5 8-10 8s-10-3.6-10-8c0 4.4-4.5 8-10 8s-10-3.6-10-8c0 4.4-4.5 8-10 8s-10-3.6-10-8c0 4.4-4.5 8-10 8s-10-3.6-10-8Z" stroke="#1A1A18" strokeWidth="2.5" strokeLinejoin="round" fill="#F97316" fillOpacity="0.9" />
      <rect x="42" y="44" width="16" height="16" stroke="#1A1A18" strokeWidth="2.5" fill="#F97316" fillOpacity="0.25" />
      <path d="M68 44h14v16" stroke="#1A1A18" strokeWidth="2.5" />
    </svg>
  );
}

function WindowsIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-full w-full">
      <rect x="14" y="18" width="64" height="42" rx="6" stroke="#1A1A18" strokeWidth="2.5" fill="#FFFDF8" />
      <path d="M14 30h64" stroke="#1A1A18" strokeWidth="2.5" />
      <circle cx="22" cy="24" r="2" fill="#F97316" />
      <circle cx="30" cy="24" r="2" fill="#1A1A18" opacity="0.3" />
      <rect x="52" y="34" width="54" height="30" rx="6" stroke="#1A1A18" strokeWidth="2.5" fill="#F97316" fillOpacity="0.12" />
      <path d="M60 46h22M60 54h14" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 40h20M22 48h14" stroke="#1A1A18" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function CustomIllustration() {
  return (
    <svg viewBox="0 0 120 72" fill="none" className="h-full w-full">
      <path d="M60 10l6.5 17L84 33.5 67 40l-7 18-7-18-17-6.5L53.5 27 60 10Z" fill="#F97316" stroke="#FAF6EE" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="92" cy="20" r="4" fill="#FAF6EE" opacity="0.6" />
      <circle cx="26" cy="54" r="3" fill="#FAF6EE" opacity="0.4" />
      <circle cx="96" cy="52" r="2.5" fill="#F97316" />
    </svg>
  );
}

const packages: Package[] = [
  {
    stage: "Validate",
    name: "Funnels & Landing Pages",
    description:
      "Prove demand before you build the whole thing. High-converting pages, live in weeks.",
    tags: ["Landing pages", "A/B testing", "Email capture"],
    price: "From $1,200",
    href: "/sign-up?service=funnels",
    cta: "Get a quote instantly",
    illustration: <FunnelIllustration />,
  },
  {
    stage: "Launch",
    name: "Ecommerce Stores",
    description:
      "A storefront that sells while you sleep — checkout, inventory, and analytics included.",
    tags: ["Storefront", "Payments", "SEO"],
    price: "From $1,800",
    href: "/sign-up?service=ecommerce_store",
    cta: "Get a quote instantly",
    illustration: <StorefrontIllustration />,
  },
  {
    stage: "Scale",
    name: "Web Applications",
    description:
      "Custom SaaS platforms and internal tools, architected by senior builders to grow with you.",
    tags: ["SaaS", "Dashboards", "APIs"],
    price: "From $2,500",
    href: "/sign-up?service=web_application",
    cta: "Get a quote instantly",
    illustration: <WindowsIllustration />,
  },
  {
    stage: "Automate",
    name: "Custom Package",
    description:
      "AI automation, Open Claw deployments, or something else entirely — scoped around your business.",
    tags: ["AI workflows", "Integrations", "Scoped to you"],
    price: "Custom quote",
    href: "/contact",
    cta: "Talk to our team",
    dark: true,
    illustration: <CustomIllustration />,
  },
];

export function PackagesSection() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Builds designed around{" "}
            <span className="font-serif italic font-normal">your journey</span>
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            From your first landing page to your next round, we&apos;ve built
            packages for every stage.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.stage}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT }}
              className={cn(
                "group flex flex-col rounded-3xl border p-6 transition-shadow duration-300",
                pkg.dark
                  ? "border-ink bg-ink shadow-lg shadow-black/10"
                  : "border-line bg-paper hover:shadow-[0_20px_50px_-20px_rgba(26,26,24,0.2)]"
              )}
            >
              <div
                className={cn(
                  "flex h-28 items-center justify-center rounded-2xl px-6 py-4",
                  pkg.dark ? "bg-charcoal" : "bg-cream-dark"
                )}
              >
                {pkg.illustration}
              </div>

              <p
                className={cn(
                  "mt-5 text-[11px] font-semibold tracking-widest uppercase",
                  pkg.dark ? "text-orange" : "text-orange"
                )}
              >
                {pkg.stage}
              </p>
              <h3
                className={cn(
                  "mt-1.5 text-lg font-semibold tracking-tight",
                  pkg.dark ? "text-cream" : "text-ink"
                )}
              >
                {pkg.name}
              </h3>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  pkg.dark ? "text-cream/60" : "text-ink-soft"
                )}
              >
                {pkg.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {pkg.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      pkg.dark
                        ? "bg-white/8 text-cream/70"
                        : "bg-ink/5 text-ink-soft"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <p
                  className={cn(
                    "mb-3 text-sm font-semibold",
                    pkg.dark ? "text-cream" : "text-ink"
                  )}
                >
                  {pkg.price}
                </p>
                <Link
                  href={pkg.href}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors",
                    pkg.dark
                      ? "bg-cream text-ink hover:bg-white"
                      : "bg-orange text-white hover:bg-orange-dark"
                  )}
                >
                  {pkg.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <p className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
            <Sparkles className="h-4 w-4 text-orange" />
            Every package includes real-time build tracking in your dashboard.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
