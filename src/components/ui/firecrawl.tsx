"use client";

/**
 * Shared product primitives (see design.md). Monochrome, text-first:
 * PageHero (page frame), StatHeader, BracketLabel (section label), MetricRing,
 * Sparkline, SegmentedTabs — pure SVG/motion, no chart deps, no decoration.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import { H1, TITLE_FONT, BODY_MUTED, SECTION_LABEL } from "@/lib/typography";

/**
 * Page frame header — the canonical product header (docs: design.md).
 * A quiet section line, a serif title, one muted subtitle. No decoration, no
 * icons, no texture: the eye lands on content, not chrome.
 */
export function PageHero({
  title,
  description,
  action,
  section,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Quiet line above the title, e.g. "Operations". */
  section?: string;
  className?: string;
  /** @deprecated retained for call-site compatibility; no longer used. */
  typewriter?: boolean;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1.5">
        {section && <p className={BODY_MUTED}>{section}</p>}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className={H1}
          style={TITLE_FONT}
        >
          {title}
        </motion.h1>
        {description && <p className={BODY_MUTED}>{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

/** Animated count-up numeral. `format` receives the eased value. */
export function CountUp({
  value,
  format = (v) => Math.round(v).toLocaleString("en-US"),
  duration = 0.7,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: easeOutExpo,
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only on target change
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Title-left / big-numeral-right stat header (Usage-page style). */
export function StatHeader({
  title,
  caption,
  value,
  unit,
  format,
  className,
}: {
  title: string;
  caption?: string;
  value: number;
  unit?: string;
  format?: (v: number) => string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {caption && (
          <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
            {caption}
          </p>
        )}
      </div>
      <p className="text-3xl tracking-tight tabular-nums" style={TITLE_FONT}>
        <CountUp value={value} format={format} />
        {unit && (
          <span className="ml-1.5 text-lg font-semibold text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * Quiet section label — 11px uppercase muted sans. Replaces the old bracketed
 * mono header; the product voice is text-first, not terminal.
 */
export function BracketLabel({
  children,
  n,
  label,
  m,
  className,
}: {
  children?: React.ReactNode;
  /** Leading value, e.g. a count or a range. Rendered inline, not bracketed. */
  n?: React.ReactNode;
  /** The label text. */
  label?: React.ReactNode;
  /** Denominator, when `n` is "n of m". */
  m?: React.ReactNode;
  /** @deprecated ornamental prop from the previous system; ignored. */
  total?: number;
  className?: string;
}) {
  return (
    <p className={cn(SECTION_LABEL, className)}>
      {n != null && (
        <span className="text-foreground/70">
          {n}
          {m != null ? ` of ${m}` : null}
        </span>
      )}
      {n != null && (label || children) ? " · " : null}
      {label ?? children}
    </p>
  );
}

export function MetricRing({
  value,
  max,
  size = 56,
  label,
  className,
}: {
  value: number;
  max: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
        />
        <text
          x="50%"
          y="50%"
          className="rotate-90 fill-foreground text-sm font-semibold tabular-nums"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ transformOrigin: "center" }}
        >
          {value}
        </text>
      </svg>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

/**
 * Orange area sparkline over a dotted backdrop, with path draw-in.
 * `points` are raw values, evenly spaced.
 */
export function Sparkline({
  points,
  height = 120,
  className,
  labels,
}: {
  points: number[];
  height?: number;
  className?: string;
  /** Optional mono axis labels rendered under the chart (first/last shown). */
  labels?: [string, string];
}) {
  const w = 100;
  const h = 100;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const pts = points.map(
    (p, i) => [i * step, h - ((p - min) / range) * (h - 14) - 6] as const
  );
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to top, transparent, black)",
          WebkitMaskImage: "linear-gradient(to top, transparent, black)",
        }}
      />
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="relative w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id="lm-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#lm-spark-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        />
        {/* Opacity fade, not a pathLength draw-in — dash-based draw animations
            render with gaps when the viewBox is stretched (preserveAspectRatio
            "none" + non-scaling-stroke). */}
        <motion.path
          d={line}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
        />
      </svg>
      {labels && (
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}

/** Weekly/Monthly-style segmented control. */
export function SegmentedTabs({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-[13px] transition-colors cursor-pointer",
              active ? "font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-pill"
                className="absolute inset-0 rounded-md border border-border bg-background shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
