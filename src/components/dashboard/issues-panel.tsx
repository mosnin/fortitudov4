"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Issue = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  resolution: string | null;
  createdAt: string;
};

const SEVERITY_TONE: Record<string, string> = {
  critical: "text-destructive",
  high: "text-warning",
  medium: "text-orange",
  low: "text-muted-foreground",
};
const STATUS_GLYPH: Record<string, string> = {
  open: "●",
  in_progress: "◐",
  resolved: "○",
  closed: "○",
};
const inputCls =
  "h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

export function IssuesPanel({ projectId, staff }: { projectId: string; staff: boolean }) {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/issues`);
      const data = await res.json().catch(() => null);
      setIssues(Array.isArray(data) ? data : []);
    } catch {
      setIssues([]);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function raise() {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, severity }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error("Couldn't raise the issue", data?.error);
        return;
      }
      toast.success("Issue raised", "The studio has been notified.");
      setTitle("");
      setDescription("");
      setSeverity("medium");
      load();
    } catch {
      toast.error("Couldn't raise the issue", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, okMsg?: string) {
    setRowBusy(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error("Update failed", data?.error);
        return;
      }
      if (okMsg) toast.success(okMsg);
      load();
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Raise */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Raise an issue</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Hit a problem with the build? Flag it and the studio takes it from there.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className={inputCls}
            placeholder="What's wrong? (short title)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && raise()}
          />
          <select className={`${inputCls} sm:w-36`} value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="More detail (optional)"
          className="mt-2 w-full resize-y rounded-xl border border-border/60 bg-background/40 p-3 text-sm focus:border-orange/50 focus:outline-none"
        />
        <button
          onClick={raise}
          disabled={busy || !title.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-dark disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Raise issue
        </button>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 pb-2 pt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Issues</span>
          <span className="h-px flex-1 bg-border/60" />
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
            {issues ? issues.length.toString().padStart(2, "0") : "··"}
          </span>
        </div>

        {issues === null ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
          </div>
        ) : issues.length === 0 ? (
          <p className="px-5 py-10 text-center font-mono text-sm text-muted-foreground">~ no issues ~</p>
        ) : (
          issues.map((it) => {
            const resolved = it.status === "resolved" || it.status === "closed";
            return (
              <div key={it.id} className="border-t border-border/40 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn("mt-0.5 font-mono text-xs", resolved ? "text-success" : SEVERITY_TONE[it.severity] ?? "text-orange")}
                    aria-hidden
                  >
                    {STATUS_GLYPH[it.status] ?? "●"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", resolved && "text-foreground/70")}>{it.title}</p>
                    {it.description && <p className="mt-0.5 text-xs text-muted-foreground">{it.description}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                      <span className={SEVERITY_TONE[it.severity] ?? "text-muted-foreground"}>{it.severity}</span>
                      <span className="text-muted-foreground/60">· {it.status.replace("_", " ")}</span>
                    </p>
                    {it.resolution && (
                      <p className="mt-1.5 rounded-lg border border-success/30 bg-success/5 px-2.5 py-1.5 text-xs text-foreground/80">
                        <span className="font-medium text-success">Resolved:</span> {it.resolution}
                      </p>
                    )}
                  </div>
                  {rowBusy === it.id && <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                </div>

                {/* Staff triage */}
                {staff && !resolved && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-6">
                    <select
                      value={it.status}
                      disabled={rowBusy === it.id}
                      onChange={(e) => patch(it.id, { status: e.target.value })}
                      className="h-8 rounded-full border border-border/60 bg-background/40 px-2 font-mono text-xs focus:outline-none"
                    >
                      <option value="open">open</option>
                      <option value="in_progress">in progress</option>
                      <option value="closed">closed</option>
                    </select>
                    <input
                      value={resolutions[it.id] ?? ""}
                      onChange={(e) => setResolutions((r) => ({ ...r, [it.id]: e.target.value }))}
                      placeholder="Resolution note…"
                      className="h-8 min-w-0 flex-1 rounded-full border border-border/60 bg-background/40 px-3 text-xs focus:border-orange/50 focus:outline-none"
                    />
                    <button
                      onClick={() => patch(it.id, { status: "resolved", resolution: resolutions[it.id]?.trim() || null }, "Issue resolved")}
                      disabled={rowBusy === it.id}
                      className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/25 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
