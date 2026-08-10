"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/firecrawl";
import { Input } from "@/components/ui/input";
import { TrendCard } from "@/components/ui/monthly-trend";
import { rowCascade, rowItem, cascade, cascadeItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

/**
 * Weekly Reports — the client half of the reporting loop for DIGITAL MARKETING
 * engagements. The Fortitudo team posts each week's results (leads, cost per
 * lead, spend); pending weeks surface here for the client to add closes and
 * revenue, completing the week and feeding the true return-on-spend totals.
 *
 * Clients on the other four offerings never have reports, so this page shows
 * its empty state and the nav entry is simply unused for them.
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
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDay = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ClientReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reports)) setReports(data.reports);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const pending = reports.filter((r) => r.status === "pending_client");
  const completed = reports.filter((r) => r.status === "completed");

  // All-time totals over completed weeks; ROAS = revenue / spend.
  const totalLeads = completed.reduce((s, r) => s + r.leads, 0);
  const totalSpend = completed.reduce((s, r) => s + r.totalSpend, 0);
  const totalRevenue = completed.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const tiles = [
    { label: "Total leads", value: totalLeads.toLocaleString("en-US") },
    { label: "Avg cost per lead", value: usd(avgCpl) },
    { label: "Total spend", value: usd(totalSpend) },
    { label: "Total revenue", value: usd(totalRevenue) },
    { label: "Return on spend", value: `${roas.toFixed(2)}x` },
  ];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Workspace"
          title="Weekly Reports"
          description="Your results week by week — add your closes and revenue to see the true return on what we build and run for you."
        />

        {/* All-time totals — hairline-divided band */}
        {completed.length > 0 && (
          <motion.section
            variants={cascade}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-5 sm:divide-x"
          >
            {tiles.map((t) => (
              <motion.div
                key={t.label}
                variants={cascadeItem}
                className="py-5 sm:px-5 sm:first:pl-0"
              >
                <p className={SECTION_LABEL}>{t.label}</p>
                <p className="mt-2 text-xl tracking-tight tabular-nums text-foreground">
                  {t.value}
                </p>
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Action required — pending weeks */}
        {pending.length > 0 && (
          <section className={SECTION_RHYTHM}>
            <p className={SECTION_LABEL}>
              <span className="tabular-nums text-foreground/70">
                {pending.length}
              </span>{" "}
              {pending.length === 1 ? "week needs" : "weeks need"} your sales
              numbers
            </p>
            <div className="space-y-4">
              {pending.map((r) => (
                <PendingReportForm key={r.id} report={r} onDone={load} />
              ))}
            </div>
          </section>
        )}

        {/* Trends over completed weeks */}
        {completed.length > 1 && (
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <TrendCard
              title="Leads per week"
              points={completed.map((r) => ({
                date: r.weekEnd,
                value: r.leads,
              }))}
              format={(v) => Math.round(v).toLocaleString("en-US")}
            />
            <TrendCard
              title="Revenue per week"
              points={completed.map((r) => ({
                date: r.weekEnd,
                value: r.revenue ?? 0,
              }))}
              format={usd}
            />
          </section>
        )}

        {/* History */}
        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>Report history</p>
          {loading ? (
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="space-y-2 py-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </li>
              ))}
            </ul>
          ) : reports.length === 0 ? (
            <div className="border-t border-border py-10">
              <p className="text-sm font-medium text-foreground">
                No reports yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The Fortitudo team posts your results here every week — check
                back after your project goes live.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className={cn(SECTION_LABEL, "py-3 pr-4 font-medium")}>
                      Week
                    </th>
                    <th
                      className={cn(
                        SECTION_LABEL,
                        "py-3 pr-4 text-right font-medium"
                      )}
                    >
                      Leads
                    </th>
                    <th
                      className={cn(
                        SECTION_LABEL,
                        "py-3 pr-4 text-right font-medium"
                      )}
                    >
                      CPL
                    </th>
                    <th
                      className={cn(
                        SECTION_LABEL,
                        "py-3 pr-4 text-right font-medium"
                      )}
                    >
                      Spend
                    </th>
                    <th
                      className={cn(
                        SECTION_LABEL,
                        "py-3 pr-4 text-right font-medium"
                      )}
                    >
                      Closes
                    </th>
                    <th
                      className={cn(
                        SECTION_LABEL,
                        "py-3 pr-4 text-right font-medium"
                      )}
                    >
                      Revenue
                    </th>
                    <th className={cn(SECTION_LABEL, "py-3 font-medium")}>
                      Status
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={rowCascade}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-border/60"
                >
                  {reports.map((r) => (
                    <motion.tr key={r.id} variants={rowItem}>
                      <td className="whitespace-nowrap py-3 pr-4 text-xs text-muted-foreground">
                        {fmtDay(r.weekStart)} – {fmtDay(r.weekEnd)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium text-foreground">
                        {r.leads.toLocaleString("en-US")}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {usd(r.cpl)}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {usd(r.totalSpend)}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {r.closes !== null
                          ? r.closes.toLocaleString("en-US")
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-right text-foreground">
                        {r.revenue !== null ? usd(r.revenue) : "—"}
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            r.status === "pending_client"
                              ? STATUS_PILL_ACTIVE
                              : STATUS_PILL
                          }
                        >
                          {r.status === "pending_client"
                            ? "Needs your input"
                            : "Completed"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Inline completion form for one pending week. */
function PendingReportForm({
  report,
  onDone,
}: {
  report: Report;
  onDone: () => void;
}) {
  const [closes, setCloses] = useState("");
  const [revenue, setRevenue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const closesNum = parseInt(closes, 10);
    const revenueCents = Math.round(parseFloat(revenue) * 100);
    if (!Number.isFinite(closesNum) || closesNum < 0) {
      setError("Enter how many clients you closed.");
      return;
    }
    if (!Number.isFinite(revenueCents) || revenueCents < 0) {
      setError("Enter the revenue those closes generated.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          closes: closesNum,
          revenue: revenueCents,
        }),
      });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError("Could not save — try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Week of {fmtDay(report.weekStart)} – {fmtDay(report.weekEnd)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {report.leads.toLocaleString("en-US")} leads · {usd(report.cpl)} CPL ·{" "}
          {usd(report.totalSpend)} spend
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <span className="mb-1.5 block text-[13px] font-medium">
            Clients closed
          </span>
          <Input
            inputMode="numeric"
            placeholder="e.g. 4"
            value={closes}
            onChange={(e) => setCloses(e.target.value)}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium">
            Revenue generated ($)
          </span>
          <Input
            inputMode="decimal"
            placeholder="e.g. 6000"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              PRIMARY_PILL,
              "w-full justify-center sm:w-auto disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {saving ? "Saving…" : "Complete report"}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
