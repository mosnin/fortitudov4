"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

export type TaskRow = {
  id: string;
  title: string;
  status: string;
  assigneeId: string | null;
  phaseId: string | null;
};

const statusOrder = ["todo", "in_progress", "done"] as const;
const statusLabel: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
const statusCls: Record<string, string> = {
  todo: "border-border/60 bg-background/40 text-muted-foreground",
  in_progress: "border-orange/30 bg-orange/10 text-orange",
  done: "border-success/30 bg-success/10 text-success",
};

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

  const nameFor = (id: string | null) => staff.find((s) => s.id === id)?.name ?? "Unassigned";

  async function add() {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          assigneeId: assigneeId || null,
          phaseId: phaseId || null,
        }),
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

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function cycle(status: string) {
    const i = statusOrder.indexOf(status as (typeof statusOrder)[number]);
    return statusOrder[(i + 1) % statusOrder.length];
  }

  const inputCls =
    "h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Tasks</h3>

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
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className={`${inputCls} sm:w-40`} value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
          <option value="">No phase</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
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

      {/* List */}
      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{nameFor(t.assigneeId)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => patch(t.id, { status: cycle(t.status) })}
                  disabled={busy}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusCls[t.status]}`}
                  title="Advance status"
                >
                  {statusLabel[t.status] ?? t.status}
                </button>
                <select
                  value={t.assigneeId ?? ""}
                  disabled={busy}
                  onChange={(e) => patch(t.id, { assigneeId: e.target.value || null })}
                  className="h-8 rounded-full border border-border/60 bg-background/40 px-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(t.id)}
                  disabled={busy}
                  className="inline-flex items-center rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
