"use client";

import { motion } from "motion/react";
import { PressButton } from "./press-button";
import { SectionRails } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

export function FinalCTASection() {
  return (
    <section className="relative bg-night px-4 py-16 md:px-6 md:py-24 lg:px-16">
      <SectionRails dark />

      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center gap-10">
        {/* Mascot run cycle — artwork slots, per the reference's corgi row */}
        <div className="flex items-end justify-center gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
              className={i > 2 ? "hidden sm:block" : ""}
            >
              <ImagePlaceholder
                dark
                label={`Mascot ${i + 1}`}
                className="h-[52px] w-[52px] rounded-[10px]"
              />
            </motion.div>
          ))}
        </div>

        <h2 className="text-center font-mono text-[26px] leading-[110%] font-medium tracking-[-0.032em] text-white md:text-[36px] lg:text-[44px]">
          Fortitudo Provides the Agency Built for Founders.
          <br />
          Move fast. Ship things. Stay in control — under one roof.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <PressButton href="/contact" variant="light" size="lg">
            Book a call
          </PressButton>
          <PressButton href="/services" size="lg">
            Start your project
          </PressButton>
        </div>
      </div>
    </section>
  );
}
