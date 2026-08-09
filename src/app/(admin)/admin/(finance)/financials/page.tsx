"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHero, CountUp, BracketLabel } from "@/components/ui/firecrawl";
import { AreaChart, DonutChart, BarList } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DateRangePill,
  ALL_TIME,
  rangeBounds,
  rangeLabel,
  type DateRange,
} from "@/components/ui/filters";
import { cascade, cascadeItem } from "@/lib/motion";
import { PACKAGE_LABELS, type ClientPackage } from "@/lib/crm";
import { cn } from "@/lib/utils";
import { BarChart3, Users2 } from "lucide-react";

interface Metrics {
  totals: {
    totalRevenue: number;
    mrr: number;
    arr: number;
    activeClients: number;
    newClientsThisPeriod: number;
    avgLtv: number | null;
    arpu: number;
    expectedLifetimeMonths: number | null;
    churnRate: number;
    clientsLost: number;
  };
  months: string[];
  series: {
    revenue: number[];
    mrr: number[];
    arr: number[];
    newClients: number[];
  };
  topCustomers: { name: string; total: number }[];
  /** Offering enum key + head count; labels resolve through PACKAGE_LABELS. */
  packagesDistribution: { key: string; count: number }[];
  windowed: boolean;
}

/** yyyy-mm-dd for the metrics query, or null. */
const isoDay = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const usd = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;
const pct = (f: number) => `${(f * 100).toFixed(1)}%`;
const count = (v: number) => Math.round(v).toLocaleString("en-US");

/** Hairline-divided grid cell borders, 2-up small / 3-up large. */
const statCell = (i: number) =>
  cn(
    "px-5 py-6",
    i % 2 === 1 && "max-lg:border-l max-lg:border-border",
    i >= 2 && "max-lg:border-t max-lg:border-border",
    i % 3 !== 0 && "lg:border-l lg:border-border",
    i >= 3 && "lg:border-t lg:border-border"
  );

