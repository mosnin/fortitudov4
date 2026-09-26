"use client";

/**
 * MorphButton — an async action button whose pill morphs its width to fit
 * each state: an arc spinner while loading, a check that draws in on success,
 * an X with a small shake on error, then back to idle.
 *
 * Adapted from Spectrum UI's morph-button:
 * - `motion/react` (the package this app ships) instead of framer-motion.
 * - Brand tones: idle is the product orange (or the neutral foreground pill
 *   with `tone="neutral"`); success/error use the status greens and reds the
 *   dashboards already use, so a finished action reads the same everywhere.
 * - `type="submit"` support, so it can sit in a <form> and be driven by the
 *   form's pending state through the controlled `state` prop.
 *
 * Use it for actions that take a beat and report back: asking Helix,
 * requesting a revision, saving settings, approving an action. Not for
 * navigation links, which never have a "success".
 *
 * @example
 * <MorphButton onAction={save}>Save changes</MorphButton>
 * <MorphButton type="submit" state={pending ? "loading" : "idle"}>Ask</MorphButton>
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type MorphButtonState = "idle" | "loading" | "success" | "error";

export interface MorphButtonProps {
  children: React.ReactNode;
  /** Uncontrolled: runs on click; loading while pending, then success/error. */
  onAction?: () => Promise<void> | void;
  /** Controlled state — bypasses the internal machine. */
  state?: MorphButtonState;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  /** Hold on success/error before resetting (uncontrolled), ms. */
  resetDelay?: number;
  size?: "sm" | "md" | "lg";
  /** "brand" = product orange, "neutral" = foreground pill, "inverse" = for use on the orange card. */
  tone?: "brand" | "neutral" | "inverse";
  disabled?: boolean;
  className?: string;
}

const SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;
const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 22 } as const;

const SIZES = {
  sm: { button: "h-8 px-3 text-xs", gap: "gap-1.5", icon: 14 },
  md: { button: "h-10 px-5 text-sm", gap: "gap-2", icon: 16 },
  lg: { button: "h-11 px-5 text-sm", gap: "gap-2", icon: 16 },
} as const;

const IDLE: Record<NonNullable<MorphButtonProps["tone"]>, string> = {
  brand: "bg-[#ea580c] text-white hover:bg-[#c2410c]",
  neutral: "bg-foreground text-background hover:bg-foreground/90",
  inverse:
    "bg-[#7c2d12] text-white hover:bg-[#6b260f] dark:bg-black/40 dark:hover:bg-black/55",
};

const DONE = {
  success: "bg-green-600 text-white dark:bg-green-500",
  error: "bg-red-600 text-white dark:bg-red-500",
};

function Spinner({ size }: { size: number }) {
  const r = 10;
  const c = 2 * Math.PI * r;
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
    >
      <circle
        cx="12"
        cy="12"
        r={r}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${c * 0.75} ${c}`}
      />
    </motion.svg>
  );
}

function Drawn({ paths, size, instant }: { paths: string[]; size: number; instant: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={instant ? { duration: 0 } : { duration: 0.25, ease: easeOutExpo, delay: i * 0.05 }}
        />
      ))}
    </svg>
  );
}

export function MorphButton({
  children,
  onAction,
  state: controlled,
  onClick,
  type = "button",
  loadingLabel,
  successLabel = "Done",
  errorLabel = "Failed",
  resetDelay = 1800,
  size = "md",
  tone = "brand",
  disabled = false,
  className,
}: MorphButtonProps) {
  const reduce = useReducedMotionSafe();
  const [internal, setInternal] = useState<MorphButtonState>("idle");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isControlled = controlled !== undefined;
  const state = controlled ?? internal;
  const interactive = state === "idle" && !disabled;
  const s = SIZES[size];

  useEffect(() => {
    if (isControlled || (internal !== "success" && internal !== "error")) return;
    const t = setTimeout(() => setInternal("idle"), resetDelay);
    return () => clearTimeout(t);
  }, [internal, isControlled, resetDelay]);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!interactive) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (isControlled || !onAction) return;
      setInternal("loading");
      try {
        await onAction();
        if (mounted.current) setInternal("success");
      } catch {
        if (mounted.current) setInternal("error");
      }
    },
    [interactive, isControlled, onAction, onClick]
  );

  let content: React.ReactNode = children;
  if (state === "loading") {
    content = (
      <>
        <Spinner size={s.icon} />
        {loadingLabel && <span>{loadingLabel}</span>}
      </>
    );
  } else if (state === "success") {
    content = (
      <>
        <motion.span
          className="inline-flex"
          initial={reduce ? false : { scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={SPRING_SOFT}
        >
          <Drawn paths={["M5 13l4.5 4.5L19 7"]} size={s.icon} instant={!!reduce} />
        </motion.span>
        {successLabel && <span>{successLabel}</span>}
      </>
    );
  } else if (state === "error") {
    content = (
      <>
        <Drawn paths={["M7 7l10 10", "M17 7L7 17"]} size={s.icon} instant={!!reduce} />
        {errorLabel && <span>{errorLabel}</span>}
      </>
    );
  }

  const announcement =
    state === "loading"
      ? loadingLabel ?? "Working"
      : state === "success"
        ? successLabel
        : state === "error"
          ? errorLabel
          : "";

  return (
    <motion.button
      type={type}
      layout
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={!interactive || undefined}
      aria-busy={state === "loading" || undefined}
      style={{ borderRadius: 10 }}
      whileTap={interactive && !reduce ? { scale: 0.97 } : undefined}
      animate={state === "error" && !reduce ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{
        layout: reduce ? { duration: 0 } : SPRING,
        scale: SPRING,
        x: { duration: 0.25, ease: "easeInOut" },
      }}
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-medium",
        "transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50",
        !interactive && "cursor-default",
        state === "success" || state === "error" ? DONE[state] : IDLE[tone],
        s.button,
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          className={cn("inline-flex items-center justify-center whitespace-nowrap", s.gap)}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: easeOutExpo }}
        >
          {content}
        </motion.span>
      </AnimatePresence>
      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
    </motion.button>
  );
}
