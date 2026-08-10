"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
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
          <RecordListSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <CrmPageHeader
            section="Portal preview."
            title="Client Portal"
            subtitle="This preview could not be loaded."
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

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className="space-y-3">
          <Link href="/admin/clients" className={QUIET_LINK}>
            Back to Clients
          </Link>
          <CrmPageHeader
            section="Portal preview."
            title={client.companyName}
            subtitle={`${pipeline.stageLabel} · ${pipeline.done} of ${pipeline.total} steps done — exactly what ${client.contactName} sees.`}
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
          <RowPill>{offering}</RowPill>
          <span className="ml-auto">
            <RowPill>
              {client.hasPortalLogin
                ? "Portal login active"
                : "Invite not accepted"}
            </RowPill>
          </span>
        </div>

        {/* Their performance tiles — digital marketing only */}
        {showMarketing && (
          <StatStrip columns={3} ariaLabel="Client performance">
            <StatCell label="Total Leads">
              {totals.totalLeads > 0 ? (
                <>
                  <Stat>{totals.totalLeads.toLocaleString("en-US")}</Stat>
                  <StatMeta>{usd(totals.avgCpl)} average cost per lead</StatMeta>
                </>
              ) : (
                <StatEmpty>No leads reported yet.</StatEmpty>
              )}
            </StatCell>
            <StatCell label="Ad Spend">
              {totals.totalSpend > 0 ? (
                <Stat>{usd(totals.totalSpend)}</Stat>
              ) : (
                <StatEmpty>No spend recorded yet.</StatEmpty>
              )}
            </StatCell>
            <StatCell label="Revenue">
              {totals.totalRevenue > 0 ? (
                <>
                  <Stat>{usd(totals.totalRevenue)}</Stat>
                  <StatMeta>{totals.roas.toFixed(2)}x return on ad spend</StatMeta>
                </>
              ) : (
                <StatEmpty>They haven&apos;t reported revenue yet.</StatEmpty>
              )}
            </StatCell>
          </StatStrip>
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
          <RecordList>
            {pipeline.stages.map((s, i) => (
              <RecordRow
                key={s.key}
                index={i}
                primary={s.label}
                status={
                  s.complete ? (
                    <RowPill>Done</RowPill>
                  ) : s.active ? (
                    <RowPill emphasis>Current</RowPill>
                  ) : undefined
                }
              />
            ))}
          </RecordList>
        </section>

        {/* Their weekly reports — digital marketing only */}
        {showMarketing && (
          <section className={SECTION_RHYTHM}>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <h2 className={H3}>Weekly Reports</h2>
              {totals.pending > 0 && (
                <span className="ml-auto">
                  <RowPill>{totals.pending} awaiting them</RowPill>
                </span>
              )}
            </div>
            {reports.length === 0 ? (
              <p className={cn(BODY_MUTED, "pt-3")}>
                No weekly results posted yet.
              </p>
            ) : (
              <RecordList>
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
                      <RowPill emphasis={r.status !== "pending_client"}>
                        {r.status === "pending_client"
                          ? "Needs them"
                          : "Complete"}
                      </RowPill>
                    }
                    secondary={
                      <span className="tabular-nums">
                        {r.leads.toLocaleString("en-US")} leads · {usd(r.cpl)}{" "}
                        CPL · {usd(r.totalSpend)} spend
                      </span>
                    }
                    meta={
                      <span className="text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                        {r.revenue !== null ? `${usd(r.revenue)} revenue` : "—"}
                      </span>
                    }
                  />
                ))}
              </RecordList>
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
              <RecordList>
                {phases.map((ph, i) => (
                  <RecordRow
                    key={ph.id}
                    index={i}
                    primary={ph.name}
                    status={
                      ph.status === "completed" ? (
                        <RowPill>Done</RowPill>
                      ) : ph.status === "in_progress" ? (
                        <RowPill emphasis>Current</RowPill>
                      ) : undefined
                    }
                  />
                ))}
              </RecordList>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
