"use client";

import { AreaChart } from "@/components/ui/charts";
import { SectionHead } from "@/components/crm";
import { cn } from "@/lib/utils";

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
 * House-style trend section: the kit's `SectionHead` over a monochrome area
 * chart of monthly-bucketed points. The header is the kit's rather than a
 * hand-drawn near-copy, so a trend block and a section elsewhere on the page
 * rule off at the same weight.
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
      <SectionHead title={title} meta={caption} />
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
