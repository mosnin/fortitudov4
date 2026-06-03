"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

const steps = [
  {
    title: "Choose & Onboard",
    description:
      "Select your service, create your account, and fill out a quick onboarding form with your project details.",
  },
  {
    title: "Secure Payment",
    description:
      "Complete payment securely through our payment portal. No hidden fees — transparent pricing from the start.",
  },
  {
    title: "Track Your Build",
    description:
      "Watch your project progress through each phase in real-time with our DoorDash-style tracker. Always know where things stand.",
  },
  {
    title: "Collaborate & Launch",
    description:
      "Upload files, request revisions, and message our team directly. We work together until your project launches.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-charcoal-dark/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="orange" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            From idea to{" "}
            <span className="text-gradient-orange">launch</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, transparent process that keeps you in the loop every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                {/* Step number */}
                <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
