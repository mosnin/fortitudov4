"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RowPill,
  RecordRow,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { AnimatedNumber } from "@/components/motion";
import { HelixWaitingStrip } from "@/components/admin/helix-waiting-strip";
import { AreaChart, BarList } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  H3,
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  QUIET_LINK,
} from "@/lib/typography";

interface Dashboard {
  activeProjects: number;
  pendingRevisions: number;
  highPriorityTaskCount: number;
  months: string[];
  newProjectsSeries: number[];
  pipeline: { status: string; label: string; count: number }[];
  highPriorityTasks: {
    id: string;
    title: string;
    projectName: string;
    assigneeName: string;
    priority: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (res.status === 403) {
          setDenied(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pipelineTotal = data
    ? data.pipeline.reduce((s, p) => s + p.count, 0)
    : 0;

  const subtitle = denied
    ? "Staff access only."
    : loading
      ? "Pulling the latest numbers."
      : data
        ? `${data.activeProjects} project${
            data.activeProjects === 1 ? "" : "s"
          } in flight, ${data.pendingRevisions} revision${
            data.pendingRevisions === 1 ? "" : "s"
          } waiting on triage.`
        : "The overview could not be loaded.";

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Operations."
          title="Overview"
          subtitle={subtitle}
        />

        {denied ? (
          <div className="py-14 text-center">
            <h2 className={H3}>Admin overview</h2>
            <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
              This dashboard is staff-only.
            </p>
          </div>
        ) : (
          <>
            {/* Renders only when Helix has queued something. */}
            <HelixWaitingStrip />

            <StatStrip columns={3} ariaLabel="Agency operations">
              <StatCell label="Active Projects">
                {loading ? (
                  <Skeleton className="h-9 w-14" />
                ) : data && data.activeProjects > 0 ? (
                  <>
                    <Stat>
                      <AnimatedNumber value={data.activeProjects} />
                    </Stat>
                    <StatMeta>{pipelineTotal} in the pipeline</StatMeta>
                  </>
                ) : (
                  <StatEmpty>Nothing in flight right now.</StatEmpty>
                )}
              </StatCell>

              <StatCell label="Pending Revisions">
                {loading ? (
                  <Skeleton className="h-9 w-14" />
                ) : data && data.pendingRevisions > 0 ? (
                  <Stat>
                    <AnimatedNumber value={data.pendingRevisions} />
                  </Stat>
                ) : (
                  <StatEmpty>No revisions waiting on triage.</StatEmpty>
                )}
              </StatCell>

              <StatCell label="High Priority Tasks">
                {loading ? (
                  <Skeleton className="h-9 w-14" />
                ) : data && data.highPriorityTaskCount > 0 ? (
                  <Stat>
                    <AnimatedNumber value={data.highPriorityTaskCount} />
                  </Stat>
                ) : (
                  <StatEmpty>The queue is clear.</StatEmpty>
                )}
              </StatCell>
            </StatStrip>

            {/* New projects chart + high priority tasks */}
            <section className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="border-b border-border pb-3">
                  <h2 className={H3}>New Projects</h2>
                  <p className={cn(BODY_MUTED, "mt-0.5")}>Last 6 months</p>
                </div>
                {loading ? (
                  <Skeleton className="mt-6 h-64 w-full" />
                ) : (
                  <AreaChart
                    className="mt-6"
                    points={data?.newProjectsSeries ?? [0, 0, 0, 0, 0, 0]}
                    xLabels={data?.months ?? []}
                    height={260}
                    format={(v) => Math.round(v).toLocaleString("en-US")}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className={H3}>High Priority Tasks</h2>
                  <span className={SECTION_LABEL}>Action required</span>
                </div>

                {loading ? (
                  <RecordListSkeleton rows={4} />
                ) : !data || data.highPriorityTasks.length === 0 ? (
                  <p className={cn(BODY_MUTED, "mt-6")}>
                    No high-priority tasks right now.
                  </p>
                ) : (
                  <RecordList>
                    {data.highPriorityTasks.map((t, i) => (
                      <RecordRow
                        key={t.id}
                        index={i}
                        primary={t.title}
                        status={<RowPill>High</RowPill>}
                        secondary={`${t.projectName} · ${t.assigneeName}`}
                      />
                    ))}
                  </RecordList>
                )}
              </div>
            </section>

            {/* Pipeline snapshot */}
            <section className={cn(SECTION_RHYTHM, "border-t border-border pt-8")}>
              <div className="flex items-center justify-between">
                <p className={SECTION_LABEL}>
                  Pipeline snapshot · {pipelineTotal} projects
                </p>
                <Link href="/admin/projects" className={QUIET_LINK}>
                  View all projects
                </Link>
              </div>
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="max-w-2xl">
                  <BarList
                    items={(data?.pipeline ?? []).map((p) => ({
                      name: p.label,
                      total: p.count,
                    }))}
                    format={(v) => Math.round(v).toLocaleString("en-US")}
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
