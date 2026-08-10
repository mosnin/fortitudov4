"use client";

import { AreaChart } from "@/components/ui/charts";
import { cn } from "@/lib/utils";
import { H3, SECTION_LABEL } from "@/lib/typography";

export interface TrendPoint {
  date: string;
  value: number;
}

/** Sum `points` into trailing UTC month buckets, oldest → newest. */
export function monthlySeries(points: TrendPoint[], months = 6) {
  const now = new Date();
  const keys: string[] = [];
  const labels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)
    );
    keys.push(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    labels.push(
      d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    );
  }
  const series = keys.map(() => 0);
  for (const p of points) {
    const d = new Date(p.date);
    const i = keys.indexOf(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (i !== -1) series[i] += p.value;
  }
  return { labels, series };
}

/**
 * House-style trend section: hairline header + monochrome area chart of
 * monthly-bucketed points. Caption is quiet sans (`SECTION_LABEL`), the series
 * is neutral chart ink, values are `tabular-nums` — no mono, no accent.
 */
export function TrendCard({
  title,
  caption = "Last 6 months",
  points,
  format,
  height = 160,
  className,
}: {
  title: string;
  caption?: string;
  points: TrendPoint[];
  format?: (v: number) => string;
  height?: number;
  className?: string;
}) {
  const { labels, series } = monthlySeries(points);
  return (
    <div className={cn("tabular-nums", className)}>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h3 className={H3}>{title}</h3>
        <p className={SECTION_LABEL}>{caption}</p>
      </div>
      <AreaChart
        className="mt-5"
        points={series}
        xLabels={labels}
        height={height}
        format={format}
      />
    </div>
  );
}
