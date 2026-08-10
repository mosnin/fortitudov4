"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart } from "@/components/ui/charts";
import {
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { AnimatedNumber } from "@/components/motion";
import { QUIET_LINK, SECTION_LABEL } from "@/lib/typography";

/**
 * Marketing performance band — headline results from the weekly reporting
 * loop (leads, cost per lead, revenue, return on spend) with weekly trend
 * charts, fed by /api/reports. The metric band is the kit's `StatStrip`.
 *
 * DIGITAL MARKETING ONLY. Weekly reports exist for ad-managed engagements;
 * websites/software/AI/consultation clients never get one, and their
 * dashboard leads with the delivery pipeline instead. The dashboard decides
 * server-side whether to mount this at all, and the component still
 * self-guards: no reports, nothing renders.
 */

interface Report {
  id: string;
  weekStart: string;
  weekEnd: string;
  leads: number;
  cpl: number;
  totalSpend: number;
  closes: number | null;
  revenue: number | null;
  status: "pending_client" | "completed";
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const usdWhole = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

export function PerformanceOverview() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reports)) setReports(data.reports);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || reports.length === 0) return null;

  // Oldest → newest for the trend charts.
  const ordered = [...reports].sort(
    (a, b) => new Date(a.weekEnd).getTime() - new Date(b.weekEnd).getTime()
  );

  const totalLeads = ordered.reduce((s, r) => s + r.leads, 0);
  const totalSpend = ordered.reduce((s, r) => s + r.totalSpend, 0);
  const totalRevenue = ordered.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const weekLabels = ordered.map((r, i) =>
    i === 0 || i === ordered.length - 1
      ? new Date(r.weekEnd).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : ""
  );

  const charts = [
    {
      title: "Leads per week",
      caption: "From your weekly reports",
      series: ordered.map((r) => r.leads),
      format: (v: number) => Math.round(v).toLocaleString("en-US"),
    },
    {
      title: "Revenue per week",
      caption: "Closes you reported, in dollars",
      series: ordered.map((r) => r.revenue ?? 0),
      format: usdWhole,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className={SECTION_LABEL}>Marketing performance</p>
        <p className={SECTION_LABEL}>
          <span className="tabular-nums text-foreground/70">
            {ordered.length}
          </span>{" "}
          weeks reported
        </p>
      </div>

      <StatStrip columns={4} ariaLabel="Marketing performance">
        <StatCell label="Total leads">
          {totalLeads > 0 ? (
            <Stat>
              <AnimatedNumber
                value={totalLeads}
                format={(v) => Math.round(v).toLocaleString("en-US")}
              />
            </Stat>
          ) : (
            <StatEmpty>no leads reported yet.</StatEmpty>
          )}
        </StatCell>

        <StatCell label="Avg cost per lead">
          {totalLeads > 0 ? (
            <Stat>
              <AnimatedNumber value={avgCpl} format={usd} />
            </Stat>
          ) : (
            <StatEmpty>waiting on the first week.</StatEmpty>
          )}
        </StatCell>

        <StatCell label="Tracked revenue">
          {totalRevenue > 0 ? (
            <Stat>
              <AnimatedNumber value={totalRevenue} format={usdWhole} />
            </Stat>
          ) : (
            <StatEmpty>no closes reported yet.</StatEmpty>
          )}
          <StatMeta>{usdWhole(totalSpend)} spent</StatMeta>
        </StatCell>

        <StatCell label="Return on spend">
          {totalSpend > 0 && totalRevenue > 0 ? (
            <Stat>
              <AnimatedNumber value={roas} format={(v) => `${v.toFixed(2)}×`} />
            </Stat>
          ) : (
            <StatEmpty>needs revenue to compute.</StatEmpty>
          )}
        </StatCell>
      </StatStrip>

      {ordered.length > 1 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {charts.map((chart) => (
            <div key={chart.title}>
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-medium text-foreground">
                  {chart.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {chart.caption}
                </p>
              </div>
              <AreaChart
                className="mt-5"
                points={chart.series}
                xLabels={weekLabels}
                height={140}
                format={chart.format}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Link href="/reports" className={QUIET_LINK}>
          View weekly reports
        </Link>
      </div>
    </section>
  );
}
