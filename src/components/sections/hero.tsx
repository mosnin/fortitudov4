"use client";

import Link from "next/link";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { DotFlow, type DotFlowProps } from "@/components/ui/dot-flow";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

// Compact dot-grid loops for the hero chip — the studio's signature motif.
const designing = [
  [24],
  [17, 23, 25, 31],
  [10, 16, 18, 30, 32, 38],
  [9, 11, 37, 39, 3, 45],
  [10, 16, 18, 30, 32, 38],
  [17, 23, 25, 31],
];
const building = [
  [],
  [3],
  [10, 2, 4],
  [17, 9, 11, 5],
  [24, 16, 18, 12],
  [31, 23, 25, 19],
  [38, 30, 32, 26],
  [45, 37, 39, 33],
];
const shipping = [
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, 31, 32, 33, 34],
  [21, 22, 23, 24, 25, 26, 27],
];

const heroItems: DotFlowProps["items"] = [
  { title: "Designing", frames: designing, repeatCount: 2, duration: 160 },
  { title: "Building", frames: building, repeatCount: 2, duration: 130 },
  { title: "Shipping", frames: shipping, repeatCount: 2, duration: 150 },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-charcoal-dark pt-24">
      <AsciiField className="absolute inset-0 h-full w-full opacity-25" cell={14} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-7"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-orange/80">
            Fortitudo // A bespoke building studio
          </p>

          <h1 className="font-brand text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            A bespoke digital studio
            <br className="hidden sm:block" /> for the{" "}
            <span className="text-gradient-orange">AI age</span>
          </h1>

          <p className="max-w-2xl text-lg text-white/65 sm:text-xl">
            We design and build custom software, commerce, AI, and infrastructure —
            scoped into a real Blueprint and tracked from first conversation to launch.
            No templates. No funnels. Just builders.
          </p>

          <div className="mt-1 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-orange px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-orange-dark hover:shadow-orange/40"
            >
              Start a Brief
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-base font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              See what we build
            </Link>
          </div>

          <div className="mt-4">
            <DotFlow
              items={heroItems}
              className="border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-md"
              dotClassName="bg-white/15 [&.active]:bg-orange"
              textClassName="text-sm text-white/80"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
