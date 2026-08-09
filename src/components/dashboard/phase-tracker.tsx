"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

/**
 * Phase tracker — the build's Discovery→Launch journey, restyled to the
 * paper-flat fused system: near-black completed ticks, brand orange reserved
 * for the single active pulse, hairline connectors, mono status chips.
 */

export interface Phase {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  order: number;
}

interface PhaseTrackerProps {
  phases: Phase[];
  className?: string;
}

export function PhaseTracker({ phases, className }: PhaseTrackerProps) {
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("space-y-0", className)}>
      {sortedPhases.map((phase, index) => {
        const isLast = index === sortedPhases.length - 1;
        const isCompleted = phase.status === "completed";
        const isActive = phase.status === "in_progress";
        const isPending = phase.status === "pending";

        return (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="flex gap-4"
          >
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              {/* Status icon */}
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
                  isCompleted && "border-foreground bg-foreground text-background",
                  isActive && "border-brand bg-brand-subtle text-brand",
                  isPending && "border-border bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1 min-h-[40px]",
                    isCompleted ? "bg-foreground/40" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <div className="flex items-center gap-2.5">
                <h4
                  className={cn(
                    "font-semibold",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {phase.name}
                </h4>
                {isActive && (
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
                    In Progress
                  </span>
                )}
                {isCompleted && (
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-success">
                    Completed
                  </span>
                )}
              </div>
              {phase.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {phase.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* Horizontal version for compact displays */
export function PhaseTrackerHorizontal({ phases, className }: PhaseTrackerProps) {
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {sortedPhases.map((phase, index) => {
        const isLast = index === sortedPhases.length - 1;
        const isCompleted = phase.status === "completed";
        const isActive = phase.status === "in_progress";

        return (
          <div key={phase.id} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-bold",
                  isCompleted && "border-foreground bg-foreground text-background",
                  isActive && "border-brand bg-brand-subtle text-brand",
                  !isCompleted && !isActive && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs",
                  isActive
                    ? "font-semibold text-brand"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {phase.name}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px flex-1",
                  isCompleted ? "bg-foreground/40" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
