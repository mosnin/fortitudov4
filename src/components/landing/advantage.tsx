"use client";

import { motion } from "motion/react";
import { AlertCircle, Bot, LayoutDashboard, Users } from "lucide-react";
import { EASE_OUT, Reveal } from "./reveal";

const annotations = [
  { label: "Scope creep +$4,000", top: "14%", right: "-4%", delay: 0.4 },
  { label: "Update from 9 days ago", top: "44%", left: "-6%", delay: 0.55 },
  { label: "Invoice surprise", top: "72%", right: "2%", delay: 0.7 },
];

function LegacyCard() {
  return (
    <div className="relative">
      <div className="rounded-3xl bg-cream p-6 sm:p-8">
        {/* Fake statement-of-work document */}
        <div className="relative mx-auto max-w-sm rounded-xl border border-line bg-paper p-6 shadow-lg">
          <div className="h-3 w-2/5 rounded-full bg-ink/20" />
          <div className="mt-5 space-y-2.5">
            {[100, 88, 94, 72, 90, 60, 84, 78].map((width, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-ink/10"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
            <p className="text-[10px] text-ink-soft">
              SOW_v7_final_FINAL_(2).pdf
            </p>
            <p className="text-[10px] text-ink-soft">Page 1 of 34</p>
          </div>

          {/* Red annotation pills */}
          {annotations.map((a) => (
            <motion.span
              key={a.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: a.delay, ease: EASE_OUT }}
              style={{ top: a.top, left: a.left, right: a.right }}
              className="absolute flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-red-500 shadow-sm"
            >
              <AlertCircle className="h-3 w-3" />
              {a.label}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="mt-6 px-2">
        <h3 className="text-lg font-semibold text-cream">Typical agencies</h3>
        <p className="mt-2 text-sm leading-relaxed text-cream/60">
          Account managers playing broken telephone between you and the people
          actually building. Updates arrive by email, weeks apart — and the
          invoice never matches the quote.
        </p>
      </div>
    </div>
  );
}

const pipeline = [
  {
    icon: Users,
    title: "Senior builders",
    caption: "Design, architecture & craft",
  },
  {
    icon: Bot,
    title: "AI build agent",
    caption: "Scaffolding, tests & busywork",
  },
  {
    icon: LayoutDashboard,
    title: "Your dashboard",
    caption: "Live progress, quotes & chat",
  },
];

function FortitudoCard() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange via-orange-dark to-[#7C2D12] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(255,255,255,0.18),transparent)]" />

        <div className="relative mx-auto flex max-w-sm flex-col gap-2.5 py-2">
          {pipeline.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.35 + i * 0.15,
                    ease: EASE_OUT,
                  }}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90">
                    <Icon className="h-5 w-5 text-orange-dark" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-white/70">{step.caption}</p>
                  </div>
                </motion.div>
                {i < pipeline.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.45 + i * 0.15 }}
                    className="mx-auto mt-2.5 h-4 w-px origin-top bg-white/40"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 px-2">
        <h3 className="text-lg font-semibold text-cream">Fortitudo</h3>
        <p className="mt-2 text-sm leading-relaxed text-cream/60">
          One senior team, one dashboard. Our AI build agent handles the
          scaffolding, test suites, and revision churn — so human hours go
          where they matter, and your build ships weeks faster. You watch it
          happen live.
        </p>
      </div>
    </div>
  );
}

export function AdvantageSection() {
  return (
    <section id="how-it-works" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-cream sm:text-4xl lg:text-[2.75rem]">
            Our{" "}
            <span className="font-serif italic font-normal text-orange">
              unique
            </span>{" "}
            advantage
          </h2>
          <p className="mt-4 text-lg text-cream/60">
            Humans lead every build. Our AI agent does the heavy lifting. You
            get agency craft without agency overhead.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-8">
          <Reveal delay={0.05}>
            <LegacyCard />
          </Reveal>
          <Reveal delay={0.15}>
            <FortitudoCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
