"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { EASE_OUT, Reveal } from "./reveal";
import { PillLink } from "./pill-link";

function FormMockup() {
  return (
    <div className="rounded-[1.75rem] border-2 border-orange bg-paper p-1.5 shadow-[0_24px_60px_-24px_rgba(249,115,22,0.35)]">
      <div className="rounded-[1.4rem] bg-paper p-6 sm:p-8">
        <p className="text-[11px] font-semibold tracking-widest text-ink-soft uppercase">
          Project details
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-soft">
              What are we building?
            </p>
            <div className="flex h-11 items-center justify-between rounded-xl border border-line bg-cream px-3.5">
              <span className="text-sm font-medium text-ink">
                Web application
              </span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="#55524B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-soft">Budget</p>
            <div className="flex h-11 items-center rounded-xl border border-line bg-cream px-3.5">
              <span className="text-sm font-medium text-ink">$2,500+</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-ink-soft">
            Tell us about your project
          </p>
          <div className="rounded-xl border border-line bg-cream p-3.5">
            <p className="text-sm leading-relaxed text-ink">
              A client portal for our bookkeeping firm — uploads, invoices, and
              a shared inbox…
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 bg-orange"
              />
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1.5 text-xs font-semibold text-orange">
            <Zap className="h-3.5 w-3.5" />
            Avg. onboarding: 8 minutes
          </span>
          <span className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-cream">
            Continue
          </span>
        </div>
      </div>
    </div>
  );
}

const selfServePoints = [
  "Pick your service and complete onboarding online",
  "Review your fixed quote — no discovery-call gauntlet",
  "Your build kicks off and the tracker goes live same-day",
];

export function StartSplitSection() {
  return (
    <section className="bg-cream-dark py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            <span className="text-orange">Start instantly</span> or book a call
            with a{" "}
            <span className="font-serif italic font-normal">builder</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <FormMockup />
          </motion.div>

          <Reveal delay={0.1}>
            <p className="text-[11px] font-semibold tracking-widest text-orange uppercase">
              Self-serve
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Apply, get quoted, and kick off — same day.
            </h3>
            <ul className="mt-6 space-y-3.5">
              {selfServePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange">
                    <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink-soft">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-soft">
              <span className="font-semibold text-ink">Best for:</span>{" "}
              founders and operators who already know what they need — and
              want it built without ceremony.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PillLink href="/services" size="lg">
                Start your application
                <ArrowRight className="h-4 w-4" />
              </PillLink>
              <Link
                href="/contact"
                className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
              >
                or book a call →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
