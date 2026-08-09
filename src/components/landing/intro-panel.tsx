"use client";

import { motion } from "motion/react";
import { SectionRails } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

const EASE = [0.22, 1, 0.36, 1] as const;

export function IntroPanel() {
  return (
    <section className="relative bg-cream px-4 pt-4 pb-4 md:px-6 md:pt-12 md:pb-12 lg:px-16 lg:pt-16 lg:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-4 h-px bg-line md:top-12 lg:top-16" />
      <SectionRails />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[24px] bg-panel p-5 pb-[200px] md:p-16 md:pb-16"
      >
        <h2 className="relative font-mono text-[20px] leading-none font-normal tracking-[-0.032em] text-white md:pr-[360px] md:text-[28px] lg:pr-[420px] lg:text-[32px] min-[1440px]:pr-[460px] min-[1440px]:text-[40px]">
          <span className="text-orange">Fortitudo</span> is a full-stack
          digital agency built for founders. That means fast quotes, senior
          craft, and an AI-accelerated team that understands your business.
        </h2>

        {/* Tilted document props — right side on desktop, bottom on mobile */}
        <motion.div
          initial={{ opacity: 0, rotate: -19.27 }}
          whileInView={{ opacity: 1, rotate: -19.27 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className="pointer-events-none absolute right-[200px] bottom-[120px] z-10 hidden origin-bottom-right md:block"
        >
          <ImagePlaceholder
            dark
            label="Prop — project brief document"
            className="h-[52px] w-[200px] rounded-[8px]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, rotate: 8 }}
          whileInView={{ opacity: 1, rotate: 8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
          className="pointer-events-none absolute right-6 bottom-8 md:right-16 md:bottom-12"
        >
          <ImagePlaceholder
            dark
            label="Prop — dashboard still / documents photo"
            className="h-[150px] w-[240px] rounded-[12px] md:h-[190px] md:w-[320px]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
