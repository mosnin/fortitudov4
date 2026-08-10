"use client";

/**
 * The approval queue.
 *
 * The screen the deferred-approval design exists to serve. Helix worked while
 * nobody was watching; this is where a human reads what it did and takes or
 * drops it — one at a time, a thread at a time, or the lot.
 *
 * Composed from the product kit (design.md): no decorative icons, monochrome,
 * words rather than glyphs for status. The one thing that earns extra weight
 * is the before/after preview, because that is the whole basis for deciding.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CrmPageHeader,
  RowPill,
  SectionHead,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
  StatStripSkeleton,
  TabStrip,
} from "@/components/crm";
import { Reveal } from "@/components/motion";
import { EASE_APPLE } from "@/lib/motion";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  META,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
  SECTION_LABEL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

type Risk = "low" | "medium" | "high";
type Status = "simulated" | "executed" | "rejected" | "failed";

interface PreviewChange {
  label: string;
  before?: string;
  after: string;
}

interface ActionRow {
  id: string;
  threadId: string;
  threadTitle: string;
  op: string;
  resourceKind: string;
  summary: string;
  risk: Risk;
  preview: { changes?: PreviewChange[]; note?: string } | null;
  status: Status;
  sequence: number;
  error: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewerFirst: string | null;
  reviewerLast: string | null;
}

const RISK_LABEL: Record<Risk, string> = {
  low: "Routine",
  medium: "Notable",
  high: "Significant",
};

/** Queue states a reviewer filters by. Counts are computed, so the strip's
 *  tab list is built inline rather than from a constant. */
type TabKey = "pending" | "applied" | "declined";

