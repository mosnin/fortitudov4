"use client";

import { motion } from "motion/react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const steps = [
  {
    title: "Brief",
    description:
      "Tell us what you want to build in a friendly, in-depth conversation with our studio. We listen, research, and ask the right questions.",
  },
  {
    title: "Blueprint",
    description:
      "We turn it into a bespoke Blueprint — real scope, the architecture, and a real price. No mystery, no boilerplate.",
  },
  {
    title: "Build",
    description:
      "Your dedicated architect builds it in phases. Track every step in real time and weigh in only when a decision is yours.",
  },
  {
    title: "Launch",
    description:
      "Review deliverables, request changes, and ship. We're with you through launch — and the next idea after it.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 bg-charcoal-dark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">How it works</p>
          <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">
            From idea to <span className="text-gradient-orange">launch</span>
          </h2>
          <p className="mt-4 text-lg text-white/60">
            A calm, transparent process that keeps you in control the whole way through.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full"
            >
              <SpotlightCard className="h-full p-6">
                <span className="font-brand text-3xl text-orange tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="font-brand mt-3 text-xl text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
