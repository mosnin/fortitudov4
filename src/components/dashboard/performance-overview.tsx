"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BracketLabel, CountUp } from "@/components/ui/firecrawl";
import { AreaChart } from "@/components/ui/charts";
import { cascade, cascadeItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp } from "lucide-react";

/**
 * Marketing performance band — headline results from the weekly reporting
 * loop (leads, cost per lead, revenue, return on spend) with weekly trend
 * charts, fed by /api/reports.
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

  const tiles = [
    {
      label: "Total Leads",
      value: totalLeads,
      format: (v: number) => Math.round(v).toLocaleString("en-US"),
    },
    { label: "Avg Cost Per Lead", value: avgCpl, format: usd },
    {
      label: "Tracked Revenue",
      value: totalRevenue,
      format: usdWhole,
      accent: "text-success",
    },
    {
      label: "Return on Spend",
      value: roas,
      format: (v: number) => `${v.toFixed(2)}×`,
      accent: "text-brand",
    },
  ];

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
      title: "Leads per Week",
      caption: "From your weekly reports",
      series: ordered.map((r) => r.leads),
      format: (v: number) => Math.round(v).toLocaleString("en-US"),
    },
    {
      title: "Revenue per Week",
      caption: "Closes you reported, in dollars",
      series: ordered.map((r) => r.revenue ?? 0),
      format: usdWhole,
    },
  ];

  return (
    <motion.section
      variants={cascade}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header mirrors the delivery-pipeline band so the two read as one
          system — this one only ever appears for marketing engagements. */}
      <motion.div
        variants={cascadeItem}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h2 className="text-[15px] font-semibold">Marketing Performance</h2>
        </div>
        <BracketLabel n={ordered.length} label="Weeks Reported" />
      </motion.div>

      <div className="grid grid-cols-2 border-b border-border lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            variants={cascadeItem}
            className={cn(
              "px-5 py-6",
              i % 2 === 1 && "border-l border-border",
              i >= 2 && "max-lg:border-t max-lg:border-border",
              i > 0 && "lg:border-l lg:border-border"
            )}
          >
            <p className="micro-label">{tile.label}</p>
            <p
              className={cn(
                "mt-2 text-3xl font-bold tracking-tight",
                "accent" in tile && tile.accent
              )}
            >
              <CountUp value={tile.value} format={tile.format} />
            </p>
          </motion.div>
        ))}
      </div>

      {ordered.length > 1 && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {charts.map((chart) => (
            <motion.div key={chart.title} variants={cascadeItem}>
              <div className="border-b border-border pb-3">
                <h3 className="text-[15px] font-semibold">{chart.title}</h3>
                <p className="mt-0.5 font-mono text-[11px] uppercase text-muted-foreground">
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
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/reports"
          className="group inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
        >
          View Weekly Reports
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.section>
  );
}
