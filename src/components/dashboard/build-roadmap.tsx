import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type RoadmapPhase = {
  id: string;
  name: string;
  description?: string;
  done: number;
  total: number;
  pct: number;
};

/**
 * Client-facing build roadmap — phases with live progress rolled up from tasks.
 * Shows the journey, not the granular task list.
 */
export function BuildRoadmap({
  phases,
  overall,
}: {
  phases: RoadmapPhase[];
  overall: { done: number; total: number; pct: number };
}) {
  if (phases.length === 0) return null;

  // The current phase = first phase that isn't fully complete.
  const currentIdx = phases.findIndex((p) => p.pct < 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Build roadmap</p>
          <p className="text-xs text-muted-foreground">
            {overall.total > 0 ? `${overall.done} of ${overall.total} steps complete` : "Your plan is being prepared."}
          </p>
        </div>
        <span className="font-brand text-3xl text-orange tabular-nums">{overall.pct}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
        <div className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400 transition-all" style={{ width: `${overall.pct}%` }} />
      </div>

      <ol className="mt-6 space-y-5">
        {phases.map((p, i) => {
          const complete = p.pct >= 100 && p.total > 0;
          const current = i === currentIdx;
          const isLast = i === phases.length - 1;
          return (
            <li key={p.id} className="flex gap-4">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    complete
                      ? "border-orange bg-orange text-white"
                      : current
                        ? "border-orange bg-orange/10 text-orange"
                        : "border-border bg-background/40 text-muted-foreground"
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                {!isLast && (
                  <span className={cn("mt-1 w-px flex-1", complete ? "bg-orange/50" : "bg-border")} />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-1", isLast && "pb-0")}>
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium", current && "text-orange")}>{p.name}</p>
                  {current && (
                    <span className="rounded-full border border-orange/30 bg-orange/10 px-2 py-0.5 text-[10px] font-medium text-orange">
                      In progress
                    </span>
                  )}
                </div>
                {p.description && <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>}
                {p.total > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-background/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400" style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{p.pct}%</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
