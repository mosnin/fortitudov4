"use client";

/**
 * "Ask Helix" from wherever the work already is.
 *
 * Opens a thread already introduced to the thing you were looking at. The
 * introduction is real and recorded — this only removes the step where you
 * re-pick a client you were already on, which is ceremony rather than
 * consent.
 *
 * Rendered as a quiet control, not a feature banner. Helix is part of the
 * product, not a promotion inside it.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GHOST_PILL } from "@/lib/typography";
import { cn } from "@/lib/utils";

export function AskHelix({
  resourceKind,
  resourceId,
  label = "Ask Helix",
  title,
  className,
}: {
  resourceKind: "client" | "project" | "gadget";
  resourceId: string;
  label?: string;
  /** Seeds the thread title so the list reads as work, not "New thread". */
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const open = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/helix/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          introduce: [{ resourceKind, resourceId }],
        }),
      });
      if (!response.ok) {
        setBusy(false);
        return;
      }
      const body = await response.json();
      router.push(`/admin/helix/${body.thread.id}`);
    } catch {
      setBusy(false);
    }
  }, [resourceKind, resourceId, title, router]);

  return (
    <button
      type="button"
      onClick={() => void open()}
      disabled={busy}
      className={cn(GHOST_PILL, busy && "opacity-50", className)}
    >
      {busy ? "Opening…" : label}
    </button>
  );
}

/**
 * The same behaviour without the button, for chrome that supplies its own
 * control — a `RowAction` in a record list, a menu item. Returns `open` and
 * a `busy` flag so the caller can disable while the thread is being created.
 */
export function useAskHelix() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const open = useCallback(
    async (
      resourceKind: "client" | "project" | "gadget",
      resourceId: string,
      title?: string
    ) => {
      setBusy(true);
      try {
        const response = await fetch("/api/helix/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            introduce: [{ resourceKind, resourceId }],
          }),
        });
        if (!response.ok) {
          setBusy(false);
          return;
        }
        const body = await response.json();
        router.push(`/admin/helix/${body.thread.id}`);
      } catch {
        setBusy(false);
      }
    },
    [router]
  );

  return { open, busy };
}
