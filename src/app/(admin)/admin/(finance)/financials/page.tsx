"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  CrmPageHeader,
  SectionHead,
  StatStrip,
  StatCell,
  Stat,
  StatEmpty,
  StatMeta,
} from "@/components/crm";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { PACKAGE_LABELS, type ClientPackage } from "@/lib/crm";
import {
  PAGE_RHYTHM,
  READING_COL,
  CAPTION,
  BODY_MUTED,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

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
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={READING_COL}>
          <CrmPageHeader
            section="Finance."
            title="Financials"
            subtitle="Metrics are unavailable right now."
          />
        </div>
        <EmptyState
          title="Metrics unavailable"
          description="Financial metrics are admin-only. If you should have access, try refreshing."
        />
      </div>
    );
  }

  const t = metrics?.totals;

  // One sentence of status — what the numbers currently say, not what the
  // page is for.
  const subtitle = !t
    ? "Reading the revenue ledger…"
    : t.totalRevenue === 0
      ? "Nothing collected yet."
      : `${usd(t.totalRevenue)} collected · ${usd(t.mrr)} recurring across ${count(
          t.activeClients
        )} active client${t.activeClients === 1 ? "" : "s"}.`;

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

  const STAT_LABELS = [
    "Total revenue",
    "Monthly recurring",
    "Active clients",
    "Average LTV",
    "Churn rate",
    "New clients",
  ];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Finance."
          title="Financials"
          subtitle={subtitle}
          action={<DateRangePill value={range} onChange={setRange} />}
        />

        {/* Headline metrics — the hairline strip. Cells with nothing to say
            render a calm fact instead of a misleading zero. */}
        <StatStrip columns={3} ariaLabel="Agency revenue metrics">
          {loading || !t
            ? STAT_LABELS.map((label) => (
                <StatCell key={label} label={label}>
                  <Skeleton className="h-8 w-24" />
                </StatCell>
              ))
            : [
                <StatCell key="revenue" label="Total revenue">
                  {t.totalRevenue === 0 ? (
                    <StatEmpty>Nothing collected yet.</StatEmpty>
                  ) : (
                    <>
                      <Stat suffix="collected">
                        <AnimatedNumber value={t.totalRevenue} format={usd} />
                      </Stat>
                      <StatMeta>Setup fees + retainers</StatMeta>
                    </>
                  )}
                </StatCell>,

                <StatCell key="mrr" label="Monthly recurring">
                  {t.mrr === 0 ? (
                    <StatEmpty>No retainers running yet.</StatEmpty>
                  ) : (
                    <>
                      <Stat suffix="per month">
                        <AnimatedNumber value={t.mrr} format={usd} />
                      </Stat>
                      <StatMeta>{usd(t.arr)} annualised</StatMeta>
                    </>
                  )}
                </StatCell>,

                <StatCell key="clients" label="Active clients">
                  {t.activeClients === 0 ? (
                    <StatEmpty>No active clients yet.</StatEmpty>
                  ) : (
                    <>
                      <Stat>
                        <AnimatedNumber value={t.activeClients} format={count} />
                      </Stat>
                      <StatMeta>{usd(t.arpu)}/mo ARPU</StatMeta>
                    </>
                  )}
                </StatCell>,

                <StatCell key="ltv" label="Average LTV">
                  {/* ARPU per month ÷ churn rate — undefined until someone churns. */}
                  {t.avgLtv === null ? (
                    <StatEmpty>
                      No churn yet, so lifetime value is still open-ended.
                    </StatEmpty>
                  ) : (
                    <>
                      <Stat>
                        <AnimatedNumber value={t.avgLtv} format={usd} />
                      </Stat>
                      <StatMeta>
                        {usd(t.arpu)}/mo ARPU ÷ {pct(t.churnRate)} churn · ~
                        {t.expectedLifetimeMonths?.toFixed(1)} mo
                      </StatMeta>
                    </>
                  )}
                </StatCell>,

                <StatCell key="churn" label="Churn rate">
                  {t.clientsLost === 0 ? (
                    <StatEmpty>No clients lost yet.</StatEmpty>
                  ) : (
                    <>
                      <Stat>
                        <AnimatedNumber value={t.churnRate} format={pct} />
                      </Stat>
                      <StatMeta>
                        {t.clientsLost} client{t.clientsLost === 1 ? "" : "s"} lost
                      </StatMeta>
                    </>
                  )}
                </StatCell>,

                <StatCell key="new" label="New clients">
                  {t.newClientsThisPeriod === 0 ? (
                    <StatEmpty>
                      {metrics?.windowed
                        ? "None signed in this range."
                        : "None signed in the last 30 days."}
                    </StatEmpty>
                  ) : (
                    <>
                      <Stat suffix="signed">
                        <AnimatedNumber
                          value={t.newClientsThisPeriod}
                          format={count}
                        />
                      </Stat>
                      <StatMeta>
                        {metrics?.windowed ? "In selected range" : "Last 30 days"}
                      </StatMeta>
                    </>
                  )}
                </StatCell>,
              ]}
        </StatStrip>

        {range.preset !== "all" && (
          <p className={cn(CAPTION, "tabular-nums")}>
            Flow metrics and churn are windowed to {rangeLabel(range)}; MRR and
            ARR always read current.
          </p>
        )}
      </div>

      {/* Trend charts — the one genuinely wide surface, 2-up across the frame */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {loading || !metrics
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))
          : charts.map((chart) => (
              <Reveal key={chart.title} variant="fade">
                <div className="tabular-nums">
                  <SectionHead title={chart.title} meta={rangeCaption} />
                  <AreaChart
                    className="mt-5"
                    points={chart.series}
                    xLabels={metrics.months.map((m) => m.split(" ")[0])}
                    height={170}
                    format={chart.money ? usd : count}
                  />
                </div>
              </Reveal>
            ))}
      </section>

      {/* Top customers + offering mix */}
      {!loading && metrics && (
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="tabular-nums">
            <SectionHead title="Top Customers by Spend" />
            {metrics.topCustomers.length === 0 ? (
              <p className={cn(BODY_MUTED, "pt-6 text-center")}>
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
          <div className="tabular-nums">
            <SectionHead title="Offering mix" />
            {packages.length === 0 ? (
              <p className={cn(BODY_MUTED, "pt-6 text-center")}>
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
