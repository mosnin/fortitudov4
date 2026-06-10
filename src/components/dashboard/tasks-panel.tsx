"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Play, Check, Lock, RotateCcw, FileText } from "lucide-react";
import { toast } from "@/components/ui/toast";

export type TaskRow = {
  id: string;
  title: string;
  status: string;
  assigneeId: string | null;
  phaseId: string | null;
  kind: string;
  estimateHours: number | null;
  ready: boolean;
  blockedBy: string[];
};

const groups: { key: string; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
  { key: "done", label: "Done" },
];

export function TasksPanel({
  projectId,
  tasks,
  staff,
  phases,
}: {
  projectId: string;
  tasks: TaskRow[];
  staff: { id: string; name: string }[];
  phases: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [openDraft, setOpenDraft] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { summary: string; artifactUrl: string | null } | "loading" | "empty">>({});

  async function toggleDraft(id: string) {
    if (openDraft === id) {
      setOpenDraft(null);
      return;
    }
    setOpenDraft(id);
    if (draft[id]) return;
    setDraft((d) => ({ ...d, [id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/tasks/${id}/submissions`);
      const data = await res.json().catch(() => null);
      const latest = Array.isArray(data) ? data[0] : null;
      setDraft((d) => ({ ...d, [id]: latest?.summary ? { summary: latest.summary, artifactUrl: latest.artifactUrl ?? null } : "empty" }));
    } catch {
      setDraft((d) => ({ ...d, [id]: "empty" }));
    }
  }

  const nameFor = (id: string | null) => staff.find((s) => s.id === id)?.name ?? "Unassigned";
  const done = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  async function add() {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), assigneeId: assigneeId || null, phaseId: phaseId || null }),
      });
      setTitle("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function review(id: string, action: "approve" | "changes") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tasks/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error("Review failed", data?.error);
        return;
      }
      if (action === "approve") {
        toast.success("Task approved");
      } else if (data?.autoRevised) {
        toast.success("Changes requested", "The agent read your notes and redrafted it for review.");
      } else {
        toast.success("Changes requested");
      }
      router.refresh();
    } catch {
      toast.error("Review failed", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Tasks</h3>
        <span className="text-xs tabular-nums text-muted-foreground">
          {done}/{tasks.length} · {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
        <div className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400" style={{ width: `${pct}%` }} />
      </div>

      {/* Create */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          className={inputCls}
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <select className={`${inputCls} sm:w-40`} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Unassigned</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select className={`${inputCls} sm:w-40`} value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
          <option value="">No phase</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={busy || !title.trim()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white hover:bg-orange-dark disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </div>

      {/* Board */}
      <div className="mt-5 space-y-5">
        {tasks.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tasks yet — generate the build plan to populate the graph.
          </p>
        )}
        {groups.map((g) => {
          const items = tasks.filter((t) => t.status === g.key);
          if (items.length === 0) return null;
          return (
            <div key={g.key}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {g.label} · {items.length}
              </p>
              <div className="mt-2 space-y-2">
                {items.map((t) => {
                  const blocked = t.status === "todo" && !t.ready;
                  return (
                    <div key={t.id} className="rounded-2xl border border-border/40 bg-background/40 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{t.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <span className="uppercase tracking-wide text-orange/70">{t.kind}</span>
                            {t.estimateHours ? <span>· {t.estimateHours}h</span> : null}
                            <span>· {nameFor(t.assigneeId)}</span>
                          </p>
                          {blocked && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-warning">
                              <Lock className="h-3 w-3" /> blocked by {t.blockedBy.join(", ")}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => remove(t.id)}
                          disabled={busy}
                          className="shrink-0 rounded-full border border-border/60 p-1.5 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <select
                          value={t.assigneeId ?? ""}
                          disabled={busy}
                          onChange={(e) => patch(t.id, { assigneeId: e.target.value || null })}
                          className="h-8 rounded-full border border-border/60 bg-background/40 px-2 text-xs focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {staff.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        {t.status === "todo" && (
                          <button
                            onClick={() => patch(t.id, { status: "in_progress" })}
                            disabled={busy || blocked}
                            className="inline-flex items-center gap-1 rounded-full border border-orange/40 px-3 py-1.5 text-xs text-orange hover:bg-orange/10 disabled:opacity-40"
                          >
                            <Play className="h-3 w-3" /> Start
                          </button>
                        )}
                        {t.status === "in_progress" && (
                          <button
                            onClick={() => patch(t.id, { status: "done" })}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-full border border-success/40 px-3 py-1.5 text-xs text-success hover:bg-success/10"
                          >
                            <Check className="h-3 w-3" /> Complete
                          </button>
                        )}
                        {t.status === "in_review" && (
                          <>
                            <button
                              onClick={() => review(t.id, "approve")}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/25"
                            >
                              <Check className="h-3 w-3" /> Approve
                            </button>
                            <button
                              onClick={() => review(t.id, "changes")}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <RotateCcw className="h-3 w-3" /> Changes
                            </button>
                          </>
                        )}
                        {(t.status === "in_review" || t.status === "done") && (
                          <button
                            onClick={() => toggleDraft(t.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="h-3 w-3" /> {openDraft === t.id ? "Hide" : "View"} draft
                          </button>
                        )}
                      </div>

                      {openDraft === t.id && (
                        <div className="mt-3 rounded-2xl border border-border/40 bg-background/40 p-3">
                          {draft[t.id] === "loading" || draft[t.id] === undefined ? (
                            <p className="font-mono text-xs text-muted-foreground">loading…</p>
                          ) : draft[t.id] === "empty" ? (
                            <p className="font-mono text-xs text-muted-foreground">~ no submission yet ~</p>
                          ) : (
                            <>
                              <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80">
                                {(draft[t.id] as { summary: string }).summary}
                              </pre>
                              {(draft[t.id] as { artifactUrl: string | null }).artifactUrl && (
                                <a
                                  href={(draft[t.id] as { artifactUrl: string }).artifactUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-block text-xs text-orange hover:underline"
                                >
                                  Open artifact ↗
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
