"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Lock, Loader2, ArrowUp } from "lucide-react";

type MyTask = {
  id: string;
  title: string;
  status: string;
  projectId: string;
  projectName: string;
  ready: boolean;
  blockedBy: string[];
};

export function MyTasks({ tasks }: { tasks: MyTask[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [submitFor, setSubmitFor] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [artifact, setArtifact] = useState("");

  async function start(t: MyTask) {
    setBusy(t.id);
    try {
      await fetch(`/api/admin/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function submit(id: string) {
    if (!summary.trim()) return;
    setBusy(id);
    try {
      await fetch(`/api/tasks/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summary.trim(), artifactUrl: artifact.trim() || undefined }),
      });
      setSubmitFor(null);
      setSummary("");
      setArtifact("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/60 p-10 text-center backdrop-blur-xl">
        <p className="font-brand text-lg">No tasks assigned</p>
        <p className="mt-1 text-sm text-muted-foreground">Work assigned to you will show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
      {tasks.map((t) => {
        const blocked = t.status === "todo" && !t.ready;
        return (
          <div key={t.id} className="border-b border-border/40 px-5 py-4 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <Link href={`/admin/projects/${t.projectId}`} className="text-xs text-muted-foreground hover:text-orange">
                  {t.projectName}
                </Link>
                {blocked && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-warning">
                    <Lock className="h-3 w-3" /> blocked by {t.blockedBy.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {t.status === "todo" && (
                  <button
                    onClick={() => start(t)}
                    disabled={busy === t.id || blocked}
                    className="inline-flex items-center gap-1 rounded-full border border-orange/40 px-3 py-1.5 text-xs text-orange hover:bg-orange/10 disabled:opacity-40"
                  >
                    {busy === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />} Start
                  </button>
                )}
                {t.status === "in_progress" && (
                  <button
                    onClick={() => setSubmitFor(submitFor === t.id ? null : t.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-orange px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-dark"
                  >
                    <ArrowUp className="h-3 w-3" /> Submit
                  </button>
                )}
                {t.status === "in_review" && (
                  <span className="rounded-full border border-orange/30 bg-orange/10 px-3 py-1.5 text-xs text-orange">
                    Awaiting review
                  </span>
                )}
              </div>
            </div>

            {submitFor === t.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What did you do? (summary for review)"
                  className="w-full resize-y rounded-xl border border-border/60 bg-background/40 p-2.5 text-sm focus:border-orange/50 focus:outline-none"
                />
                <input
                  value={artifact}
                  onChange={(e) => setArtifact(e.target.value)}
                  placeholder="Artifact URL (optional)"
                  className="h-9 w-full rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none"
                />
                <button
                  onClick={() => submit(t.id)}
                  disabled={busy === t.id || !summary.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-dark disabled:opacity-50"
                >
                  {busy === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
                  Submit for review
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