export default function AdminFinancialsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>(ALL_TIME);

  const load = useCallback((r: DateRange) => {
    // `to` is inclusive on the server; convert the exclusive upper bound back
    // to the picked end day.
    const { from, to } = rangeBounds(r);
    const toInclusive = to ? new Date(to.getTime() - 86_400_000) : null;
    const qs = new URLSearchParams();
    if (from) qs.set("from", isoDay(from)!);
    if (toInclusive) qs.set("to", isoDay(toInclusive)!);
    const url = qs.toString()
      ? `/api/admin/metrics?${qs}`
      : "/api/admin/metrics";
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setMetrics(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const rangeCaption = range.preset === "all" ? "Last 6 months" : rangeLabel(range);

  if (!loading && !metrics) {
    return (
      <div className="space-y-10">
        <PageHero
          title="Financials"
          description="Revenue, recurring revenue, and client growth across the agency."
        />
        <EmptyState
          icon={BarChart3}
          title="Metrics unavailable"
          description="Financial metrics are admin-only. If you should have access, try refreshing."
        />
      </div>
    );
  }

  const t = metrics?.totals;
  const tiles: {
    label: string;
    caption: string;
    value: number;
    format: (v: number) => string;
    /** Rendered verbatim instead of counting up (for "no answer" states). */
    display?: string;
    accent?: string;
  }[] = t
    ? [
        {
          label: "Total Revenue",
          caption: "Setup + monthly fees",
          value: t.totalRevenue,
          format: usd,
        },
        {
          label: "Total MRR",
          caption: `ARR: ${usd(t.arr)}`,
          value: t.mrr,
          format: usd,
        },
        {
          label: "Active Clients",
          caption: `${usd(t.arpu)}/mo ARPU`,
          value: t.activeClients,
          format: count,
        },
        {
          // ARPU per month ÷ churn rate. Undefined when nobody has churned.
          label: "Avg LTV",
          caption:
            t.avgLtv === null
              ? `${usd(t.arpu)}/mo ARPU · no churn yet`
              : `${usd(t.arpu)}/mo ARPU ÷ ${pct(t.churnRate)} churn · ~${t.expectedLifetimeMonths?.toFixed(1)} mo`,
          value: t.avgLtv ?? 0,
          display: t.avgLtv === null ? "—" : undefined,
          format: usd,
        },
        {
          label: "Churn Rate",
          caption: `${t.clientsLost} client${t.clientsLost === 1 ? "" : "s"} lost`,
          value: t.churnRate,
          format: pct,
          accent: t.churnRate > 0 ? "text-warning" : "text-success",
        },
        {
          label: "New Clients",
          caption: metrics?.windowed ? "In selected range" : "Last 30 days",
          value: t.newClientsThisPeriod,
          format: count,
        },
      ]
    : [];

  const charts: { title: string; series: number[]; money?: boolean }[] =
    metrics
      ? [
          { title: "Revenue", series: metrics.series.revenue, money: true },
          { title: "MRR Trend", series: metrics.series.mrr, money: true },
          { title: "ARR Trend", series: metrics.series.arr, money: true },
          { title: "New Clients Trend", series: metrics.series.newClients },
        ]
      : [];

  // Offering mix — labels come from PACKAGE_LABELS so the legend always reads
  // as the five offerings (plus Custom), never a tier name.
  const packages =
    metrics?.packagesDistribution.map((p) => ({
      label: PACKAGE_LABELS[p.key as ClientPackage] ?? p.key,
      count: p.count,
    })) ?? [];

  return (
    <div className="space-y-10">
      <PageHero
        title="Financials"
        description="Revenue, recurring revenue, and client growth across the agency."
        action={<DateRangePill value={range} onChange={setRange} />}
      />

      {range.preset !== "all" && (
        <BracketLabel
          n={rangeLabel(range)}
          label="FLOW METRICS + CHURN WINDOWED · MRR/ARR ALWAYS CURRENT"
        />
      )}

      {/* Headline metrics — hairline-divided 3-up grid */}
      <motion.section variants={cascade} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 border-b border-border lg:grid-cols-3">
          {loading || !t
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={cn(statCell(i), "space-y-3")}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))
            : tiles.map((tile, i) => (
                <motion.div
                  key={tile.label}
                  variants={cascadeItem}
                  className={statCell(i)}
                >
                  <p className="micro-label">{tile.label}</p>
                  <p
                    className={cn(
                      "mt-2 text-3xl font-bold tracking-tight",
                      tile.accent
                    )}
                  >
                    {tile.display ?? (
                      <CountUp value={tile.value} format={tile.format} />
                    )}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {tile.caption}
                  </p>
                </motion.div>
              ))}
        </div>
      </motion.section>

      {/* Trend charts — 2-up grid */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {loading || !metrics
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))
          : charts.map((chart) => (
              <div key={chart.title}>
                <div className="flex items-baseline justify-between border-b border-border pb-3">
                  <h2 className="text-[15px] font-semibold">{chart.title}</h2>
                  <p className="font-mono text-[11px] uppercase text-muted-foreground">
                    {rangeCaption}
                  </p>
                </div>
                <AreaChart
                  className="mt-5"
                  points={chart.series}
                  xLabels={metrics.months.map((m) => m.split(" ")[0])}
                  height={170}
                  format={chart.money ? usd : count}
                />
              </div>
            ))}
      </section>

      {/* Top customers + packages */}
      {!loading && metrics && (
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">
                Top Customers by Spend
              </h2>
            </div>
            {metrics.topCustomers.length === 0 ? (
              <p className="pt-6 text-center text-sm text-muted-foreground">
                No payment data available.
              </p>
            ) : (
              <BarList
                className="mt-6"
                items={metrics.topCustomers}
                format={usd}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">
                Packages Distribution
              </h2>
            </div>
            {packages.length === 0 ? (
              <p className="pt-6 text-center text-sm text-muted-foreground">
                No active clients yet.
              </p>
            ) : (
              <DonutChart className="mt-6" data={packages} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
