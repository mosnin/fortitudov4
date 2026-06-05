"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Admin action: (re)generate the AI build plan for a project from its Blueprint. */
export function GeneratePlanButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(force = false) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Full decomposition: phases + the task DAG (supersedes phase-only planning).
      const res = await fetch(`/api/admin/projects/${projectId}/decompose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        // Started work would be wiped — confirm before forcing a replace.
        if (res.status === 409 && data?.needsForce) {
          if (window.confirm(`${data.error}\n\nReplace the existing plan anyway?`)) {
            setLoading(false);
            return generate(true);
          }
          return;
        }
        throw new Error(data?.error ?? "Failed to generate plan.");
      }
      toast.success(
        "Build plan ready",
        data?.phases != null ? `${data.phases} phases · ${data.tasks} tasks` : undefined
      );
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate plan.";
      setError(message);
      toast.error("Couldn't generate the plan", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => generate(false)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Planning…" : "Generate build plan"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
