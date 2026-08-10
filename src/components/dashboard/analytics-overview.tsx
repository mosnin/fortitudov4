"use client";

import { useState, useEffect } from "react";
import { CountUp } from "@/components/ui/firecrawl";
import { AreaChart } from "@/components/ui/charts";
import { SECTION_LABEL } from "@/lib/typography";

interface AnalyticsEvent {
  id: string;
  event: string;
  value: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AnalyticsOverviewProps {
  projectId: string;
}

/** Loading placeholder — mirrors the hairline rows it replaces. */
function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsOverview({ projectId }: AnalyticsOverviewProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <RowsSkeleton />;
  }

  if (events.length === 0) {
    return (
      <div className="py-10">
        <p className="text-sm font-medium text-foreground">
          No analytics data yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once your project is live and tracking events, metrics will appear
          here.
        </p>
      </div>
    );
  }

  // Aggregate events by type
  const eventCounts = events.reduce<Record<string, { count: number; totalValue: number }>>((acc, e) => {
    if (!acc[e.event]) acc[e.event] = { count: 0, totalValue: 0 };
    acc[e.event].count++;
    acc[e.event].totalValue += e.value || 0;
    return acc;
  }, {});

  const sortedEvents = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b.count - a.count);

  const maxCount = sortedEvents[0]?.[1].count || 1;

  // Recent events (last 10)
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Daily event counts, oldest → newest — a real numeric series drawn from
  // the same fetched data (presentation only).
  const byDay = new Map<string, number>();
  [...events]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((e) => {
      const key = new Date(e.createdAt).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) || 0) + 1);
    });
  const dayKeys = [...byDay.keys()];
  const series = [...byDay.values()];
  const formatDay = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });

  const totalValue = events.reduce((sum, e) => sum + (e.value || 0), 0);

  const stats = [
    { label: "Total Events", value: events.length },
    { label: "Event Types", value: sortedEvents.length },
    { label: "Total Value", value: totalValue },
  ];

  return (
    <div className="space-y-8">
      {/* Summary metrics — hairline-divided 3-up */}
      <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="py-5 sm:px-6 sm:first:pl-0">
            <p className="text-2xl tracking-tight tabular-nums text-foreground">
              <CountUp value={stat.value} />
            </p>
            <p className={`${SECTION_LABEL} mt-1.5`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Events over time — only when there's a real multi-point series */}
      {series.length >= 2 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <p className={SECTION_LABEL}>Events over time</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatDay(dayKeys[0])} — {formatDay(dayKeys[dayKeys.length - 1])}
            </p>
          </div>
          <AreaChart
            points={series}
            xLabels={dayKeys.map((k, i) =>
              i === 0 || i === dayKeys.length - 1 ? formatDay(k) : ""
            )}
            height={140}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Event breakdown */}
        <section className="space-y-3">
          <p className={SECTION_LABEL}>Event breakdown</p>
          <ul className="divide-y divide-border/60">
            {sortedEvents.slice(0, 8).map(([event, data]) => (
              <li key={event} className="py-3">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-foreground">
                    {event}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {data.count}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{ width: `${(data.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent events */}
        <section className="space-y-3">
          <p className={SECTION_LABEL}>Recent events</p>
          <ul className="divide-y divide-border/60">
            {recentEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {event.event}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {event.value !== null && (
                  <span className="shrink-0 text-sm tabular-nums text-foreground">
                    {event.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
