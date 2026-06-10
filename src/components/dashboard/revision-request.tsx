"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Client asks for a change on the build. */
export function RevisionRequest({ projectId }: { projectId: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, description: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error("Couldn't submit", data?.error);
        return;
      }
      toast.success("Revision requested", "Your architect will pick it up.");
      setText("");
    } catch {
      toast.error("Couldn't submit", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Request a revision</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Something you&apos;d like changed? Describe it and the studio takes it from there.
      </p>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what you'd like changed…"
        className="mt-4 w-full resize-y rounded-2xl border border-border/60 bg-background/40 p-3 text-sm focus:border-orange/50 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={busy || !text.trim()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        Submit request
      </button>
    </div>
  );
}
