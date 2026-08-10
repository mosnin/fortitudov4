"use client";

/**
 * The activity stream.
 *
 * The record the agency reviews, written as a byproduct of the work rather
 * than typed up afterwards. Grouped by day, because "what happened yesterday"
 * is the question people actually bring to it.
 *
 * Each row states who acted. That distinction — Helix or a person — is the
 * one thing this page exists to make unambiguous, so it is a word in the line
 * rather than an icon or a colour.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CrmPageHeader, SectionHead } from "@/components/crm";
import { Reveal } from "@/components/motion";
import { EASE_APPLE } from "@/lib/motion";
import {
  BODY_MUTED,
  GHOST_PILL,
  META,
  QUIET_LINK,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

interface EventRow {
  id: string;
  threadId: string | null;
  threadTitle: string | null;
  kind: string;
  summary: string;
  byHelix: boolean;
  resourceKind: string | null;
  createdAt: string;
  actorFirst: string | null;
  actorLast: string | null;
}

/** Plain-English names. The enum is a storage detail, not a reading experience. */
const KIND_LABEL: Record<string, string> = {
  thread_created: "Thread opened",
  introduction_requested: "Access requested",
  introduction_granted: "Access granted",
  introduction_denied: "Access denied",
  introduction_revoked: "Access revoked",
  read: "Read",
  action_simulated: "Change proposed",
  action_approved: "Change approved",
  action_rejected: "Change declined",
  action_executed: "Change applied",
  action_failed: "Change failed",
  gadget_created: "Gadget built",
  gadget_updated: "Gadget revised",
  blueprint_installed: "Blueprint installed",
};

export function HelixActivity() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [includeReads, setIncludeReads] = useState(false);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  /** Fetch one page. `before` appends; without it the page replaces. */
  const fetchPage = useCallback(
    async (reads: boolean, before?: string) => {
      const params = new URLSearchParams();
      if (reads) params.set("reads", "1");
      if (before) params.set("before", before);
      const response = await fetch(`/api/helix/activity?${params}`);
      if (!response.ok) return { events: [] as EventRow[], nextBefore: null };
      return (await response.json()) as {
        events: EventRow[];
        nextBefore: string | null;
      };
    },
    []
  );

  // Loads on mount and whenever the reads filter changes. The fetch lives in
  // the effect and every setState happens after an await, so no render is
  // scheduled from the render pass that started it. Clearing the list back to
  // the skeleton belongs to the toggle handler, not here.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const page = await fetchPage(includeReads);
      if (cancelled) return;
      setEvents(page.events);
      setNextBefore(page.nextBefore);
    })();
    return () => {
      cancelled = true;
    };
  }, [includeReads, fetchPage]);

  const loadEarlier = useCallback(async () => {
    if (!nextBefore) return;
    setLoadingMore(true);
    const page = await fetchPage(includeReads, nextBefore);
    setEvents((current) => [...(current ?? []), ...page.events]);
    setNextBefore(page.nextBefore);
    setLoadingMore(false);
  }, [fetchPage, includeReads, nextBefore]);

  const days = groupByDay(events ?? []);

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <CrmPageHeader
          section="Helix."
          title="Activity"
          subtitle={
            events === null
              ? undefined
              : events.length === 0
                ? "Nothing recorded yet."
                : "Everything Helix and the team have done, newest first."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setEvents(null);
                setIncludeReads((current) => !current);
              }}
              className={GHOST_PILL}
            >
              {includeReads ? "Hide reads" : "Include reads"}
            </button>
          }
        />

        {events === null ? (
          <StreamSkeleton />
        ) : events.length === 0 ? (
          <Reveal variant="fade">
            <p className={cn(BODY_MUTED, "py-10")}>
              Every grant, proposal, approval and change lands here as it
              happens. Nothing to show until Helix does some work.
            </p>
          </Reveal>
        ) : (
          <div className="space-y-8">
            {days.map((day) => (
              <section key={day.label} className="space-y-3">
                <SectionHead title={day.label} meta={`${day.rows.length}`} />
                <ul className="divide-y divide-border/60">
                  {day.rows.map((event, index) => (
                    <motion.li
                      key={event.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.18,
                        ease: EASE_APPLE,
                        delay: Math.min(index, 10) * 0.015,
                      }}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm text-foreground">
                          {event.summary}
                        </p>
                        <p className={META}>
                          {KIND_LABEL[event.kind] ?? event.kind} ·{" "}
                          {event.byHelix
                            ? "Helix"
                            : actorName(event) || "a teammate"}
                          {event.threadId && event.threadTitle && (
                            <>
                              {" · "}
                              <Link
                                href={`/admin/helix/${event.threadId}`}
                                className={QUIET_LINK}
                              >
                                {event.threadTitle}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                      <span className={cn(META, "shrink-0")}>
                        {clockTime(event.createdAt)}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </section>
            ))}

            {nextBefore && (
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void loadEarlier()}
                className={cn(GHOST_PILL, loadingMore && "opacity-50")}
              >
                {loadingMore ? "Loading…" : "Load earlier"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function actorName(event: EventRow): string {
  return [event.actorFirst, event.actorLast].filter(Boolean).join(" ");
}

function groupByDay(events: EventRow[]) {
  const days: { label: string; rows: EventRow[] }[] = [];
  for (const event of events) {
    const label = dayLabel(event.createdAt);
    const last = days[days.length - 1];
    if (last && last.label === label) last.rows.push(event);
    else days.push({ label, rows: [event] });
  }
  return days;
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StreamSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1.5 py-2.5">
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
