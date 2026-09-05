"use client";

import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";
import { ShaderCanvas } from "@/components/shader/shader-canvas";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

const FINAL_RADIUS = 24;
const FRAME_INSET = 10;

const SCROLL_RANGE = 80;

export function Hero({ entranceReady = true }: { entranceReady?: boolean }): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(1);
  const reduceMotion = useReducedMotionSafe();
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

  // Original shader.zip 110×60 pill-to-viewport entrance, progressively
  // enabled after the optional intro. SSR always has the full-size surface.
  const width = useTransform(progress, p => `calc(110px + (100% - 110px) * ${p})`);
  const height = useTransform(progress, p => `calc(60px + (100% - 60px) * ${p})`);
  const borderRadius = useTransform([progress, exit], latest => {
    const [p, e] = latest as [number, number];
    const viewportH = typeof window !== "undefined" ? window.innerHeight - 20 : 800;
    const pillRadius = (60 + (viewportH - 60) * p) / 2;
    const t = Math.max(0, (p - 0.4) / 0.6);
    const eased = t * t * (3 - 2 * t);
    return (pillRadius * (1 - eased) + FINAL_RADIUS * eased) * (1 - e);
  });
  useEffect(() => {
    if (!entranceReady || reduceMotion || window.scrollY > 32) return;
    const section = sectionRef.current;
    if (!section) return;
    section.dataset.shaderEntrance = "running";
    progress.set(0);
    const controls = animate(progress, 1, { duration: 1.8, ease: easeOutExpo });
    const finish = () => {
      controls.stop();
      progress.set(1);
      delete section.dataset.shaderEntrance;
    };
    const watchdog = window.setTimeout(finish, 3250);
    window.addEventListener("touchstart", finish, { once: true, passive: true });
    window.addEventListener("wheel", finish, { once: true, passive: true });
    return () => {
      window.clearTimeout(watchdog);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("wheel", finish);
      finish();
    };
  }, [entranceReady, progress, reduceMotion]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[42rem] w-full max-[850px]:min-h-[38rem]"
      style={{ padding }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          data-shader-hero-surface
          className="relative h-full w-full overflow-hidden bg-[#f8cd02]"
          style={{ width, height, borderRadius }}
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
                More customers. Less busywork. Room to grow. We build the
                websites, software, and systems that help your business get there.
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
                    Talk through your project
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
