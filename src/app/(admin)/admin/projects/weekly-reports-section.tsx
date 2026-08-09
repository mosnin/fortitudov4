"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rowCascade, rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ClipboardEdit, Plus } from "lucide-react";

/**
 * Weekly reporting composer — the agency half of the weekly reporting loop
 * (ported from Legendary's Data Entry page as a section of the projects
 * surface). Staff record leads + CPL per client; the report lands on the
 * client portal as "pending client" until they add closes and revenue.
 */

interface ReportRow {
  id: string;
  clientId: string;
  companyName: string | null;
  weekStart: string;
  weekEnd: string;
  leads: number;
  cpl: number;
  totalSpend: number;
  closes: number | null;
  revenue: number | null;
  status: "pending_client" | "completed";
}

interface Feed {
  reports: ReportRow[];
  clients: { id: string; companyName: string; status: string }[];
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

/** Most recent Sunday (UTC), as yyyy-mm-dd for the date input default. */
function lastSunday(): string {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

const fmtDay = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function WeeklyReportsSection({ canManage }: { canManage: boolean }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    clientId: "",
    weekEnding: lastSunday(),
    leads: "",
    cpl: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/weekly-reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Feed | null) => {
        if (data && Array.isArray(data.reports)) setFeed(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const leads = parseInt(form.leads, 10);
    const cplCents = Math.round(parseFloat(form.cpl) * 100);
    if (!form.clientId) {
      setError("Pick a client.");
      return;
    }
    if (!form.weekEnding) {
      setError("Pick the week-ending date.");
      return;
    }
    if (!Number.isFinite(leads) || leads < 0) {
      setError("Enter the number of leads generated.");
      return;
    }
    if (!Number.isFinite(cplCents) || cplCents < 0) {
      setError("Enter the cost per lead.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/weekly-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: form.clientId,
          weekEnding: new Date(form.weekEnding + "T00:00:00Z").toISOString(),
          leads,
          cpl: cplCents,
        }),
      });
      if (!res.ok) throw new Error();
      setForm((f) => ({ ...f, leads: "", cpl: "" }));
      setSaved(true);
      load();
    } catch {
      setError("Could not save the results — try again.");
    } finally {
      setSaving(false);
    }
  }

  const leadsNum = parseInt(form.leads, 10);
  const cplNum = parseFloat(form.cpl);
  const previewSpend =
    Number.isFinite(leadsNum) && Number.isFinite(cplNum)
      ? Math.round(leadsNum * cplNum * 100)
      : null;

  return (
    <section className="space-y-10 border-t border-border pt-8">
      <p className="bracket-label">
        [ <b>{feed?.reports.length ?? 0}</b> ] · WEEKLY REPORTS
      </p>

      {/* Add Weekly Results — hairline-framed form band */}
      {canManage && (
        <div>
          <div className="border-b border-border pb-3">
            <h2 className="text-[15px] font-semibold">Add Weekly Results</h2>
            <p className="mt-0.5 font-mono text-[11px] uppercase text-muted-foreground">
              Update the tracker with the latest data from the ads manager
            </p>
          </div>
          <form
            onSubmit={submit}
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">
                Client
              </span>
              <select
                className={selectClass}
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Select client</option>
                {(feed?.clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">
                Week Ending (Sunday)
              </span>
              <Input
                type="date"
                value={form.weekEnding}
                onChange={(e) =>
                  setForm({ ...form, weekEnding: e.target.value })
                }
              />
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                Calculates the previous 7 days.
              </p>
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">
                Leads Generated
              </span>
              <Input
                inputMode="numeric"
                placeholder="e.g. 45"
                value={form.leads}
                onChange={(e) => setForm({ ...form, leads: e.target.value })}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">
                Cost Per Lead ($)
              </span>
              <Input
                inputMode="decimal"
                placeholder="e.g. 12.50"
                value={form.cpl}
                onChange={(e) => setForm({ ...form, cpl: e.target.value })}
              />
              {previewSpend !== null && (
                <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                  TOTAL SPEND: {usd(previewSpend)}
                </p>
              )}
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              {error && (
                <p className="mb-3 text-sm text-destructive">{error}</p>
              )}
              {saved && !error && (
                <p className="mb-3 font-mono text-[11px] uppercase text-success">
                  Saved — pending the client&apos;s numbers.
                </p>
              )}
              <Button type="submit" disabled={saving}>
                <Plus className="mr-1.5 h-4 w-4" />
                {saving ? "Saving…" : "Save Results"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ClipboardEdit className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[15px] font-semibold">Recent Entries</h2>
          <p className="ml-auto font-mono text-[11px] uppercase text-muted-foreground">
            History of agency data entries
          </p>
        </div>
        {loading ? (
          <div className="pt-4">
            <TableSkeleton rows={5} />
          </div>
        ) : (feed?.reports.length ?? 0) === 0 ? (
          <EmptyState
            icon={ClipboardEdit}
            title="No entries yet"
            description={
              canManage
                ? "Save the first week's results above — the report lands on the client's portal for them to add closes and revenue."
                : "Weekly report entries will appear here once recorded."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="micro-label py-3 pr-4">Client</th>
                  <th className="micro-label py-3 pr-4">Dates</th>
                  <th className="micro-label py-3 pr-4 text-right">Leads</th>
                  <th className="micro-label py-3 pr-4 text-right">CPL</th>
                  <th className="micro-label py-3 pr-4 text-right">
                    Total Spend
                  </th>
                  <th className="micro-label py-3 pr-4 text-right">Revenue</th>
                  <th className="micro-label py-3">Status</th>
                </tr>
              </thead>
              <motion.tbody
                variants={rowCascade}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border"
              >
                {feed?.reports.map((r) => (
                  <motion.tr
                    key={r.id}
                    variants={rowItem}
                    className="group transition-colors hover:bg-muted/50"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {r.companyName ?? "—"}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDay(r.weekStart)} – {fmtDay(r.weekEnd)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold">
                      {r.leads.toLocaleString("en-US")}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono">
                      {usd(r.cpl)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold">
                      {usd(r.totalSpend)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono">
                      {r.revenue !== null ? (
                        <span className="text-success">{usd(r.revenue)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "font-mono text-[11px] font-semibold uppercase tracking-wide",
                          r.status === "pending_client"
                            ? "text-warning"
                            : "text-success"
                        )}
                      >
                        {r.status === "pending_client"
                          ? "Pending Client"
                          : "Completed"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
