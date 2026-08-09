"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SectionRails } from "./section-rails";
import { ImagePlaceholder } from "./image-placeholder";

const QUOTE =
  "“The minute I hit submit, the tracker lit up, a project channel was created, and the team messaged me. It’s beautiful.”";

export function FeaturedQuote() {
  const words = QUOTE.split(" ");
  return (
    <section className="relative border-b border-line bg-cream py-16 md:py-24">
      <SectionRails />

      <div className="relative mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-8 md:px-6 lg:px-16">
        <ImagePlaceholder
          label="Customer logo"
          className="h-9 w-[140px] rounded-[6px]"
        />

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.018 }}
          className="max-w-[1100px] text-center font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-black md:text-[36px] lg:text-[48px]"
          aria-label={QUOTE}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block will-change-transform"
              variants={{
                hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.45, ease: "easeOut" },
                },
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.p>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[16px] font-medium tracking-[-0.015em] text-ink">
            David Chen
          </p>
          <p className="text-[14px] tracking-[-0.015em] text-ink-soft">
            CTO @ DataPulse
          </p>
        </div>

        <Link
          href="/portfolio"
          className="text-[15px] font-medium tracking-[-0.015em] text-ink underline underline-offset-4 transition-colors hover:text-orange"
        >
          Read the DataPulse case study
        </Link>
      </div>
    </section>
  );
}
