"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { cn } from "@/lib/utils";

export type AdminBuildHeroProps = {
  projectId: string;
  name: string;
  discipline: string;
  status: string;
  statusLabel: string;
  clientName: string;
  architectName: string | null;
  autonomyLabel: string;
  pct: number;
  stepsDone: number;
  stepsTotal: number;
  tasksReady: number;
  tasksInReview: number;
  tasksBlocked: number;
  tasksDone: number;
  tasksTotal: number;
  daysActive: number;
  brandColor: string | null;
};

const ease = [0.16, 1, 0.3, 1] as const;

// Impure — kept out of render so the component stays pure (strict react-hooks).
function now() {
  return Date.now();
}

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
  const m = Math.floor((now() - new Date(dateStr).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type AgentEvent = { summary: string; createdAt: string; actorType?: string };

/**
 * The operational masthead an admin (studio operator) sees on a build — animated
 * progress ring, count-up operational metrics (ready / in review / blocked /
 * done), a pulsing live status, and a live "latest agent action" heartbeat.
 * Themed to the client's brand when set.
 */
export function AdminBuildHero(props: AdminBuildHeroProps) {
  const reduce = useReducedMotion();
  const accent = props.brandColor || "#F97316";
  const active = props.status === "in_progress";

  const pctVal = useCountUp(props.pct, !reduce);
  const readyVal = useCountUp(props.tasksReady, !reduce);
  const reviewVal = useCountUp(props.tasksInReview, !reduce);
  const blockedVal = useCountUp(props.tasksBlocked, !reduce);
  const doneVal = useCountUp(props.tasksDone, !reduce);
  const daysVal = useCountUp(props.daysActive, !reduce);
  const R = 52;
  const C = 2 * Math.PI * R;

  // Live heartbeat — the most recent agent action on this build.
  const [latest, setLatest] = useState<AgentEvent | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/projects/${props.projectId}/activity`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => {
          if (!alive || !Array.isArray(d) || d.length === 0) return;
          const agent = d.find((e: AgentEvent) => e.actorType === "agent");
          const pick = (agent ?? d[0]) as AgentEvent;
          setLatest({ summary: pick.summary, createdAt: pick.createdAt, actorType: pick.actorType });
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
    { label: "ready", value: readyVal },
    { label: "in review", value: reviewVal },
    { label: "blocked", value: blockedVal },
    { label: "done", value: `${doneVal}/${props.tasksTotal}` },
    { label: "days active", value: daysVal },
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
            <span className="font-mono text-[11px] text-white/25">{"//"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", active && "animate-pulse")}
                style={{ background: accent }}
              />
              {props.statusLabel}
            </span>
          </div>
          <h1 className="font-brand mt-3 text-3xl leading-tight text-white sm:text-5xl">{props.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-white/60">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">client</span>
            <span className="font-medium text-white/85">{props.clientName}</span>
            {props.architectName && (
              <>
                <span className="text-white/20">·</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">architect</span>
                <span className="font-medium text-white/85">{props.architectName}</span>
              </>
            )}
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
              autonomy · {props.autonomyLabel.toLowerCase()}
            </span>
            {active && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: accent }}>
                <span className="h-1 w-1 animate-ping rounded-full" style={{ background: accent }} /> live
              </span>
            )}
          </p>
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

      {/* Operational stat row */}
      <div className="relative z-10 mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-brand text-2xl tabular-nums text-white">{s.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live agent heartbeat */}
      {latest && (
        <div className="relative z-10 mt-5 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: accent }} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {latest.actorType === "agent" ? "agent" : "latest"}
          </span>
          <span className="truncate text-sm text-white/75">{latest.summary}</span>
          <span className="ml-auto shrink-0 font-mono text-[11px] text-white/40">{relTime(latest.createdAt)}</span>
        </div>
      )}
    </motion.section>
  );
}
