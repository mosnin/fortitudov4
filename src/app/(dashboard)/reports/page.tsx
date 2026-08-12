"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TrendCard } from "@/components/ui/monthly-trend";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
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

  // One sentence of status — what, if anything, is waiting on the client.
  const status = loading
    ? "Loading your weekly results…"
    : reports.length === 0
      ? "No weeks reported yet — the first lands after launch."
      : pending.length > 0
        ? `${
            pending.length === 1
              ? "One week needs"
              : `${pending.length} weeks need`
          } your sales numbers.`
        : `${completed.length} ${
            completed.length === 1 ? "week" : "weeks"
          } complete, nothing waiting on you.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title="Weekly Reports"
          subtitle={status}
        />

        {/* All-time totals over completed weeks */}
        {completed.length > 0 && (
          <StatStrip ariaLabel="All-time results">
            <StatCell label="Total leads">
              {totalLeads > 0 ? (
                <Stat>{totalLeads.toLocaleString("en-US")}</Stat>
              ) : (
                <StatEmpty>no leads reported yet.</StatEmpty>
              )}
              {totalLeads > 0 && (
                <StatMeta>{usd(avgCpl)} average cost per lead</StatMeta>
              )}
            </StatCell>

            <StatCell label="Total spend">
              {totalSpend > 0 ? (
                <Stat>{usd(totalSpend)}</Stat>
              ) : (
                <StatEmpty>no spend recorded yet.</StatEmpty>
              )}
            </StatCell>

            <StatCell label="Total revenue">
              {totalRevenue > 0 ? (
                <Stat>{usd(totalRevenue)}</Stat>
              ) : (
                <StatEmpty>add your closes to see this.</StatEmpty>
              )}
              {totalRevenue > 0 && totalSpend > 0 && (
                <StatMeta>{roas.toFixed(2)}x return on spend</StatMeta>
              )}
            </StatCell>
          </StatStrip>
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
            <RecordListSkeleton rows={4} />
          ) : reports.length === 0 ? (
            <EmptyState
              className="border-t border-border/60"
              title="No reports yet"
              description="The Fortitudo team posts your results here every week — check back after your project goes live."
            />
          ) : (
            <RecordList className="border-t border-border/60">
              {reports.map((r, i) => (
                <RecordRow
                  key={r.id}
                  index={i}
                  primary={
                    <span className="tabular-nums">
                      {fmtDay(r.weekStart)} – {fmtDay(r.weekEnd)}
                    </span>
                  }
                  status={
                    r.status === "pending_client" ? (
                      <RowPill emphasis>Needs your input</RowPill>
                    ) : (
                      <RowPill>Completed</RowPill>
                    )
                  }
                  secondary={
                    <span className="tabular-nums">
                      {[
                        `${r.leads.toLocaleString("en-US")} leads`,
                        `${usd(r.cpl)} CPL`,
                        `${usd(r.totalSpend)} spend`,
                        r.closes !== null
                          ? `${r.closes.toLocaleString("en-US")} closes`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  }
                  meta={
                    <span className="text-sm tabular-nums text-foreground">
                      {r.revenue !== null ? usd(r.revenue) : "—"}
                    </span>
                  }
                />
              ))}
            </RecordList>
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
