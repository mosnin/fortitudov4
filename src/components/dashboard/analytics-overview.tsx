"use client";

import { useState, useEffect } from "react";
import { AreaChart, BarList } from "@/components/ui/charts";
import {
  RecordList,
  RecordListSkeleton,
  RecordRow,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { AnimatedNumber } from "@/components/motion";
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
    return <RecordListSkeleton />;
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

  return (
    <div className="space-y-8">
      {/* Summary metrics */}
      <StatStrip ariaLabel="Analytics summary">
        <StatCell label="Total events">
          <Stat>
            <AnimatedNumber value={events.length} />
          </Stat>
          <StatMeta>
            over {dayKeys.length} {dayKeys.length === 1 ? "day" : "days"}
          </StatMeta>
        </StatCell>
        <StatCell label="Event types">
          <Stat>
            <AnimatedNumber value={sortedEvents.length} />
          </Stat>
        </StatCell>
        <StatCell label="Total value">
          {totalValue > 0 ? (
            <Stat>
              <AnimatedNumber value={totalValue} />
            </Stat>
          ) : (
            <StatEmpty>no valued events yet.</StatEmpty>
          )}
        </StatCell>
      </StatStrip>

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
          <BarList
            items={sortedEvents
              .slice(0, 8)
              .map(([event, data]) => ({ name: event, total: data.count }))}
          />
        </section>

        {/* Recent events */}
        <section className="space-y-3">
          <p className={SECTION_LABEL}>Recent events</p>
          <RecordList>
            {recentEvents.map((event, i) => (
              <RecordRow
                key={event.id}
                index={i}
                primary={event.event}
                secondary={
                  <span className="tabular-nums">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                }
                meta={
                  event.value !== null ? (
                    <span className="text-sm tabular-nums text-foreground">
                      {event.value}
                    </span>
                  ) : undefined
                }
              />
            ))}
          </RecordList>
        </section>
      </div>
    </div>
  );
}