export function HelixApprovals() {
  const [actions, setActions] = useState<ActionRow[] | null>(null);
  const [tab, setTab] = useState<TabKey>("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/helix/approvals");
      if (!response.ok) throw new Error("Could not load the queue.");
      const data = (await response.json()) as { actions: ActionRow[] };
      setActions(data.actions);
    } catch {
      setError("Could not load the approval queue.");
      setActions([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(
    () => (actions ?? []).filter((a) => a.status === "simulated"),
    [actions]
  );
  const applied = useMemo(
    () => (actions ?? []).filter((a) => a.status === "executed"),
    [actions]
  );
  const declined = useMemo(
    () =>
      (actions ?? []).filter(
        (a) => a.status === "rejected" || a.status === "failed"
      ),
    [actions]
  );

  const visible = tab === "pending" ? pending : tab === "applied" ? applied : declined;

  // Grouped by thread: the unit a reviewer actually thinks in is "what did
  // Helix do in this piece of work", not a flat chronological list.
  const threads = useMemo(() => {
    const map = new Map<string, { title: string; rows: ActionRow[] }>();
    for (const action of visible) {
      const entry = map.get(action.threadId) ?? {
        title: action.threadTitle,
        rows: [],
      };
      entry.rows.push(action);
      map.set(action.threadId, entry);
    }
    for (const entry of map.values()) {
      entry.rows.sort((a, b) => a.sequence - b.sequence);
    }
    return [...map.entries()].map(([id, entry]) => ({ id, ...entry }));
  }, [visible]);

  const decide = useCallback(
    async (
      decision: "approve" | "reject" | "retry",
      payload: { actionIds?: string[]; threadId?: string }
    ) => {
      setBusy(true);
      setError(null);
      try {
        const response = await fetch("/api/helix/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, ...payload }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "That did not apply.");
        if (data.failed?.length) {
          setError(
            `${data.failed.length} could not be applied: ${data.failed[0].error}`
          );
        }
        setSelected(new Set());
        await load();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "That did not apply."
        );
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const highRisk = pending.filter((a) => a.risk === "high").length;
  const oldest = pending.length
    ? pending.reduce((acc, a) => (a.createdAt < acc ? a.createdAt : acc), pending[0].createdAt)
    : null;

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn(PAGE_RHYTHM, "pb-24")}>
      <div className={cn(READING_COL, "space-y-8")}>
        <CrmPageHeader
          section="Helix."
          title="Approvals"
          subtitle={subtitleFor(pending.length, highRisk)}
        />

        {actions === null ? (
          <StatStripSkeleton columns={3} />
        ) : (
          <StatStrip columns={3} ariaLabel="Queue">
            <StatCell label="Waiting on you">
              {pending.length === 0 ? (
                <StatEmpty>Nothing queued.</StatEmpty>
              ) : (
                <>
                  <Stat>{pending.length}</Stat>
                  <StatMeta>
                    across {threadCount(pending)} thread
                    {threadCount(pending) === 1 ? "" : "s"}
                  </StatMeta>
                </>
              )}
            </StatCell>
            <StatCell label="Significant">
              {highRisk === 0 ? (
                <StatEmpty>None — all routine.</StatEmpty>
              ) : (
                <>
                  <Stat>{highRisk}</Stat>
                  <StatMeta>read these before bulk-approving</StatMeta>
                </>
              )}
            </StatCell>
            <StatCell label="Oldest waiting">
              {oldest === null ? (
                <StatEmpty>Queue is clear.</StatEmpty>
              ) : (
                <>
                  <Stat>{relativeAge(oldest)}</Stat>
                  <StatMeta>{absoluteDay(oldest)}</StatMeta>
                </>
              )}
            </StatCell>
          </StatStrip>
        )}

        <TabStrip
          tabs={[
            { key: "pending", label: "Waiting", count: pending.length },
            { key: "applied", label: "Applied", count: applied.length },
            {
              key: "declined",
              label: "Declined",
              count: declined.length,
            },
          ]}
          active={tab}
          onChange={(key) => {
            setTab(key as TabKey);
            setSelected(new Set());
          }}
          ariaLabel="Queue state"
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {actions === null ? (
          <QueueSkeleton />
        ) : threads.length === 0 ? (
          <EmptyQueue tab={tab} />
        ) : (
          <div className="space-y-10">
            {threads.map((thread) => (
              <section key={thread.id} className="space-y-3">
                <SectionHead
                  title={thread.title}
                  meta={
                    tab === "pending" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          decide("approve", { threadId: thread.id })
                        }
                        className={cn(GHOST_PILL, busy && "opacity-50")}
                      >
                        Approve all {thread.rows.length}
                      </button>
                    ) : thread.rows.some((row) => row.status === "failed") ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => decide("retry", { threadId: thread.id })}
                        className={cn(GHOST_PILL, busy && "opacity-50")}
                      >
                        Retry failures
                      </button>
                    ) : (
                      `${thread.rows.length} change${thread.rows.length === 1 ? "" : "s"}`
                    )
                  }
                />
                <ul className="divide-y divide-border/60">
                  {thread.rows.map((action, index) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      index={index}
                      selectable={tab === "pending"}
                      selected={selected.has(action.id)}
                      onToggle={() => toggle(action.id)}
                      busy={busy}
                      onDecide={(decision) =>
                        decide(decision, { actionIds: [action.id] })
                      }
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: EASE_APPLE }}
            className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
          >
            <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/95 px-4 py-2 shadow-sm backdrop-blur">
              <span className="text-xs tabular-nums text-muted-foreground">
                {selected.size} selected
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  decide("reject", { actionIds: [...selected] })
                }
                className={cn(GHOST_PILL, busy && "opacity-50")}
              >
                Decline
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  decide("approve", { actionIds: [...selected] })
                }
                className={cn(PRIMARY_PILL, busy && "opacity-50")}
              >
                Approve
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionCard({
  action,
  index,
  selectable,
  selected,
  onToggle,
  busy,
  onDecide,
}: {
  action: ActionRow;
  index: number;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
  busy: boolean;
  onDecide: (decision: "approve" | "reject" | "retry") => void;
}) {
  const changes = action.preview?.changes ?? [];
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: EASE_APPLE,
        delay: Math.min(index, 10) * 0.02,
      }}
      className={cn(
        "-mx-2 rounded-md px-2 py-3 transition-colors duration-150",
        selected && "bg-muted/40"
      )}
    >
      <div className="flex items-start gap-3">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select: ${action.summary}`}
            className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer accent-foreground"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {action.summary}
            </span>
            {action.risk !== "low" && (
              <RowPill emphasis={action.risk === "high"}>
                {RISK_LABEL[action.risk]}
              </RowPill>
            )}
            {action.status === "failed" && (
              <RowPill className="border-destructive/40 text-destructive">
                Failed
              </RowPill>
            )}
          </div>

          {changes.length > 0 && (
            <dl className="space-y-1">
              {changes.map((change) => (
                <div
                  key={`${change.label}-${change.after}`}
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
                >
                  <dt className={cn(SECTION_LABEL, "min-w-24")}>
                    {change.label}
                  </dt>
                  <dd className="flex items-baseline gap-2 text-sm">
                    {change.before !== undefined && (
                      <>
                        <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                          {change.before}
                        </span>
                        <span aria-hidden className="text-muted-foreground/50">
                          →
                        </span>
                      </>
                    )}
                    <span className="text-foreground">{change.after}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {action.preview?.note && (
            <p className={CAPTION}>{action.preview.note}</p>
          )}
          {action.error && (
            <p className="text-xs text-destructive">{action.error}</p>
          )}

          <p className={META}>
            {action.op} · {relativeAge(action.createdAt)} ago
            {action.reviewedAt &&
              ` · ${action.status === "executed" ? "approved" : "declined"} by ${
                [action.reviewerFirst, action.reviewerLast]
                  .filter(Boolean)
                  .join(" ") || "a teammate"
              }`}
          </p>
        </div>

        {action.status === "failed" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide("retry")}
            className={cn(GHOST_PILL, "shrink-0", busy && "opacity-50")}
          >
            Try again
          </button>
        )}

        {action.status === "simulated" && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide("reject")}
              className={cn(GHOST_PILL, busy && "opacity-50")}
            >
              Decline
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecide("approve")}
              className={cn(PRIMARY_PILL, busy && "opacity-50")}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </motion.li>
  );
}

function EmptyQueue({ tab }: { tab: TabKey }) {
  const copy =
    tab === "pending"
      ? "Nothing is waiting. When Helix changes something, it lands here first."
      : tab === "applied"
        ? "Nothing has been approved yet."
        : "Nothing has been declined, and nothing has failed.";
  return (
    <Reveal variant="fade">
      <p className={cn(BODY_MUTED, "py-10")}>{copy}</p>
    </Reveal>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 py-3">
          <div className="h-3.5 w-2/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

function subtitleFor(pending: number, highRisk: number): string {
  if (pending === 0) return "Nothing waiting — Helix is up to date with you.";
  const base = `${pending} change${pending === 1 ? "" : "s"} waiting`;
  return highRisk > 0
    ? `${base}, ${highRisk} of them significant.`
    : `${base}, all routine.`;
}

function threadCount(rows: ActionRow[]): number {
  return new Set(rows.map((row) => row.threadId)).size;
}

function relativeAge(iso: string): string {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  );
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function absoluteDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
