import { cn } from "@/lib/utils";
import {
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

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
    <section className={cn("animate-fade-up", SECTION_RHYTHM)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className={SECTION_LABEL}>Delivery pipeline</p>
        <p className={SECTION_LABEL}>
          <span className="tabular-nums text-foreground/70">
            {data.done} of {data.total}
          </span>{" "}
          steps
        </p>
      </div>

      {/* Progress + current stage */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Current stage{" "}
            <span className="font-medium text-foreground">
              {data.stageLabel}
            </span>
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {pct}% complete
          </p>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage list — hairline rows, neutral word pills, no glyphs. */}
      <ul className="divide-y divide-border/60">
        {data.stages.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between gap-3 py-3"
          >
            <span
              className={cn(
                "truncate text-sm",
                s.complete || s.active
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {s.active ? (
              <span className={STATUS_PILL_ACTIVE}>Current</span>
            ) : s.complete ? (
              <span className={STATUS_PILL}>Done</span>
            ) : (
              <span className="text-xs text-muted-foreground">Upcoming</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
