"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CountUp } from "@/components/ui/firecrawl";
import { AreaChart, BarList } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AsciiField } from "@/components/ui/ascii-field";
import { cascade, cascadeItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  FolderKanban,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

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
    {
      label: "Active Projects",
      value: data?.activeProjects ?? 0,
      icon: FolderKanban,
      accent: "text-muted-foreground",
    },
    {
      label: "Pending Revisions",
      value: data?.pendingRevisions ?? 0,
      icon: RefreshCw,
      accent: "text-warning",
    },
    {
      label: "High Priority Tasks",
      value: data?.highPriorityTaskCount ?? 0,
      icon: AlertCircle,
      accent: "text-destructive",
    },
  ];

  const xLabels = data?.months ?? [];

  return (
    <div className="space-y-8">
      {/* Header band — serif title, mono eyebrow, ascii atmosphere */}
      <header className="relative border-b border-border pb-6">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 sm:block"
          style={{
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        >
          <AsciiField className="h-full w-full" />
        </div>
        <div className="relative">
          <p className="eyebrow-mono">Fortitudo · Admin</p>
          <h1 className="font-title mt-2 text-3xl tracking-tight sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Agency operations at a glance — projects, revisions, and the task
            queue.
          </p>
        </div>
      </header>

      {denied ? (
        <EmptyState
          icon={AlertCircle}
          title="Admin overview"
          description="This dashboard is staff-only."
        />
      ) : (
        <>
          {/* Stats — hairline-divided 3-up */}
          <motion.section
            variants={cascade}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 border-b border-border sm:grid-cols-3"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={cascadeItem}
                  className={statCell(i)}
                >
                  <div className="flex items-center justify-between">
                    <p className="micro-label">{s.label}</p>
                    <Icon className={cn("h-4 w-4", s.accent)} />
                  </div>
                  <p className="mt-2 text-4xl font-bold tracking-tight">
                    {loading ? (
                      <Skeleton className="h-10 w-14" />
                    ) : (
                      <CountUp value={s.value} />
                    )}
                  </p>
                </motion.div>
              );
            })}
          </motion.section>

          {/* New projects chart + high priority tasks */}
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">
                  New Projects (Last 6 Months)
                </h2>
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
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h2 className="text-[15px] font-semibold">
                    High Priority Tasks
                  </h2>
                </div>
                <span className="micro-label">Action required</span>
              </div>

              {loading ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !data || data.highPriorityTasks.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  No high-priority tasks right now.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.highPriorityTasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {t.title}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          {t.projectName} · {t.assigneeName}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wide text-destructive">
                        High
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Pipeline snapshot */}
          <section className="border-t border-border pt-8">
            <div className="flex items-center justify-between pb-4">
              <p className="bracket-label">
                [ <b>{data ? data.pipeline.reduce((s, p) => s + p.count, 0) : 0}</b>{" "}
                ] · PIPELINE SNAPSHOT
              </p>
              <Link
                href="/admin/projects"
                className="group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
              >
                View all projects
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
  );
}
