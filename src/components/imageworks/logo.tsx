"use client";
import Link from "next/link";

import {
  quickEase,
  softEase,
  useReducedMotion,
} from "@/components/imageworks/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export { BrandMark as LogoMark } from "@/components/brand-mark";
import { BrandMark as LogoMark } from "@/components/brand-mark";

export function Logo({
  className,
  compact = false,
  iconClassName = "h-5 w-5",
}: {
  className?: string;
  compact?: boolean;
  iconClassName?: string;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <Link
      href="/"
      aria-label="Fortitudo home"
      className={`inline-flex items-center rounded-lg text-[15px] font-medium tracking-[-0.01em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
    >
      <LogoMark className={`${iconClassName} shrink-0`} />
      <AnimatePresence initial={false}>
        {!compact && (
          <motion.span
            key="wordmark"
            className="overflow-hidden whitespace-nowrap"
            initial={reducedMotion ? false : { width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
              transition: reducedMotion
                ? { duration: 0 }
                : { duration: 0.4, ease: softEase },
            }}
            exit={{
              width: 0,
              opacity: 0,
              transition: reducedMotion
                ? { duration: 0 }
                : { duration: 0.25, ease: quickEase },
            }}
          >
            <span className="block pl-2">Fortitudo</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
