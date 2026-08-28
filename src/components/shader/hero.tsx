"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";
import { ShaderCanvas } from "@/components/shader/shader-canvas";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

const FINAL_RADIUS = 24;
const FRAME_INSET = 10;

const SCROLL_RANGE = 80;

export function Hero(): ReactNode {
  const { scrollY } = useScroll();
  const rawExit = useTransform(scrollY, [0, SCROLL_RANGE], [0, 1], {
    clamp: true,
  });

  const exit = useSpring(rawExit, {
    stiffness: 120,
    damping: 22,
    mass: 0.4,
  });

  const padding = useTransform(exit, [0, 1], [FRAME_INSET, 0]);

  const borderRadius = useTransform(exit, [0, 1], [FINAL_RADIUS, 0]);

  return (
    <motion.section
      className="relative h-[100svh] min-h-[42rem] w-full max-[850px]:min-h-[38rem]"
      style={{ padding }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          className="relative h-full w-full overflow-hidden bg-[#f8cd02]"
          style={{ borderRadius }}
        >
          <div aria-hidden="true" className="absolute inset-0 w-full h-full">
            <ShaderCanvas />
          </div>

          <motion.div
            className="absolute inset-0 flex flex-col justify-between p-10 pt-40 max-[850px]:p-6 max-[850px]:pt-32 text-[#0f0f12] pointer-events-none max-w-[1680px] mx-auto"
            initial={false}
            animate="visible"
            transition={{ staggerChildren: 0.12, delayChildren: 1.4 }}
          >
            <motion.h1
              className="max-w-[18ch] text-[clamp(2.75rem,7.75vw,7.75rem)] font-medium leading-[0.95] tracking-tight"
              variants={{
                hidden: {},
                visible: {},
              }}
              transition={{ staggerChildren: 0.12 }}
            >
              {["We build it.", "You own it."].map((line) => (
                <span
                  key={line}
                  className="block overflow-hidden pb-[0.05em]"
                >
                  <motion.span
                    className="block will-change-transform"
                    variants={{
                      hidden: { y: "110%" },
                      visible: { y: "0%" },
                    }}
                    transition={{ duration: 1, ease: easeOutExpo }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            <div className="flex items-end justify-between gap-8 max-[850px]:flex-col max-[850px]:items-start">
              <motion.p
                className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-[#0f0f12]/80"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.8, ease: easeOutExpo }}
              >
                Websites, apps, AI tools, and marketing. A fixed price before
                we start, a clear view of the work, and every file at launch.
              </motion.p>

              <motion.div
                className="group pointer-events-auto inline-flex items-stretch gap-1 cursor-pointer"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.8, ease: easeOutExpo }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/contact" className="inline-flex items-stretch gap-1">
                  <span className="px-5 py-3 rounded-md bg-[#0f0f12] text-[#f8cd02] text-xs font-medium tracking-widest uppercase border border-[#0f0f12]">
                    Start a project
                  </span>
                  <ArrowChip className="bg-[#0f0f12] text-[#f8cd02]" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
