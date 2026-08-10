"use client";

/**
 * The thread index.
 *
 * Threads are the unit of work, and each one carries its own access, so the
 * list leads with what a person needs to pick one back up: what it was about,
 * and whether it left anything waiting for them.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
} from "@/components/crm";
import { Reveal } from "@/components/motion";
import { BODY_MUTED, GHOST_PILL, HELIX_PILL, META } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface ThreadRow {
  id: string;
  title: string;
  standing: string | null;
  lastMessageAt: string;
  pending: number;
}

export function HelixThreadList() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadRow[] | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async (archived: boolean) => {
    const response = await fetch(
      `/api/helix/threads${archived ? "?archived=1" : ""}`
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { threads: ThreadRow[] };
    return data.threads;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rows = await fetchThreads(showArchived);
      if (cancelled) return;
      if (rows === null) {
        setError("Could not load your threads.");
        setThreads([]);
        return;
      }
      setError(null);
      setThreads(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [showArchived, fetchThreads]);

  const open = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/helix/threads", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Could not open one.");
      router.push(`/admin/helix/${body.thread.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not open a thread."
      );
      setCreating(false);
    }
  }, [router]);

  const waiting = (threads ?? []).reduce(
    (total, thread) => total + thread.pending,
    0
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <CrmPageHeader
          section="Helix."
          title="Threads"
          subtitle={
            threads === null
              ? undefined
              : showArchived
                ? threads.length === 0
                  ? "Nothing archived yet."
                  : `${threads.length} archived. Their record and reasoning are kept.`
                : threads.length === 0
                  ? "Nothing open. Start a thread and hand Helix something to work on."
                  : waiting > 0
                    ? `${threads.length} open, ${waiting} change${waiting === 1 ? "" : "s"} waiting on you.`
                    : `${threads.length} open, nothing waiting.`
          }
          action={
            <>
              <button
                type="button"
                onClick={() => {
                  setThreads(null);
                  setShowArchived((current) => !current);
                }}
                className={GHOST_PILL}
              >
                {showArchived ? "Active" : "Archived"}
              </button>
              {!showArchived && (
                <button
                  type="button"
                  onClick={() => void open()}
                  disabled={creating}
                  className={cn(HELIX_PILL, creating && "opacity-50")}
                >
                  New thread
                </button>
              )}
            </>
          }
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {threads === null ? (
          <RecordListSkeleton rows={4} />
        ) : threads.length === 0 ? (
          <Reveal variant="fade">
            <p className={cn(BODY_MUTED, "py-10")}>
              {showArchived
                ? "Archived threads keep their transcript and their audit trail — nothing here yet."
                : "A thread starts with access to nothing. You introduce it to a client or a project, ask for what you need, and review whatever it changes."}
            </p>
          </Reveal>
        ) : (
          <RecordList>
            {threads.map((thread, index) => (
              <RecordRow
                key={thread.id}
                index={index}
                href={`/admin/helix/${thread.id}`}
                primary={thread.title}
                status={
                  thread.pending > 0 ? (
                    <RowPill emphasis>
                      {thread.pending} queued
                    </RowPill>
                  ) : undefined
                }
                secondary={thread.standing ?? undefined}
                meta={
                  <span className={META}>{relativeAge(thread.lastMessageAt)}</span>
                }
              />
            ))}
          </RecordList>
        )}
      </div>
    </div>
  );
}

function relativeAge(iso: string): string {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
