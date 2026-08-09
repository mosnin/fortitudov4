"use client";

import { motion } from "motion/react";
import { PressButton } from "./press-button";
import { SectionRails } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Bottom fade into the next band, per the reference */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(246,246,246,0)] from-[72%] to-band to-[95%]" />
      <SectionRails />

      <div className="relative mx-auto flex min-h-[560px] max-w-[1600px] items-center justify-center md:min-h-[640px]">
        <div className="relative w-full md:w-auto">
          {/* Rotated brand prop — top right, hanging over the heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -16.78 }}
            animate={{ opacity: 1, scale: 1, rotate: -16.78 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="pointer-events-none absolute top-[-60px] right-[-24px] z-10 hidden md:top-[-96px] md:right-[-72px] md:block lg:right-[-108px] lg:top-[-112px]"
          >
            <ImagePlaceholder
              label="Hero prop — brand mascot"
              className="aspect-[299/269] w-[200px] rounded-[16px] lg:w-[260px]"
            />
          </motion.div>

          {/* Rotated prop — bottom left */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="pointer-events-none absolute bottom-[-56px] left-[-24px] z-10 hidden md:bottom-[-40px] md:left-[-96px] md:block"
          >
            <ImagePlaceholder
              label="Hero prop — product still"
              className="h-[140px] w-[190px] rounded-[16px]"
            />
          </motion.div>

          <div className="relative flex flex-col items-center gap-12 px-4 py-12 text-center md:px-[120px] md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex flex-col items-center gap-6"
            >
              <h1 className="mx-auto max-w-[752px] font-mono text-[36px] leading-[100%] font-medium tracking-[-0.032em] text-ink md:text-[48px] lg:text-[60px]">
                Custom Software <br />
                at the{" "}
                <span className="pr-1 font-serif italic font-normal text-orange">
                  Speed of Compute.
                </span>
              </h1>
              <p className="text-[18px] leading-[120%] tracking-[-0.015em] text-[#4E4E4E] md:text-[20px]">
                No black boxes, no waiting. Get a fixed quote in minutes.
                <br className="hidden md:block" /> Modular services, built for
                founders by builders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="relative z-10"
            >
              <PressButton href="/services" size="lg">
                Start your project
              </PressButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
