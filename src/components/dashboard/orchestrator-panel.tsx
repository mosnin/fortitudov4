"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

type DraftedTask = { taskId: string; title: string; preview: string };

/**
 * Admin control surface for the supervised execution orchestrator. The agent
 * drafts the work for ready tasks and lands every draft in human review — it
 * never auto-approves. Human-in-the-loop is always preserved.
 */
export function OrchestratorPanel({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState<null | "one" | "all">(null);

  async function run(all: boolean) {
    if (running) return;
    setRunning(all ? "all" : "one");
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 503) {
        toast.error("Agent unavailable", "No OpenAI API key is configured for this environment.");
        return;
      }
      if (!res.ok) {
        throw new Error(data?.error ?? "Orchestration failed.");
      }

      const drafted: DraftedTask[] = Array.isArray(data?.drafted) ? data.drafted : [];
      const message: string = data?.message ?? "Done.";

      if (drafted.length === 0) {
        toast.info("Nothing to draft", message);
      } else {
        const detail = drafted
          .slice(0, 5)
          .map((d) => `• ${d.title} — ${d.preview}${d.preview.length >= 140 ? "…" : ""}`)
          .join("\n");
        toast.success(message, detail);
      }
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Orchestration failed.";
      toast.error("Couldn't run the agent", m);
    } finally {
      setRunning(null);
    }
  }

  const busy = running !== null;

  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Execution agent</p>
      <h3 className="mt-2 text-lg font-semibold">Draft ready work for review</h3>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        The agent picks a ready task, drafts the actual deliverable against its acceptance
        criteria, and submits it for review. Every draft waits for a human to approve or
        revise — nothing ships on its own.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => run(false)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
        >
          {running === "one" && <Loader2 className="h-4 w-4 animate-spin" />}
          {running === "one" ? "Drafting…" : "Run on next ready task"}
        </button>
        <button
          onClick={() => run(true)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:opacity-50"
        >
          {running === "all" && <Loader2 className="h-4 w-4 animate-spin" />}
          {running === "all" ? "Drafting…" : "Run on all ready"}
        </button>
      </div>
    </section>
  );
}
