"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/firecrawl";
import { Skeleton } from "@/components/ui/skeleton";
import { cascade, cascadeItem } from "@/lib/motion";
import { PACKAGE_LABELS, type ClientPackage } from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  GHOST_PILL,
  H3,
  PAGE_RHYTHM,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

interface PortalView {
  client: {
    id: string;
    companyName: string;
    contactName: string;
    email: string | null;
    status: string;
    package: string;
    packageLabel: string | null;
    driveUrl: string | null;
    landingPageUrl: string | null;
    hasPortalLogin: boolean;
  };
  pipeline: {
    stageLabel: string;
    total: number;
    done: number;
    stages: { key: string; label: string; complete: boolean; active: boolean }[];
  };
  reports: {
    id: string;
    weekStart: string;
    weekEnd: string;
    leads: number;
    cpl: number;
    totalSpend: number;
    closes: number | null;
    revenue: number | null;
    status: "pending_client" | "completed";
  }[];
  totals: {
    totalLeads: number;
    totalSpend: number;
    totalRevenue: number;
    avgCpl: number;
    roas: number;
    pending: number;
  };
  project: { id: string; name: string; status: string } | null;
  phases: { id: string; name: string; status: string }[];
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
    timeZone: "UTC",
  });

/**
 * View Portal — a read-only mirror of what this client sees in their own
 * portal: delivery pipeline and project phases for everyone, plus the
 * performance tiles and weekly reports for digital-marketing engagements
 * only. Admin-only; works before a portal login exists.
 */
export default function ClientPortalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<PortalView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/clients/${id}/portal`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <PageHero
            section="Portal preview"
            title="Client Portal"
            description="Preview unavailable."
          />
          <div className="py-14 text-center">
            <h2 className={H3}>Couldn&apos;t load this client</h2>
            <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
              The client may have been removed.{" "}
              <Link href="/admin/clients" className={QUIET_LINK}>
                Back to Clients
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { client, pipeline, reports, totals, project, phases } = data;
  const pct = pipeline.total
    ? Math.round((pipeline.done / pipeline.total) * 100)
    : 0;

  // Leads / CPL / spend / ROAS and the weekly reporting loop only exist for
  // digital-marketing engagements. A websites or consultation client never
  // sees them — unless reports were already filed against them.
  const showMarketing =
    client.package === "digital_marketing" || reports.length > 0;

  const offering =
    client.package === "custom" && client.packageLabel
      ? client.packageLabel
      : PACKAGE_LABELS[client.package as ClientPackage] ?? "—";

  const tiles = [
    { label: "Total Leads", value: totals.totalLeads.toLocaleString("en-US") },
    { label: "Avg CPL", value: usd(totals.avgCpl) },
    { label: "Ad Spend", value: usd(totals.totalSpend) },
    { label: "Revenue", value: usd(totals.totalRevenue) },
    { label: "ROAS", value: `${totals.roas.toFixed(2)}x` },
  ];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className="space-y-3">
          <Link href="/admin/clients" className={QUIET_LINK}>
            Back to Clients
          </Link>
          <PageHero
            section="Portal preview"
            title={client.companyName}
            description={`Exactly what ${client.contactName} sees in their portal.`}
            action={
              <>
                {client.driveUrl && (
                  <a
                    href={client.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={GHOST_PILL}
                  >
                    Drive
                  </a>
                )}
                {client.landingPageUrl && (
                  <a
                    href={client.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={GHOST_PILL}
                  >
                    Landing Page
                  </a>
                )}
              </>
            }
          />
        </div>

        {/* Read-only banner */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">Viewing as client</span> — read-only
            mirror of their portal.
          </p>
          <span className={STATUS_PILL}>{offering}</span>
          <span className={cn(STATUS_PILL, "ml-auto")}>
            {client.hasPortalLogin
              ? "Portal login active"
              : "Invite not accepted"}
          </span>
        </div>

        {/* Their performance tiles — digital marketing only */}
        {showMarketing && (
          <motion.section
            variants={cascade}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-5 sm:divide-x"
          >
            {tiles.map((t) => (
              <motion.div key={t.label} variants={cascadeItem} className="px-5 py-6">
                <p className={SECTION_LABEL}>{t.label}</p>
                <p className="mt-2 text-2xl tracking-tight tabular-nums text-foreground">
                  {t.value}
                </p>
              </motion.div>
            ))}
          </motion.section>
        )}

        {/* Delivery pipeline — the same stages they watch */}
        <section className={SECTION_RHYTHM}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <p className={SECTION_LABEL}>
              Delivery pipeline · {pipeline.stageLabel}
            </p>
            <p className={cn(SECTION_LABEL, "tabular-nums")}>
              {pipeline.done} of {pipeline.total} · {pct}% complete
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {pipeline.stages.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-2 py-2 text-sm"
              >
                <span
                  className={cn(
                    s.active && "font-medium",
                    !s.active && !s.complete && "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
                {s.complete ? (
                  <span className={STATUS_PILL}>Done</span>
                ) : s.active ? (
                  <span className={STATUS_PILL_ACTIVE}>Current</span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* Their weekly reports — digital marketing only */}
        {showMarketing && (
          <section className={SECTION_RHYTHM}>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <h2 className={H3}>Weekly Reports</h2>
              {totals.pending > 0 && (
                <span className={cn(STATUS_PILL, "ml-auto")}>
                  {totals.pending} awaiting them
                </span>
              )}
            </div>
            {reports.length === 0 ? (
              <p className={cn(BODY_MUTED, "pt-3")}>
                No weekly results posted yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Week</th>
                      <th className={cn(SECTION_LABEL, "py-3 pr-4 text-right")}>
                        Leads
                      </th>
                      <th className={cn(SECTION_LABEL, "py-3 pr-4 text-right")}>
                        CPL
                      </th>
                      <th className={cn(SECTION_LABEL, "py-3 pr-4 text-right")}>
                        Spend
                      </th>
                      <th className={cn(SECTION_LABEL, "py-3 pr-4 text-right")}>
                        Revenue
                      </th>
                      <th className={cn(SECTION_LABEL, "py-3")}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 pr-4 text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                          {fmtDay(r.weekStart)} – {fmtDay(r.weekEnd)}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium tabular-nums">
                          {r.leads.toLocaleString("en-US")}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {usd(r.cpl)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {usd(r.totalSpend)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {r.revenue !== null ? usd(r.revenue) : "—"}
                        </td>
                        <td className="py-3">
                          <span
                            className={
                              r.status === "pending_client"
                                ? STATUS_PILL
                                : STATUS_PILL_ACTIVE
                            }
                          >
                            {r.status === "pending_client"
                              ? "Needs them"
                              : "Complete"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Linked project phases, when a portal project exists */}
        {project && (
          <section className={SECTION_RHYTHM}>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <h2 className={H3}>{project.name}</h2>
              <Link
                href={`/admin/projects/${project.id}`}
                className={cn(QUIET_LINK, "ml-auto")}
              >
                Manage
              </Link>
            </div>
            {phases.length > 0 && (
              <ol className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {phases.map((ph) => (
                  <li
                    key={ph.id}
                    className="flex items-center justify-between gap-2 py-2 text-sm"
                  >
                    <span
                      className={cn(
                        ph.status !== "completed" && "text-muted-foreground"
                      )}
                    >
                      {ph.name}
                    </span>
                    {ph.status === "completed" && (
                      <span className={STATUS_PILL}>Done</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
