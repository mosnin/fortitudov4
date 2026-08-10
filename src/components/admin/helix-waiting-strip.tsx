"use client";

/**
 * "Helix is waiting on you" — the overview's one Helix line.
 *
 * The approval queue only works if people know it has something in it. This
 * puts that fact on the page they open first, and then gets out of the way:
 * when nothing is queued it renders nothing at all rather than an empty state
 * congratulating you. A permanent widget that usually says "0" trains people
 * to stop reading it, which is exactly the failure mode the queue cannot
 * afford.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { CAPTION, QUIET_LINK } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface ActionRow {
  id: string;
  status: string;
  risk: "low" | "medium" | "high";
  summary: string;
  threadTitle: string;
}

export function HelixWaitingStrip() {
  const [pending, setPending] = useState<ActionRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/helix/approvals");
      if (!response.ok) return;
      const data = (await response.json()) as { actions: ActionRow[] };
      if (cancelled) return;
      setPending(data.actions.filter((a) => a.status === "simulated"));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing queued, or not loaded yet: render nothing.
  if (!pending || pending.length === 0) return null;

  const significant = pending.filter((a) => a.risk === "high").length;

  return (
    <Reveal variant="fade">
      <div className="flex flex-wrap items-baseline justify-between gap-3 rounded-lg border border-border/60 bg-muted/25 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-foreground">
            Helix has {pending.length} change{pending.length === 1 ? "" : "s"}{" "}
            waiting for you
            {significant > 0 &&
              `, ${significant} of them significant`}
            .
          </p>
          <p className={cn(CAPTION, "truncate")}>
            Most recent: {pending[0].summary}
          </p>
        </div>
        <Link href="/admin/helix/approvals" className={QUIET_LINK}>
          Review
        </Link>
      </div>
    </Reveal>
  );
}
