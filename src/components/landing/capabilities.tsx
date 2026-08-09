"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PressButton } from "./press-button";
import { SectionRails, CrossRule } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

const EASE = [0.22, 1, 0.36, 1] as const;

const capabilities = [
  {
    name: "Web Applications",
    description:
      "SaaS platforms, client portals, and internal tools — auth, APIs, and hosting handled end-to-end.",
    href: "/services#web-application",
    propLabel: "Card photo — browser objects",
    popular: true,
  },
  {
    name: "Ecommerce Stores",
    description:
      "Storefronts with checkout, inventory, order tracking, and SEO baked in from day one.",
    href: "/services#ecommerce-store",
    propLabel: "Card photo — storefront objects",
    popular: false,
  },
  {
    name: "Funnels",
    description:
      "Landing pages and sales funnels built to convert, A/B-test ready with analytics wired up.",
    href: "/services#funnels",
    propLabel: "Card photo — funnel objects",
    popular: true,
  },
  {
    name: "AI Automation",
    description:
      "Custom AI workflows, chatbots, and content pipelines that hand hours back to your team.",
    href: "/services#ai-automation",
    propLabel: "Card photo — automation objects",
    popular: false,
  },
  {
    name: "Open Claw Deployment",
    description:
      "Managed Open Claw instances — setup, deployment pipelines, monitoring, and scaling.",
    href: "/services#open-claw-deployment",
    propLabel: "Card photo — server objects",
    popular: false,
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="services"
      className="relative overflow-clip border-b border-line bg-surface px-4 py-16 md:px-6 md:py-20 lg:px-16"
    >
      <SectionRails />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-6 px-4 md:px-6">
          <h2 className="font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[40px] lg:text-[48px]">
            Explore Our Main Services
          </h2>
          <p className="max-w-[640px] text-[18px] leading-[120%] tracking-[-0.015em] text-ink-soft md:text-[20px]">
            Don&apos;t over-build for the future or under-build for the now.
            Add modules as you grow — from MVP to IPO.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CrossRule className="top-0" />
          <CrossRule className="bottom-0" />

          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-64px" }}
              transition={{
                duration: 0.55,
                delay: (index % 3) * 0.07,
                ease: EASE,
              }}
              className="flex h-full flex-col overflow-clip rounded-[24px] border border-line bg-white shadow-[0_0_24px_0_rgba(25,25,25,0.05)]"
            >
              <div className="relative -mx-px -mt-px h-[150px] overflow-clip rounded-[24px] border border-line shadow-[0_0_24px_0_rgba(25,25,25,0.2)]">
                <ImagePlaceholder
                  label={capability.propLabel}
                  className="absolute inset-0 rounded-none border-0"
                />
                {capability.popular && (
                  <span className="absolute top-3 right-3 rounded-[4px] bg-orange px-2 py-1 text-[11px] leading-none font-medium text-white">
                    Most popular
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col items-start gap-2.5 p-5">
                <h3 className="font-mono text-[20px] leading-none tracking-[-0.64px] text-ink md:text-[24px]">
                  {capability.name}
                </h3>
                <p className="flex-1 text-[14px] leading-[1.4] tracking-[-0.015em] text-ink-soft">
                  {capability.description}
                </p>
                <Link
                  href={capability.href}
                  className="text-[14px] font-medium text-ink underline underline-offset-4 transition-colors hover:text-orange"
                >
                  Learn more
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Specialized work — dark card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
            className="flex h-full flex-col overflow-clip rounded-[24px] bg-panel"
          >
            <div className="relative -mx-px -mt-px h-[150px] overflow-clip rounded-[24px]">
              <ImagePlaceholder
                dark
                label="Card photo — specialized work"
                className="absolute inset-0 rounded-none border-0"
              />
            </div>
            <div className="flex flex-1 flex-col items-start gap-2.5 p-5">
              <h3 className="font-mono text-[20px] leading-none tracking-[-0.64px] text-white md:text-[24px]">
                Something specialized?
              </h3>
              <p className="flex-1 text-[14px] leading-[1.4] tracking-[-0.015em] text-white/60">
                Migrations, integrations, rescue projects — if it ships to a
                browser, we&apos;ve probably built it.
              </p>
              <Link
                href="/contact"
                className="text-[14px] font-medium text-white underline underline-offset-4 transition-colors hover:text-orange"
              >
                Ask about specialized work
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 flex justify-center">
          <PressButton href="/services" size="lg">
            Get started
          </PressButton>
        </div>
      </div>
    </section>
  );
}
