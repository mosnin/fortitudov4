"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  url: string | null;
  status: string;
};

const statusMeta: Record<string, { label: string; cls: string }> = {
  pending: { label: "Awaiting review", cls: "border-border/60 bg-background/40 text-muted-foreground" },
  approved: { label: "Approved", cls: "border-success/30 bg-success/10 text-success" },
  changes_requested: { label: "Changes requested", cls: "border-orange/30 bg-orange/10 text-orange" },
};

export function DeliverableReview({ id, title, url, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const meta = statusMeta[status] ?? statusMeta.pending;

  async function review(action: "approve" | "request_changes") {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/deliverables/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note.trim() || undefined }),
      });
      setAsking(false);
      setNote("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-border/60 bg-background/40 p-3">
      <div className="flex items-center justify-between gap-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 text-sm font-medium text-orange hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{title}</span>
          </a>
        ) : (
          <span className="truncate text-sm font-medium">{title}</span>
        )}
        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium",
            meta.cls
          )}
        >
          {meta.label}
        </span>
      </div>

      {status === "pending" && (
        <div className="mt-3">
          {asking ? (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What needs changing?"
                className="w-full resize-none rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm focus:border-orange/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => review("request_changes")}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-1.5 text-sm font-medium text-white hover:bg-orange-dark disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  Send request
                </button>
                <button
                  onClick={() => setAsking(false)}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => review("approve")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3.5 py-1.5 text-sm font-medium text-success hover:bg-success/20 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                onClick={() => setAsking(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Request changes
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
