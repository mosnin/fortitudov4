"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CountUp, PageHero } from "@/components/ui/firecrawl";
import { AreaChart, BarList } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { cascade, cascadeItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  H3,
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
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

/** Hairline-divided 3-up grid cell borders. */
const statCell = (i: number) =>
  cn("px-5 py-6", i > 0 && "border-t border-border sm:border-t-0 sm:border-l");

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

  const stats = [
    { label: "Active Projects", value: data?.activeProjects ?? 0 },
    { label: "Pending Revisions", value: data?.pendingRevisions ?? 0 },
    { label: "High Priority Tasks", value: data?.highPriorityTaskCount ?? 0 },
  ];

  const xLabels = data?.months ?? [];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Operations"
          title="Overview"
          description="Agency operations at a glance — projects, revisions, and the task queue."
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
            {/* Stats — hairline-divided 3-up */}
            <motion.section
              variants={cascade}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 border-y border-border sm:grid-cols-3"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={cascadeItem}
                  className={statCell(i)}
                >
                  <p className={SECTION_LABEL}>{s.label}</p>
                  <p className="mt-2 text-3xl tracking-tight tabular-nums text-foreground">
                    {loading ? (
                      <Skeleton className="h-9 w-14" />
                    ) : (
                      <CountUp value={s.value} />
                    )}
                  </p>
                </motion.div>
              ))}
            </motion.section>

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
                    xLabels={xLabels}
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
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : !data || data.highPriorityTasks.length === 0 ? (
                  <p className={cn(BODY_MUTED, "mt-6")}>
                    No high-priority tasks right now.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {data.highPriorityTasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {t.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {t.projectName} · {t.assigneeName}
                          </p>
                        </div>
                        <span className={cn(STATUS_PILL, "shrink-0")}>High</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Pipeline snapshot */}
            <section className={cn(SECTION_RHYTHM, "border-t border-border pt-8")}>
              <div className="flex items-center justify-between">
                <p className={SECTION_LABEL}>
                  Pipeline snapshot ·{" "}
                  {data ? data.pipeline.reduce((s, p) => s + p.count, 0) : 0}{" "}
                  projects
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
