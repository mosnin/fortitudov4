"use client";

/**
 * NumberTicker — a count that rolls each digit into place like an odometer.
 *
 * Adapted from Spectrum UI's number-ticker (beui.dev): same per-digit column
 * roll and place-value keying, trimmed to what the product needs. Digits roll
 * once when the number scrolls into view; later changes roll immediately.
 * Honors prefers-reduced-motion. Screen readers get the plain value.
 *
 * Use it for the headline numbers on dashboards — counts and money — never for
 * dense table cells, where motion on every row is noise.
 *
 * @example
 * <NumberTicker value={12} />
 * <NumberTicker value={12500} prefix="$" locale />
 */

import { motion, useInView } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { useEffect, useMemo, useRef, useState } from "react";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Insert locale group separators (12,500). */
  locale?: boolean;
  /** Per-digit roll duration in seconds. */
  duration?: number;
  /** Entrance stagger between digits, seconds. */
  stagger?: number;
  className?: string;
}

const DIGIT_HEIGHT_EM = 1.1;
const DIGITS = Array.from({ length: 10 }, (_, n) => n);

export function NumberTicker({
  value,
  prefix,
  suffix,
  locale,
  duration = 0.9,
  stagger = 0.04,
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const text = useMemo(() => {
    const rounded = Math.round(value);
    return locale ? rounded.toLocaleString("en-US") : String(rounded);
  }, [value, locale]);

  // Key by place value (from the right) so a changing digit rolls to its new
  // value instead of remounting from 0.
  const glyphs = useMemo(() => {
    const chars = text.split("");
    return chars.map((char, i) => ({ char, id: `g-${chars.length - 1 - i}` }));
  }, [text]);

  // The stagger is an entrance flourish only; live updates roll together.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!inView || entered) return;
    const t = window.setTimeout(
      () => setEntered(true),
      (duration + glyphs.length * stagger) * 1000
    );
    return () => window.clearTimeout(t);
  }, [inView, entered, duration, stagger, glyphs.length]);

  return (
    <span ref={ref} className={cn("inline-flex items-center tabular-nums", className)}>
      <span className="sr-only">{`${prefix ?? ""}${text}${suffix ?? ""}`}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        {prefix && <span>{prefix}</span>}
        {glyphs.map(({ char, id }, i) =>
          /\d/.test(char) ? (
            <Digit
              key={id}
              digit={inView ? Number(char) : 0}
              delay={entered ? 0 : i * stagger}
              duration={duration}
            />
          ) : (
            <span key={id} className="inline-block">
              {char}
            </span>
          )
        )}
        {suffix && <span>{suffix}</span>}
      </span>
    </span>
  );
}

function Digit({
  digit,
  delay,
  duration,
}: {
  digit: number;
  delay: number;
  duration: number;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: `${DIGIT_HEIGHT_EM}em`, width: "1ch" }}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: `-${digit * DIGIT_HEIGHT_EM}em` }}
        transition={reduce ? { duration: 0 } : { duration, delay, ease: easeOutExpo }}
        className="absolute inset-x-0 top-0 flex flex-col items-center will-change-transform"
      >
        {DIGITS.map((n) => (
          <span
            key={n}
            className="flex items-center justify-center leading-none"
            style={{ height: `${DIGIT_HEIGHT_EM}em` }}
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
