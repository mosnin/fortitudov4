import { RecordList, RecordRow, RowPill } from "@/components/crm";
import { cn } from "@/lib/utils";

/**
 * Phase tracker — the build's Discovery→Launch journey rendered with the kit's
 * row vocabulary (`RecordList` + `RecordRow`): the phase name, a neutral word
 * pill for its state, the description as the one secondary line, and the step
 * number as right-hand metadata. Monochrome and iconless.
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
    <RecordList className={className}>
      {sortedPhases.map((phase, index) => {
        const isCompleted = phase.status === "completed";
        const isActive = phase.status === "in_progress";

        return (
          <RecordRow
            key={phase.id}
            index={index}
            primary={
              <span
                className={
                  isCompleted || isActive
                    ? "text-foreground"
                    : "font-normal text-muted-foreground"
                }
              >
                {phase.name}
              </span>
            }
            status={
              isActive ? (
                <RowPill emphasis>In Progress</RowPill>
              ) : isCompleted ? (
                <RowPill>Completed</RowPill>
              ) : undefined
            }
            secondary={phase.description}
            meta={
              <span className="text-xs tabular-nums text-muted-foreground">
                Step {index + 1}
              </span>
            }
          />
        );
      })}
    </RecordList>
  );
}

/* Horizontal version for compact displays — numbered steps in tabular sans,
   completed steps filled with foreground ink. No glyphs, no colour. */
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
