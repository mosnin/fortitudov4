"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Reveal, EASE_OUT } from "./reveal";

export function IntroPanel() {
  return (
    <section className="bg-cream px-4 py-10 sm:px-6 sm:py-14">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 sm:px-12 sm:py-20 lg:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_20%,rgba(249,115,22,0.12),transparent)]" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <p className="text-2xl leading-snug font-medium tracking-tight text-cream sm:text-3xl lg:text-[2.1rem]">
              <span className="text-orange">Fortitudo</span> is a full-service
              digital agency built for founders. That means senior builders on
              every project, fixed transparent pricing, and an AI-accelerated
              process that ships in weeks — not months.
            </p>

            {/* Tilted dashboard-card mockups */}
            <div className="relative mx-auto hidden h-64 w-full max-w-xs lg:block">
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -6 }}
                whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
                className="absolute top-10 left-0 w-56 rounded-2xl border border-line bg-paper p-4 shadow-2xl shadow-black/40"
              >
                <p className="text-[10px] font-semibold tracking-widest text-ink-soft uppercase">
                  Project kickoff
                </p>
                <div className="mt-2.5 space-y-2">
                  <div className="h-2 w-4/5 rounded-full bg-ink/10" />
                  <div className="h-2 w-3/5 rounded-full bg-ink/10" />
                  <div className="h-2 w-2/3 rounded-full bg-ink/10" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-orange/10 px-2.5 py-1.5">
                  <Check className="h-3.5 w-3.5 text-orange" strokeWidth={3} />
                  <span className="text-[11px] font-medium text-ink">
                    Deposit received — build started
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
                className="absolute top-0 right-0 w-52 rounded-2xl border border-line bg-paper p-4 shadow-2xl shadow-black/40"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-widest text-ink-soft uppercase">
                    Phase 3 of 6
                  </p>
                  <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold text-orange">
                    Development
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "52%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.6, ease: EASE_OUT }}
                    className="h-full rounded-full bg-orange"
                  />
                </div>
                <p className="mt-2.5 text-[11px] text-ink-soft">
                  Updated 14 minutes ago
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
