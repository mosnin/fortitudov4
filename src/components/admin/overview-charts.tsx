"use client";

import { AreaChart, BarList } from "@/components/ui/charts";

/**
 * Client wrappers for the admin overview's charts. The chart components take a
 * `format` function, which a server page can't pass across the boundary.
 */

const whole = (v: number) => Math.round(v).toLocaleString("en-US");

export function AdminNewProjectsChart({
  points,
  labels,
}: {
  points: number[];
  labels: string[];
}) {
  return (
    <AreaChart
      className="mt-5"
      points={points}
      xLabels={labels}
      height={240}
      format={whole}
    />
  );
}

export function AdminPipelineChart({
  items,
}: {
  items: { name: string; total: number }[];
}) {
  return (
    <div className="mt-5">
      <BarList items={items} format={whole} />
    </div>
  );
}
