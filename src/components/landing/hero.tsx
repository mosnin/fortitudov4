"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PillLink } from "./pill-link";
import { EASE_OUT } from "./reveal";

function FloatingCard({
  className,
  float = 10,
  duration = 6,
  rotate = 0,
  delay = 0,
  children,
}: {
  className?: string;
  float?: number;
  duration?: number;
  rotate?: number;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, rotate }}
      animate={{ opacity: 1, y: [0, -float, 0], rotate }}
      transition={{
        opacity: { duration: 0.9, delay, ease: EASE_OUT },
        y: {
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-cream pt-20 pb-24 sm:pt-24 sm:pb-32">
      {/* Soft warm glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(249,115,22,0.08),transparent)]" />

      {/* Floating decor — left: live phase tracker */}
      <FloatingCard
        className="absolute top-40 left-[6%] hidden w-56 xl:block"
        rotate={-5}
        float={12}
        duration={7}
        delay={0.5}
      >
        <div className="rounded-2xl border border-line bg-paper p-4 shadow-[0_16px_40px_-12px_rgba(26,26,24,0.18)]">
          <p className="text-[10px] font-semibold tracking-widest text-ink-soft uppercase">
            Live build status
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              { phase: "Discovery", done: true },
              { phase: "Design", done: true },
              { phase: "Development", done: false },
            ].map((step) => (
              <div key={step.phase} className="flex items-center gap-2.5">
                <span
                  className={
                    step.done
                      ? "flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange"
                      : "relative flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-orange"
                  }
                >
                  {step.done ? (
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                  ) : (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" />
                  )}
                </span>
                <span className="text-xs font-medium text-ink">
                  {step.phase}
                </span>
                {!step.done && (
                  <span className="ml-auto rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold text-orange">
                    In progress
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </FloatingCard>

      {/* Floating decor — right: fixed quote card */}
      <FloatingCard
        className="absolute top-32 right-[6%] hidden w-52 xl:block"
        rotate={6}
        float={10}
        duration={6}
        delay={0.7}
      >
        <div className="rounded-2xl border border-line bg-paper p-4 shadow-[0_16px_40px_-12px_rgba(26,26,24,0.18)]">
          <p className="text-[10px] font-semibold tracking-widest text-ink-soft uppercase">
            Your quote
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
            $2,500
          </p>
          <p className="text-xs text-ink-soft">Web application · fixed price</p>
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-orange/8 px-2.5 py-1.5">
            <Check className="h-3.5 w-3.5 text-orange" strokeWidth={3} />
            <span className="text-[11px] font-medium text-ink">
              No surprise invoices
            </span>
          </div>
        </div>
      </FloatingCard>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: EASE_OUT },
              },
            }}
            className="text-[2.75rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-6xl lg:text-[4.5rem]"
          >
            Agency Craft
            <span className="block">
              at the{" "}
              <span className="font-serif italic font-normal text-ink">
                Speed of Compute.
              </span>
            </span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: EASE_OUT },
              },
            }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            No black boxes, no waiting — fixed quotes and real-time build
            tracking. A senior team, accelerated by our AI build agent. Built
            for founders, by builders.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: EASE_OUT },
              },
            }}
            className="mt-9"
          >
            <PillLink href="/services" size="lg">
              Start your project
            </PillLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
