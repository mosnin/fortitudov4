"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  actorType: "human" | "agent" | "system";
  kind: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// A compact, monospace tag from the event kind — typography over icon chips.
function tagFor(kind: string): string {
  return kind.replace(/_/g, " ").trim() || "event";
}

// Actor glyph: agents and the system read as machine work (○), humans as live (●).
function glyphFor(actorType: ActivityEvent["actorType"]): { glyph: string; live: boolean } {
  if (actorType === "human") return { glyph: "●", live: true };
  if (actorType === "agent") return { glyph: "◇", live: false };
  return { glyph: "○", live: false };
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityTimeline({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetch(`/api/projects/${projectId}/activity`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (active && Array.isArray(data)) setEvents(data);
        })
        .catch(() => {
          if (active) setEvents([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    load();
    // Liveness: refetch on focus and on a calm interval (DESIGN §6.5).
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const timer = setInterval(load, 60000);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [projectId]);

  const grouped = events.reduce<Record<string, ActivityEvent[]>>((acc, e) => {
    const group = getDateGroup(e.createdAt);
    (acc[group] ??= []).push(e);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center rounded-3xl border border-border/60 bg-card/40 py-16 backdrop-blur-xl">
        <Loader2 className="h-5 w-5 animate-spin text-orange" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/40 p-12 text-center backdrop-blur-xl">
        <p className="font-mono text-sm text-muted-foreground">~ nothing logged yet ~</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Decisions, deliverables, and agent runs will appear here as the build progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, items]) => (
        <div
          key={date}
          className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl"
        >
          {/* Group rule with a trailing count: TODAY ──── 04 */}
          <div className="flex items-center gap-3 px-5 pb-2 pt-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {date}
            </span>
            <span className="h-px flex-1 bg-border/60" />
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
              {items.length.toString().padStart(2, "0")}
            </span>
          </div>

          {items.map((e) => {
            const { glyph, live } = glyphFor(e.actorType);
            return (
              <div
                key={e.id}
                className="flex items-start gap-3 border-t border-border/40 px-5 py-3.5 sm:gap-4"
              >
                <span
                  className={cn(
                    "mt-0.5 font-mono text-xs",
                    live ? "text-orange" : "text-muted-foreground/50"
                  )}
                  aria-hidden
                >
                  {glyph}
                </span>
                <span className="mt-0.5 hidden w-24 shrink-0 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-orange/70 sm:block">
                  {tagFor(e.kind)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/90">{e.summary}</p>
                  <span className="mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-orange/60 sm:hidden">
                    {tagFor(e.kind)}
                  </span>
                </div>
                <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {formatRelativeTime(e.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
