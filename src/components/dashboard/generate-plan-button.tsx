"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

/** Admin action: (re)generate the AI build plan for a project from its Blueprint. */
export function GeneratePlanButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Full decomposition: phases + the task DAG (supersedes phase-only planning).
      const res = await fetch(`/api/admin/projects/${projectId}/decompose`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate plan.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={generate}
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
