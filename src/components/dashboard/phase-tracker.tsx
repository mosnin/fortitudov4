"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { STATUS_PILL, STATUS_PILL_ACTIVE } from "@/lib/typography";

/**
 * Phase tracker — the build's Discovery→Launch journey (design-product.md).
 * Monochrome and iconless: the rail carries step numbers in tabular sans,
 * completed steps fill with foreground ink, and status is a neutral word pill
 * rather than a glyph.
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
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-colors",
                  isCompleted &&
                    "border-foreground bg-foreground font-medium text-background",
                  isActive && "border-foreground font-medium text-foreground",
                  isPending && "border-border text-muted-foreground"
                )}
              >
                {index + 1}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1 min-h-[36px]",
                    isCompleted ? "bg-foreground/40" : "bg-border"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-7", isLast && "pb-0")}>
              <div className="flex flex-wrap items-center gap-2">
                <h4
                  className={cn(
                    "text-sm font-medium",
                    isPending ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {phase.name}
                </h4>
                {isActive && (
                  <span className={STATUS_PILL_ACTIVE}>In Progress</span>
                )}
                {isCompleted && <span className={STATUS_PILL}>Completed</span>}
              </div>
              {phase.description && (
                <p className="mt-1 text-xs text-muted-foreground">
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
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs tabular-nums",
                  isCompleted &&
                    "border-foreground bg-foreground font-medium text-background",
                  isActive && "border-foreground font-medium text-foreground",
                  !isCompleted && !isActive && "border-border text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs",
                  isActive
                    ? "font-medium text-foreground"
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
