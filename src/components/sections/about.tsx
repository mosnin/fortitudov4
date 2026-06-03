"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const values = [
  {
    title: "Bespoke, never boilerplate",
    description:
      "Every build is designed around your problem — not forced into a template. We architect for where you're going, not just where you are.",
  },
  {
    title: "Radical transparency",
    description:
      "Track every phase of your build in real time. No black boxes — you always know exactly where things stand.",
  },
  {
    title: "Builders, end to end",
    description:
      "From the first conversation to launch and beyond, you work directly with the architect building your product.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="relative bg-charcoal-dark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-orange/80">About Fortitudo</p>
            <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">
              The studio for teams building in the{" "}
              <span className="text-gradient-orange">AI age</span>
            </h2>
            <p className="mt-5 text-lg text-white/65">
              Fortitudo is a bespoke building studio. We design and build the software, commerce,
              AI, and infrastructure that ambitious businesses run on — with the craft of a product
              team and the clarity of a studio.
            </p>
            <p className="mt-4 text-white/55">
              The world changed; how software gets built changed with it. We pair senior architects
              with AI-native tooling so you get bespoke work at a pace that used to be impossible —
              scoped into a real Blueprint and tracked end to end.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
            >
              Start a Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="font-brand text-lg text-white">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
