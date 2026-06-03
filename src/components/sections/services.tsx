"use client";

import Link from "next/link";
import { services } from "@/lib/services";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";

export function ServicesSection() {
  return (
    <section id="services" className="relative bg-charcoal-dark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">What we build</p>
          <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">
            Four disciplines. <span className="text-gradient-orange">One studio.</span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            We&apos;re builders — digital assets and the architecture behind them. Every engagement
            is scoped into a bespoke Blueprint with a real price.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange/40 hover:bg-white/[0.05]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
                  0{index + 1}
                </p>
                <h3 className="font-brand mt-2 text-2xl text-white">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {service.description}
                </p>
              </div>

              <ul className="mt-5 space-y-2">
                {service.capabilities.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 shrink-0 text-orange" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <p className="font-brand text-sm text-orange">{service.startingPrice}</p>
                <Link
                  href="/sign-up"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-orange/50 hover:bg-orange/10 hover:text-orange"
                >
                  Start a Brief
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
