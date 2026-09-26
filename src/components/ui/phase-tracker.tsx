/**
 * PhaseTracker — a build's phases as a connected stepper: filled checks behind,
 * a pulsing brand dot on the current phase, hollow nodes ahead.
 *
 * Adapted from Spectrum UI's status-tracker: brand orange instead of neutral,
 * theme tokens instead of hard-coded neutrals, labels that truncate rather than
 * overflow, and a numeric fallback past MAX_NODES (a 12-phase build as twelve
 * nodes is unreadable in a card). Server-safe: CSS transitions only.
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackerPhase {
  id: string;
  name: string;
  status: string; // "completed" | "in_progress" | "pending"
}

const MAX_NODES = 7;

export function PhaseTracker({
  phases,
  className,
}: {
  phases: TrackerPhase[];
  className?: string;
}) {
  if (phases.length === 0) return null;

  const done = phases.filter((p) => p.status === "completed").length;
  const activeIndex = phases.findIndex((p) => p.status !== "completed");
  const pct = Math.round((done / phases.length) * 100);

  if (phases.length > MAX_NODES) {
    const current = activeIndex >= 0 ? phases[activeIndex] : undefined;
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-brand transition-[width] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {current?.name ?? "Delivered"}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{pct}%</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ol className="flex items-start" aria-label={`${done} of ${phases.length} phases complete`}>
        {phases.map((phase, i) => {
          const completed = phase.status === "completed";
          const active = i === activeIndex;
          return (
            <li key={phase.id} className={cn("flex min-w-0 items-start", i > 0 && "flex-1")}>
              {i > 0 && (
                <span aria-hidden className="mx-1 mt-2.5 h-px min-w-3 flex-1 overflow-hidden bg-border">
                  <span
                    className="block h-full bg-brand transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ width: completed || active ? "100%" : "0%" }}
                  />
                </span>
              )}
              <span className="flex min-w-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                    completed
                      ? "border-brand bg-brand text-white"
                      : active
                        ? "border-brand text-brand"
                        : "border-border text-transparent"
                  )}
                >
                  {completed ? (
                    <Check
                      className="size-3 motion-safe:animate-[su-pop_200ms_cubic-bezier(0.23,1,0.32,1)_both]"
                      strokeWidth={3}
                    />
                  ) : (
                    <span className={cn("size-1.5 rounded-full", active && "bg-current motion-safe:animate-pulse")} />
                  )}
                </span>
                <span
                  title={phase.name}
                  className={cn(
                    "max-w-[5.5rem] truncate text-[10px] tracking-wide uppercase",
                    completed || active ? "text-foreground/80" : "text-muted-foreground/60"
                  )}
                >
                  {phase.name}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>
          {done} of {phases.length} phases
        </span>
        <span>{pct}%</span>
      </p>
    </div>
  );
}
