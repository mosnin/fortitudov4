"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";
import { ShaderCanvas } from "@/components/shader/shader-canvas";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

const HEADLINE_LINES = ["What is your", "business ready for?"] as const;

export function FinalCta(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.35 });

  return (
    <section
      ref={sectionRef}
      id="get-started"
      className="relative w-full bg-background text-foreground"
      aria-labelledby="final-cta-heading"
    >
      <div className="max-w-[1680px] mx-auto px-10 max-[850px]:px-6 pb-32 max-[850px]:pb-24">
        <motion.div
          initial={false}
          animate={{ y: inView ? 0 : 32 }}
          transition={{ duration: 1, ease: easeOutExpo }}
          className="relative overflow-hidden rounded-3xl bg-[#f8cd02] min-h-[520px] max-[850px]:min-h-[420px]"
        >
          <div aria-hidden className="absolute inset-0">
            <ShaderCanvas />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f8cd02]/25 via-transparent to-[#f8cd02]/10"
          />

          <div className="relative h-full flex flex-col justify-between p-14 max-[850px]:p-8 min-h-[inherit] text-[#0f0f12]">
            <motion.h2
              id="final-cta-heading"
              className="max-w-[16ch] text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-tight"
              initial={false}
              animate={inView ? "visible" : "rest"}
              transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
            >
              {HEADLINE_LINES.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.05em]">
                  <motion.span
                    className="block will-change-transform"
                    variants={{
                      rest: { y: "4%" },
                      visible: { y: "0%" },
                    }}
                    transition={{ duration: 1, ease: easeOutExpo }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h2>

            <div className="flex items-end justify-between gap-8 max-[850px]:flex-col max-[850px]:items-start mt-10">
              <motion.p
                className="max-w-xl text-3xl max-[850px]:text-base font-regular tracking-tighter leading-snug text-[#0f0f12]/80"
                initial={false}
                animate={{ y: inView ? 0 : 16 }}
                transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.6 }}
              >
                The launch you keep pushing back. The website customers struggle
                with. The hours your team loses to work that should be simpler.
                Let’s figure out what to fix first, and what it will take.
              </motion.p>

              <motion.div
                className="group inline-flex items-stretch gap-1 cursor-pointer shrink-0"
                initial={false}
                animate={{ y: inView ? 0 : 16 }}
                transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/contact" className="inline-flex items-stretch gap-1">
                  <span className="px-5 py-3 rounded-md bg-[#0f0f12] text-[#f8cd02] text-xs font-medium tracking-widest uppercase border border-neutral-900/[0.08]">Talk through your project</span>
                  <ArrowChip className="bg-[#0f0f12] text-[#f8cd02]" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
