"use client";

import { motion } from "motion/react";
import { PressButton } from "./press-button";
import { SectionRails, CrossRule } from "./section-rails";

const EASE = [0.22, 1, 0.36, 1] as const;

function FormMockup() {
  return (
    <div className="relative flex flex-col overflow-clip rounded-[24px] border border-line">
      <div className="relative aspect-[800/465] overflow-clip bg-orange-hover p-2">
        {/* Floating application panel, per the reference's orange-framed shot */}
        <div className="absolute top-[9%] left-1/2 w-[87%] -translate-x-1/2 rounded-[12px] bg-[#F9F9F9] shadow-[0_0_24px_rgba(25,25,25,0.5)]">
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <p className="font-mono text-[16px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[20px]">
              Project details
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-ink-soft md:text-[12px]">
                  What are we building?
                </span>
                <span className="flex h-9 items-center justify-between rounded-[8px] border border-line bg-white px-3 text-[13px] font-medium text-ink md:h-10">
                  Web application
                  <svg width="9" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                    <path d="M1 1l4 4 4-4" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-ink-soft md:text-[12px]">
                  Budget ($)
                </span>
                <span className="flex h-9 items-center rounded-[8px] border border-line bg-white px-3 text-[13px] font-medium text-ink md:h-10">
                  $&nbsp;2,500+
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-ink-soft md:text-[12px]">
                Tell us about your project
              </span>
              <span className="rounded-[8px] border border-line bg-white px-3 py-2.5 text-[13px] leading-[1.4] text-ink">
                A client portal for our bookkeeping firm — uploads, invoices,
                shared inbox…
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 bg-orange"
                />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-ink-soft underline underline-offset-2">
                Save &amp; exit
              </span>
              <span className="flex items-center rounded-[8px] bg-orange px-4 py-2 text-[13px] font-medium text-white">
                Continue →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StartSplitSection() {
  return (
    <section className="relative overflow-x-clip border-b border-line bg-cream px-4 py-16 md:px-6 md:py-20 lg:px-16">
      <SectionRails />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-10 md:gap-14">
        <div className="flex flex-col px-4 md:px-6">
          <h2 className="max-w-[900px] font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-ink md:text-[40px] lg:text-[48px]">
            <span className="text-orange">Start Instantly</span> or Book a Call
            With a Builder
          </h2>
        </div>

        <div className="relative">
          <CrossRule className="top-0" />
          <CrossRule className="bottom-0" />

          <div className="grid grid-cols-1 items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              <FormMockup />
            </motion.div>

            <div className="flex flex-col items-start justify-center gap-9 p-4 md:px-6">
              <div className="flex w-full flex-col gap-3 lg:max-w-[480px]">
                <h3 className="text-[18px] leading-none font-bold tracking-[-0.032em] text-ink md:text-[20px]">
                  Self-serve: Apply, get quoted in minutes, and kick off
                  same-day.
                </h3>
                <p className="text-[16px] leading-[1.45] tracking-[-0.015em] text-ink-soft">
                  Complete the online application, review your fixed quote, pay
                  securely, and watch your build go live in the tracker. No
                  calls or back-and-forth required.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 lg:max-w-[480px]">
                <p className="text-[16px] font-medium tracking-[-0.015em] text-ink">
                  Best for:
                </p>
                <p className="text-[16px] leading-[1.45] tracking-[-0.015em] text-ink-soft">
                  Founders and operators who know what they need and want a
                  fast, frictionless build.
                </p>
              </div>
              <PressButton href="/services" size="lg">
                Start your application
              </PressButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
