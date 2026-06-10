"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { cn } from "@/lib/utils";

export type BuildHeroProps = {
  projectId: string;
  name: string;
  discipline: string;
  status: string;
  statusLabel: string;
  pct: number;
  stepsDone: number;
  stepsTotal: number;
  phasesDone: number;
  phasesTotal: number;
  currentPhase: string;
  deliverables: number;
  openDecisions: number;
  daysActive: number;
  architect: { name: string; title: string | null } | null;
  brandColor: string | null;
};

const ease = [0.16, 1, 0.3, 1] as const;

function useCountUp(target: number, run: boolean, duration = 1000) {
  // Starts at the target when not animating, so reduced-motion needs no effect.
  const [val, setVal] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3)))); // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

function relTime(dateStr: string): string {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * The living masthead of an active build — an animated progress ring, count-up
 * stats, a pulsing status, the current phase, and a live "latest activity"
 * heartbeat. Themed to the client's brand when set.
 */
export function BuildHero(props: BuildHeroProps) {
  const reduce = useReducedMotion();
  const accent = props.brandColor || "#F97316";
  const active = props.status === "in_progress";

  const pctVal = useCountUp(props.pct, !reduce);
  const R = 52;
  const C = 2 * Math.PI * R;

  // Live heartbeat — the most recent thing that happened on this build.
  const [latest, setLatest] = useState<{ summary: string; createdAt: string } | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/projects/${props.projectId}/activity`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => {
          if (alive && Array.isArray(d) && d[0]) setLatest({ summary: d[0].summary, createdAt: d[0].createdAt });
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [props.projectId]);

  const stats = [
    { label: "phases", value: `${props.phasesDone}/${props.phasesTotal}` },
    { label: "steps", value: `${props.stepsDone}/${props.stepsTotal}` },
    { label: "deliverables", value: props.deliverables },
    { label: "decisions", value: props.openDecisions },
    { label: "days active", value: props.daysActive },
  ];

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 15% 0%, ${accent}28, transparent 60%)` }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/55">
              {props.discipline}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", active && "animate-pulse")}
                style={{ background: accent }}
              />
              {props.statusLabel}
            </span>
          </div>
          <h1 className="font-brand mt-3 text-3xl leading-tight text-white sm:text-5xl">{props.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">phase</span>
            <span className="font-medium text-white/85">{props.currentPhase}</span>
            {active && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: accent }}>
                <span className="h-1 w-1 animate-ping rounded-full" style={{ background: accent }} /> live
              </span>
            )}
          </p>

          {props.architect && (
            <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal-dark text-xs font-semibold text-white">
                {props.architect.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-white/50">your architect</span>
                <span className="block truncate text-sm font-medium text-white">{props.architect.name}</span>
              </span>
              <Link
                href={`/messages?project=${props.projectId}`}
                className="ml-1 whitespace-nowrap text-sm font-medium hover:underline"
                style={{ color: accent }}
              >
                Message
              </Link>
            </div>
          )}
        </div>

        {/* Progress ring */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-start lg:self-auto">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-white/10" />
            <motion.circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={reduce ? false : { strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (props.pct / 100) * C }}
              transition={{ duration: 1.2, ease }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-brand text-3xl tabular-nums text-white">{pctVal}%</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">complete</span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-brand text-2xl tabular-nums text-white">{s.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live heartbeat */}
      {latest && (
        <div className="relative z-10 mt-5 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: accent }} />
          </span>
          <span className="truncate text-sm text-white/75">{latest.summary}</span>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-white/40">{relTime(latest.createdAt)}</span>
        </div>
      )}
    </motion.section>
  );
}
