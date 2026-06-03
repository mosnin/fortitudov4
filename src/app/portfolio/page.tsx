"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

// Real builds — each links to the live product (proof beats prose).
const caseStudies = [
  {
    client: "Poggle",
    href: "https://poggle.xyz",
    domain: "poggle.xyz",
    discipline: "AI",
    description:
      "An AI-governance platform: a trust gate between agents and your knowledge base. Agents read via MCP but every write lands as a reviewable diff — with an append-only audit trail, full version history, and one-click rollback.",
    outcome: "Live · read freely, write never",
    tags: ["AI", "MCP", "SaaS"],
  },
  {
    client: "NeverAge",
    href: "https://neverage.co",
    domain: "neverage.co",
    discipline: "Commerce",
    description:
      "A direct-to-consumer storefront for clinically-dosed creatine gummies aimed at active adults 50+ — conversion-focused product pages, subscriptions, and a checkout built to convert.",
    outcome: "Live DTC storefront",
    tags: ["Commerce", "Storefront", "Subscriptions"],
  },
  {
    client: "Two Cookies NYC",
    href: "https://twocookiesnyc.com",
    domain: "twocookiesnyc.com",
    discipline: "Commerce",
    description:
      "An online ordering experience for a New York City cookie shop — a fast, mouth-watering storefront with pickup and ordering that turns cravings into checkout.",
    outcome: "Live · online ordering",
    tags: ["Commerce", "Storefront", "Ordering"],
  },
  {
    client: "Fortitudo Group",
    href: "https://fortitudogroup.com",
    domain: "fortitudogroup.com",
    discipline: "Infrastructure",
    description:
      "The operating infrastructure behind a holding company of DTC brands — brand systems, supply-chain and fulfillment tooling, and the scalable architecture a multi-brand portfolio runs on.",
    outcome: "Powering a brand portfolio",
    tags: ["Infrastructure", "Commerce", "Brand"],
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="Selected work"
          title={<>Built, shipped, <span className="text-gradient-orange">live.</span></>}
          subtitle="A look at things we've designed and built — each one in production right now. Click through and see for yourself."
        />

        <section className="bg-charcoal-dark py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.client}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <SpotlightCard className="h-full p-7">
                    <a
                      href={study.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
                          {study.discipline}
                        </p>
                        <ArrowUpRight className="h-5 w-5 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange" />
                      </div>

                      <h3 className="font-brand mt-3 text-2xl text-white">{study.client}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                        {study.description}
                      </p>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-brand text-sm text-orange">{study.outcome}</span>
                          <span className="font-mono text-xs text-white/40">{study.domain}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {study.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </a>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-dark px-4 pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-brand text-3xl text-white sm:text-4xl">
              Want yours <span className="text-gradient-orange">in this list?</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Start a Brief and we&apos;ll scope it into a bespoke Blueprint.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-orange-dark hover:shadow-orange/40"
            >
              Start a Brief <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
