import { cn } from "@/lib/utils";
import { Check, Circle, Rocket } from "lucide-react";
import { BracketLabel } from "@/components/ui/firecrawl";

/**
 * Read-only delivery pipeline — the same stage checklist the team tracks in
 * the admin Client CRM (Onboarding → Discovery → Design → Build → Client
 * review → Launched → Ongoing), mirrored for the client as the transparency
 * bridge. Stages come from CRM_STAGES/STAGE_LABELS via getLaunchPipeline;
 * nothing here is offering-specific.
 *
 * Purely presentational: server pages load the data with
 * `getLaunchPipeline()` (launch-pipeline-data.ts) and pass it down, so this
 * renders in both server and client trees without its own fetch cycle.
 * Renders nothing until the client has a roster record.
 */

export interface PipelineStage {
  key: string;
  label: string;
  complete: boolean;
  active: boolean;
}

export interface LaunchPipelineData {
  stageLabel: string;
  total: number;
  done: number;
  stages: PipelineStage[];
}

export function LaunchPipeline({ data }: { data: LaunchPipelineData | null }) {
  if (!data) return null;

  const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <section className="animate-fade-up border-b border-border pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-brand" />
          <h2 className="text-[15px] font-semibold">Delivery Pipeline</h2>
        </div>
        <BracketLabel n={data.done} m={data.total} label="Steps" />
      </div>

      {/* Progress bar + current stage */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">
            Current stage:{" "}
            <span className="font-semibold text-foreground">
              {data.stageLabel}
            </span>
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {pct}% COMPLETE
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage stepper */}
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
        {data.stages.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                s.complete
                  ? "border-foreground bg-foreground text-background"
                  : s.active
                    ? "border-brand text-brand"
                    : "border-border text-muted-foreground"
              )}
            >
              {s.complete ? (
                <Check className="h-3 w-3" />
              ) : (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </span>
            <span
              className={cn(
                "text-xs",
                s.complete
                  ? "text-foreground"
                  : s.active
                    ? "font-semibold text-brand"
                    : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
