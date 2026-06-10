"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type BuildPhaseStripProps = {
  phases: { id: string; name: string; pct: number }[];
  brandColor?: string | null;
};

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * A slim, glanceable companion to the full roadmap — one horizontal row of phase
 * segments, each a labelled progress bar tinted with the brand accent. The
 * current phase (first not yet complete) pulses; finished phases read as done.
 * Lives at the top of the build view so a client always knows where things stand
 * across the whole journey at a glance.
 */
export function BuildPhaseStrip({ phases, brandColor }: BuildPhaseStripProps) {
  const reduce = useReducedMotion();
  const accent = brandColor || "#F97316";

  if (phases.length === 0) return null;

  // Current phase = the first one that isn't fully complete.
  const currentIdx = phases.findIndex((p) => p.pct < 100);

  return (
    <div
      className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl sm:gap-3 sm:p-4"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {phases.map((p, i) => {
        const pct = Math.max(0, Math.min(100, p.pct));
        const complete = pct >= 100;
        const current = i === currentIdx;
        return (
          <div
            key={p.id}
            className={cn(
              "min-w-[7rem] flex-1 basis-28 rounded-xl px-2.5 py-2 transition-colors",
              current && "bg-white/[0.03]"
            )}
          >
            <div className="flex items-center gap-1.5">
              {complete ? (
                <span className="shrink-0 text-[11px]" style={{ color: accent }} aria-hidden>
                  ✓
                </span>
              ) : current ? (
                <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
                  {!reduce && (
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ background: accent }}
                    />
                  )}
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                </span>
              ) : null}
              <span
                className={cn(
                  "min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.18em]",
                  complete ? "text-white/70" : current ? "text-white/85" : "text-white/45"
                )}
              >
                {p.name}
              </span>
            </div>
            <div
              className={cn(
                "mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10",
                current && !reduce && "animate-pulse"
              )}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: accent }}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease, delay: reduce ? 0 : i * 0.06 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
