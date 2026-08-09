"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Reveal } from "./reveal";
import { PillLink } from "./pill-link";

const LOGO_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(249,115,22,0.1),transparent)]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Trotting logo row */}
        <div className="mb-10 flex items-end justify-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
              className={i > 2 ? "hidden sm:block" : ""}
            >
              <Image
                src={LOGO_SRC}
                alt=""
                width={i === 2 ? 44 : 32}
                height={i === 2 ? 44 : 32}
                className="rounded-lg opacity-90"
              />
            </motion.div>
          ))}
        </div>

        <Reveal>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-cream sm:text-4xl lg:text-5xl">
            Fortitudo provides the agency built for founders.
            <br />
            <span className="text-cream/80">
              Move fast. Ship things.{" "}
              <span className="font-serif italic font-normal text-orange">
                Stay in control
              </span>{" "}
              — under one roof.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.12} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <PillLink href="/contact" variant="outline-light" size="lg">
            Book a call
          </PillLink>
          <PillLink href="/services" size="lg">
            Start your project
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
