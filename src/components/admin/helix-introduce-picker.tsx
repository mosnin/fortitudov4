"use client";

/**
 * The introduction picker.
 *
 * Granting access is the one moment where a person decides how much of the
 * business Helix can touch, so the choice is explicit: pick the resource, and
 * choose whether it may change it or only read it. Read-only is a real state,
 * not a formality — a read-only grant refuses writes outright rather than
 * queueing them for approval.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  H3,
  META,
  PRIMARY_PILL,
  SECTION_LABEL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

interface ResourceRef {
  kind: string;
  id: string;
  label: string;
  detail?: string;
}

interface Group {
  kind: string;
  label: string;
  results: ResourceRef[];
}

export function IntroducePicker({
  threadId,
  answering,
  onClose,
  onGranted,
}: {
  threadId: string;
  /**
   * Set when this is answering a request Helix made rather than a fresh
   * introduction. The request supplies a hint and a reason, but never the
   * resource — picking that is the decision being asked for.
   */
  answering?: {
    introductionId: string;
    resourceKind: string;
    hint: string;
    reason: string | null;
  };
  onClose: () => void;
  onGranted: () => void | Promise<void>;
}) {
  const [query, setQuery] = useState(answering?.hint ?? "");
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [chosen, setChosen] = useState<ResourceRef | null>(null);
  const [allowWrites, setAllowWrites] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ threadId, q: query });
        if (answering) params.set("kind", answering.resourceKind);
        const response = await fetch(`/api/helix/resources?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { groups: Group[] };
        setGroups(data.groups);
      } catch {
        if (!controller.signal.aborted) setGroups([]);
      }
    }, 180);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [threadId, query, answering]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const grant = useCallback(async () => {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/helix/threads/${threadId}/introductions`,
        answering
          ? {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                introductionId: answering.introductionId,
                decision: "grant",
                resourceId: chosen.id,
                allowWrites,
              }),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                resourceKind: chosen.kind,
                resourceId: chosen.id,
                allowWrites,
              }),
            }
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Could not grant that.");
      await onGranted();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not grant that."
      );
    } finally {
      setBusy(false);
    }
  }, [chosen, allowWrites, threadId, answering, onGranted]);

  const empty = useMemo(
    () => groups !== null && groups.length === 0,
    [groups]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/20 p-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Introduce a resource"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-border/70 bg-background p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={H3}>
              {answering ? "Helix asked for access" : "Introduce a resource"}
            </h2>
            <p className={cn(BODY_MUTED, "mt-0.5")}>
              {answering
                ? (answering.reason ??
                  "Pick which resource this request refers to.")
                : "Helix can only touch what you hand it, for this thread only."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients and projects…"
            className="h-9 border-border/70 pl-9"
          />
        </div>

        <div className="max-h-72 space-y-4 overflow-y-auto">
          {groups === null ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded bg-muted/60"
                />
              ))}
            </div>
          ) : empty ? (
            <p className={cn(CAPTION, "py-4")}>
              {query
                ? "Nothing matches, or everything that does is already introduced."
                : "Nothing left to introduce to this thread."}
            </p>
          ) : (
            groups!.map((group) => (
              <div key={group.kind} className="space-y-1">
                <p className={SECTION_LABEL}>{group.label}</p>
                <ul className="divide-y divide-border/60">
                  {group.results.map((ref) => {
                    const isChosen =
                      chosen?.id === ref.id && chosen?.kind === ref.kind;
                    return (
                      <li key={`${ref.kind}:${ref.id}`}>
                        <button
                          type="button"
                          onClick={() => setChosen(ref)}
                          className={cn(
                            "-mx-2 flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            isChosen ? "bg-muted/50" : "hover:bg-muted/30"
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-foreground">
                              {ref.label}
                            </span>
                            {ref.detail && (
                              <span className={cn(META, "block truncate")}>
                                {ref.detail}
                              </span>
                            )}
                          </span>
                          {isChosen && (
                            <span className={META}>Selected</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={allowWrites}
              onChange={(event) => setAllowWrites(event.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-foreground"
            />
            <span className="text-xs text-muted-foreground">
              May propose changes
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={GHOST_PILL}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!chosen || busy}
              onClick={() => void grant()}
              className={cn(PRIMARY_PILL, (!chosen || busy) && "opacity-40")}
            >
              Introduce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
