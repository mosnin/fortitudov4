"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Globe,
  Server,
  ShoppingCart,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { EASE_OUT, Reveal } from "./reveal";
import { PillLink } from "./pill-link";

const capabilities = [
  {
    icon: Globe,
    name: "Web Applications",
    description:
      "SaaS platforms, client portals, and internal tools — custom UI, auth, APIs, and hosting handled end-to-end.",
    href: "/services#web-application",
    popular: true,
  },
  {
    icon: ShoppingCart,
    name: "Ecommerce Stores",
    description:
      "High-converting storefronts with checkout, inventory, order tracking, and SEO baked in from day one.",
    href: "/services#ecommerce-store",
    popular: false,
  },
  {
    icon: TrendingUp,
    name: "Funnels",
    description:
      "Landing pages and sales funnels built to convert — A/B-test ready with email capture and analytics wired up.",
    href: "/services#funnels",
    popular: true,
  },
  {
    icon: Bot,
    name: "AI Automation",
    description:
      "Custom AI workflows, chatbots, and content pipelines that hand hours back to your team every week.",
    href: "/services#ai-automation",
    popular: false,
  },
  {
    icon: Server,
    name: "Open Claw Deployment",
    description:
      "Managed Open Claw instances — setup, deployment pipelines, monitoring, and scaling handled for you.",
    href: "/services#open-claw-deployment",
    popular: false,
  },
];

export function CapabilitiesSection() {
  return (
    <section id="services" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            Everything you need,{" "}
            <span className="font-serif italic font-normal">
              under one roof
            </span>
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Don&apos;t stitch together five freelancers. Add capabilities as
            you grow — from MVP to IPO.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-64px" }}
                transition={{
                  duration: 0.6,
                  delay: (index % 3) * 0.08,
                  ease: EASE_OUT,
                }}
                className="group relative flex flex-col rounded-3xl border border-line bg-paper p-6 transition-all duration-300 hover:border-orange/40 hover:shadow-[0_20px_50px_-20px_rgba(26,26,24,0.2)]"
              >
                {capability.popular && (
                  <span className="absolute top-5 right-5 rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-orange uppercase">
                    Most popular
                  </span>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-dark transition-colors group-hover:bg-orange/10">
                  <Icon className="h-5.5 w-5.5 text-ink transition-colors group-hover:text-orange" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                  {capability.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {capability.description}
                </p>
                <Link
                  href={capability.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange transition-colors hover:text-orange-dark"
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}

          {/* Specialized work card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT }}
            className="flex flex-col rounded-3xl bg-ink p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Wrench className="h-5.5 w-5.5 text-orange" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-cream">
              Something specialized?
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">
              Migrations, integrations, rescue projects — if it ships to a
              browser, we&apos;ve probably built it.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange transition-colors hover:text-orange-light"
            >
              Ask about specialized work
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        <Reveal delay={0.15} className="mt-12 text-center">
          <PillLink href="/services" size="lg">
            View all services
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
