"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { GradientCard } from "@/components/ui/gradient-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { services } from "@/lib/services";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";

const included = [
  "Discovery & requirements",
  "Custom UI/UX design",
  "Full development & integration",
  "Quality assurance & testing",
  "Deployment & launch support",
  "30-day post-launch support",
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="What we build"
          title={<>Four disciplines, <span className="text-gradient-orange">one studio.</span></>}
          subtitle="From first conversation to launch, we build the digital assets and architecture your business runs on. Pick a discipline — we scope the rest into a Blueprint."
        />

        {/* Discipline grid — the home aesthetic */}
        <section className="bg-charcoal-dark py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <GradientCard
                    index={index + 1}
                    title={service.name}
                    description={service.description}
                    meta={service.startingPrice}
                    href="/configure"
                    cta="Configure"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities per discipline */}
        <section className="bg-charcoal-dark py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Capabilities</p>
            <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl">
              What each discipline <span className="text-gradient-orange">covers</span>
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <SpotlightCard className="h-full p-7">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-brand text-2xl text-white">{service.name}</h3>
                      <span className="font-brand text-sm text-orange">{service.startingPrice}</span>
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {service.capabilities.map((c) => (
                        <li key={c} className="flex items-center gap-2.5 text-sm text-white/70">
                          <Check className="h-4 w-4 shrink-0 text-orange" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What every engagement includes */}
        <section className="bg-charcoal-dark py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SpotlightCard className="p-8 sm:p-10">
              <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Every engagement</p>
              <h2 className="font-brand mt-3 text-2xl text-white sm:text-3xl">
                What&apos;s always included
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-dark px-4 pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-brand text-3xl text-white sm:text-4xl">
              Build yours, <span className="text-gradient-orange">your way.</span>
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Configure a project from presets and add-ons — see a real price as you go.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/configure"
                className="inline-flex items-center gap-2 rounded-full bg-orange px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-orange-dark hover:shadow-orange/40"
              >
                Configure your project <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-base font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
