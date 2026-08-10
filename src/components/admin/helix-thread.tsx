"use client";

/**
 * A Helix thread.
 *
 * Two halves, and the split is the point: the transcript on the left is the
 * work, the introductions rail on the right is everything Helix is allowed to
 * touch while doing it. A thread starts with an empty rail, and the rail is
 * always visible — capability should never be something you have to go
 * looking for.
 *
 * Queued changes render inline under the turn that proposed them, so the ask
 * and the change read together. Approving happens in the queue, not here.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { CrmPageHeader, RowPill, SectionHead } from "@/components/crm";
import { Reveal } from "@/components/motion";
import { Textarea } from "@/components/ui/textarea";
import { EASE_APPLE } from "@/lib/motion";
import {
  BODY_MUTED,
  CAPTION,
  HELIX_PILL,
  META,
  QUIET_LINK,
  SECTION_LABEL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";
import { IntroducePicker } from "./helix-introduce-picker";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking: string | null;
  sequence: number;
  createdAt: string;
}

interface Introduction {
  id: string;
  resourceKind: string;
  resourceId: string;
  resourceLabel: string;
  status: "granted" | "requested" | "denied" | "revoked";
  allowWrites: boolean;
  requestReason: string | null;
}

interface QueuedAction {
  id: string;
  messageId: string | null;
  summary: string;
  risk: "low" | "medium" | "high";
  status: "simulated" | "approved" | "executed" | "rejected" | "failed";
  sequence: number;
}

interface ThreadPayload {
  thread: { id: string; title: string; standing: string | null };
  messages: Message[];
  introductions: Introduction[];
  actions: QueuedAction[];
  live: boolean;
}

const RISK_LABEL = { low: "Routine", medium: "Notable", high: "Significant" };

export function HelixThread({ threadId }: { threadId: string }) {
  const [data, setData] = useState<ThreadPayload | null>(null);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/helix/threads/${threadId}`);
    if (!response.ok) {
      setError("Could not load that thread.");
      return;
    }
    setData((await response.json()) as ThreadPayload);
  }, [threadId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.messages.length, thinking]);

  const send = useCallback(async () => {
    const message = draft.trim();
    if (!message || thinking) return;
    setDraft("");
    setThinking(true);
    setError(null);
    try {
      const response = await fetch(`/api/helix/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "That turn failed.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That turn failed.");
      setDraft(message);
    } finally {
      setThinking(false);
    }
  }, [draft, thinking, threadId, load]);

  const revoke = useCallback(
    async (introductionId: string) => {
      await fetch(
        `/api/helix/threads/${threadId}/introductions?introductionId=${introductionId}`,
        { method: "DELETE" }
      );
      await load();
    },
    [threadId, load]
  );

  const actionsByMessage = useMemo(() => {
    const map = new Map<string, QueuedAction[]>();
    for (const action of data?.actions ?? []) {
      if (!action.messageId) continue;
      const list = map.get(action.messageId) ?? [];
      list.push(action);
      map.set(action.messageId, list);
    }
    return map;
  }, [data?.actions]);

  const granted = (data?.introductions ?? []).filter(
    (intro) => intro.status === "granted"
  );
  const requested = (data?.introductions ?? []).filter(
    (intro) => intro.status === "requested"
  );
  const pendingCount = (data?.actions ?? []).filter(
    (action) => action.status === "simulated"
  ).length;

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <CrmPageHeader
          section="Helix."
          title={data?.thread.title ?? "Thread"}
          subtitle={
            pendingCount > 0 ? (
              <>
                {pendingCount} change{pendingCount === 1 ? "" : "s"} queued —{" "}
                <Link href="/admin/helix/approvals" className={QUIET_LINK}>
                  review them
                </Link>
                .
              </>
            ) : granted.length === 0 ? (
              "Introduced to nothing yet. Give it something to work on."
            ) : (
              `Working with ${granted.length} resource${granted.length === 1 ? "" : "s"}.`
            )
          }
        />

        {data && !data.live && (
          <Reveal variant="fade">
            <p
              className={cn(
                CAPTION,
                "rounded-md border border-border/60 bg-muted/30 px-3 py-2"
              )}
            >
              No model key is configured, so this thread is driven by a small
              rule-based planner. Access checks, simulation and the approval
              queue are the real ones — the conversation is not.
            </p>
          </Reveal>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          {/* Transcript */}
          <div className="min-w-0 space-y-6">
            {data === null ? (
              <TranscriptSkeleton />
            ) : data.messages.length === 0 ? (
              <p className={cn(BODY_MUTED, "py-8")}>
                Ask Helix for something. It can read and change whatever you
                introduce it to, and every change it makes waits for your
                approval.
              </p>
            ) : (
              <ul className="space-y-6">
                {data.messages.map((message) => (
                  <Turn
                    key={message.id}
                    message={message}
                    actions={actionsByMessage.get(message.id) ?? []}
                  />
                ))}
              </ul>
            )}

            <AnimatePresence>
              {thinking && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(CAPTION, "animate-pulse")}
                >
                  Helix is working…
                </motion.p>
              )}
            </AnimatePresence>

            <div ref={endRef} />

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask Helix to do something…"
                rows={3}
                className="resize-none border-border/70"
                disabled={thinking}
              />
              <div className="flex items-center justify-between">
                <span className={META}>⌘↵ to send</span>
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={thinking || draft.trim().length === 0}
                  className={cn(
                    HELIX_PILL,
                    (thinking || draft.trim().length === 0) && "opacity-40"
                  )}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Introductions rail */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="space-y-3">
              <SectionHead
                title="Can see"
                meta={
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className={QUIET_LINK}
                  >
                    Introduce
                  </button>
                }
              />
              {granted.length === 0 ? (
                <p className={CAPTION}>
                  Nothing. Helix cannot read or change anything until you
                  introduce it.
                </p>
              ) : (
                <ul className="space-y-2">
                  {granted.map((intro) => (
                    <li
                      key={intro.id}
                      className="group/grant flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-foreground">
                          {intro.resourceLabel}
                        </p>
                        <p className={META}>
                          {intro.resourceKind}
                          {intro.allowWrites ? "" : " · read-only"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void revoke(intro.id)}
                        aria-label={`Revoke access to ${intro.resourceLabel}`}
                        title="Revoke"
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:opacity-0 lg:group-hover/grant:opacity-100"
                      >
                        <X size={13} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {requested.length > 0 && (
              <div className="space-y-3">
                <SectionHead title="Asked for" />
                <ul className="space-y-2">
                  {requested.map((intro) => (
                    <li key={intro.id} className="space-y-1">
                      <p className="text-[13px] text-foreground">
                        {intro.resourceLabel}
                      </p>
                      {intro.requestReason && (
                        <p className={CAPTION}>{intro.requestReason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      {picking && (
        <IntroducePicker
          threadId={threadId}
          onClose={() => setPicking(false)}
          onGranted={async () => {
            setPicking(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function Turn({
  message,
  actions,
}: {
  message: Message;
  actions: QueuedAction[];
}) {
  const isUser = message.role === "user";
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE_APPLE }}
      className="space-y-2"
    >
      <p className={SECTION_LABEL}>{isUser ? "You" : "Helix"}</p>
      <div
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "text-foreground" : "text-foreground/90"
        )}
      >
        {message.content}
      </div>

      {actions.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-l-2 border-border/70 pl-3">
          {actions.map((action) => (
            <li key={action.id} className="flex items-center gap-2">
              <span className="text-[13px] text-foreground">
                {action.summary}
              </span>
              <RowPill emphasis={action.status === "executed"}>
                {action.status === "simulated"
                  ? "Queued"
                  : action.status === "executed"
                    ? "Applied"
                    : action.status === "rejected"
                      ? "Declined"
                      : action.status === "failed"
                        ? "Failed"
                        : "Approved"}
              </RowPill>
              {action.risk !== "low" && action.status === "simulated" && (
                <span className={META}>{RISK_LABEL[action.risk]}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  );
}

function TranscriptSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted/70" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
