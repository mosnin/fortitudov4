"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SegmentedTabs, PageHero } from "@/components/ui/firecrawl";
import { SearchPill, SelectPill, SortPill } from "@/components/ui/filters";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ClientDetailModal } from "@/components/admin/crm-client-detail-modal";
import {
  CRM_STAGES,
  PRIORITY_LABELS,
  STAGE_LABELS,
  type CrmStage,
  type TaskPriority,
} from "@/lib/crm";
import { rowCascade, rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  H1,
  H3,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  SECTION_LABEL,
  TITLE_FONT,
} from "@/lib/typography";
import { X } from "lucide-react";

interface TaskRow {
  id: string;
  clientId: string;
  title: string;
  stage: CrmStage | null;
  status: "pending" | "in_progress" | "completed";
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  companyName: string | null;
  clientStatus: string | null;
}

interface Feed {
  tasks: TaskRow[];
  clients: { id: string; companyName: string; status: string }[];
  staff: { id: string; name: string }[];
}

/** Delivery stages double as the top-level cut of the checklist. Custom
 * (unstaged) tasks only appear under "All Stages". */
const ALL_STAGES_TAB = "All Stages";
const STAGE_TABS = [ALL_STAGES_TAB, ...CRM_STAGES.map((s) => STAGE_LABELS[s])];
const STAGE_BY_TAB = new Map<string, CrmStage>(
  CRM_STAGES.map((s) => [STAGE_LABELS[s], s])
);

const STATUS_OPTIONS = [
  { value: "pending", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

/** The roster carries thousands of checklist tasks — render one page at a
 * time. Everything above ~50 rows makes the table (three form controls per
 * row) janky and stretches the row cascade into a visible crawl. */
const PAGE_SIZE = 25;

/** No realtime channel — refresh the feed on a calm 15s poll instead. */
const POLL_MS = 15_000;

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
const STATUS_RANK: Record<string, number> = {
  in_progress: 0,
  pending: 1,
  completed: 2,
};

export default function AdminTasksPage() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(ALL_STAGES_TAB);
  const [query, setQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("active");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(0);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/client-tasks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Feed | null) => {
        if (data && Array.isArray(data.tasks)) setFeed(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);
  useEffect(() => {
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function patchTask(id: string, patch: Record<string, unknown>) {
    // Optimistic update, with a rollback if the save is rejected. No blanket
    // reload: refetching the whole feed on every dropdown change is what made
    // the table flash between renders.
    const before = feed?.tasks.find((t) => t.id === id);
    setFeed((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          }
        : prev
    );
    try {
      const res = await fetch(`/api/admin/client-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      if (before) {
        setFeed((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) => (t.id === id ? before : t)),
              }
            : prev
        );
      }
    }
  }

  const tasks = useMemo(() => {
    const stage = STAGE_BY_TAB.get(tab);
    const q = query.trim().toLowerCase();
    const rows = (feed?.tasks ?? []).filter((t) => {
      if (stage && t.stage !== stage) return false;
      if (clientFilter !== "all" && t.clientStatus !== clientFilter)
        return false;
      if (assigneeFilter !== "all" && t.assigneeId !== assigneeFilter)
        return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !(t.companyName ?? "").toLowerCase().includes(q) &&
        !(t.assigneeName ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    // "default" keeps the API order (newest client first, checklist order).
    if (sort === "default") return rows;
    return [...rows].sort((a, b) => {
      switch (sort) {
        case "due_soon": {
          // Undated tasks sort last rather than pretending to be urgent.
          if (!a.dueDate) return b.dueDate ? 1 : 0;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case "priority":
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        case "status":
          return STATUS_RANK[a.status] - STATUS_RANK[b.status];
        case "client":
          return (a.companyName ?? "").localeCompare(b.companyName ?? "");
        default:
          return 0;
      }
    });
  }, [
    feed,
    tab,
    query,
    clientFilter,
    assigneeFilter,
    statusFilter,
    priorityFilter,
    sort,
  ]);

  const filtersActive =
    tab !== ALL_STAGES_TAB ||
    query.trim() !== "" ||
    clientFilter !== "active" ||
    assigneeFilter !== "all" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";
  const doneCount = tasks.filter((t) => t.status === "completed").length;

  const pageCount = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = tasks.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );
  // Any filter change starts a new result set — go back to the first page.
  useEffect(() => {
    setPage(0);
  }, [
    tab,
    query,
    clientFilter,
    assigneeFilter,
    statusFilter,
    priorityFilter,
    sort,
  ]);

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <PageHero
        section="Operations"
        title="Tasks"
        description="Manage team tasks across all clients."
        action={
          <button onClick={() => setCreateOpen(true)} className={PRIMARY_PILL}>
            Add Custom Task
          </button>
        }
      />

      {/* Stage tabs + filter row */}
      <div className="space-y-4">
        {/* Eight stage pills overflow a phone — let the strip scroll rather
            than wrap out of the pill track. */}
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <SegmentedTabs
            className="w-max"
            options={STAGE_TABS}
            value={tab}
            onChange={setTab}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchPill
            className="sm:w-64"
            value={query}
            onChange={setQuery}
            placeholder="Search tasks, clients or assignees…"
          />
          <SelectPill
            className="sm:w-44"
            ariaLabel="Assignee"
            value={assigneeFilter}
            onChange={setAssigneeFilter}
            options={[
              { value: "all", label: "All Assignees" },
              ...(feed?.staff ?? []).map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
          <SelectPill
            className="sm:w-40"
            ariaLabel="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS]}
          />
          <SelectPill
            className="sm:w-40"
            ariaLabel="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: "all", label: "All Priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />
          <SelectPill
            className="sm:w-44"
            ariaLabel="Client status"
            value={clientFilter}
            onChange={setClientFilter}
            options={[
              { value: "active", label: "Active clients" },
              { value: "paused", label: "Paused clients" },
              { value: "churned", label: "Churned clients" },
              { value: "all", label: "All clients" },
            ]}
          />
          <SortPill
            className="sm:w-52"
            value={sort}
            onChange={setSort}
            options={[
              { value: "default", label: "Checklist order" },
              { value: "due_soon", label: "Due date: soonest first" },
              { value: "priority", label: "Priority: high → low" },
              { value: "status", label: "Status: in progress first" },
              { value: "client", label: "Client A–Z" },
            ]}
          />
        </div>
      </div>

      {/* Task table — a wide working surface, spans the full frame */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <p className={SECTION_LABEL}>{tasks.length} tasks</p>
          <p className={SECTION_LABEL}>
            {doneCount} of {tasks.length} completed
          </p>
        </div>
        {loading ? (
          <TableSkeleton rows={8} />
        ) : tasks.length === 0 ? (
          <div className="py-14 text-center">
            <h2 className={H3}>
              {filtersActive ? "No matching tasks" : "No tasks yet"}
            </h2>
            <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-md")}>
              {filtersActive
                ? "No tasks match the current filters. This view shows active clients by default — switch to All clients to include paused and churned ones."
                : "Create a client from the Clients page to seed its onboarding checklist, or add a custom task."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Task</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Client</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Assignee</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Due Date</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Priority</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Status</th>
                  <th className={cn(SECTION_LABEL, "py-3 text-right")}>
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody
                key={safePage}
                variants={rowCascade}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border/60"
              >
                {visible.map((t) => (
                  <motion.tr
                    key={t.id}
                    variants={rowItem}
                    className={cn(
                      "group transition-colors hover:bg-muted/30",
                      t.status === "completed" && "opacity-70"
                    )}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {t.title}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {t.companyName ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {t.assigneeName ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="date"
                        aria-label={`Due date for ${t.title}`}
                        className="h-8 w-[9.5rem] rounded-lg border border-transparent bg-transparent px-2 text-xs tabular-nums text-muted-foreground outline-none transition-colors hover:border-border focus:border-foreground/40"
                        value={t.dueDate ? t.dueDate.slice(0, 10) : ""}
                        onChange={(e) =>
                          patchTask(t.id, {
                            dueDate: e.target.value
                              ? new Date(
                                  e.target.value + "T00:00:00Z"
                                ).toISOString()
                              : null,
                          })
                        }
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        aria-label={`Priority for ${t.title}`}
                        // Fixed width: a native select that resizes with its
                        // label reflows every column to its right on change.
                        className="h-8 w-[6.5rem] cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent px-2 text-[11px] uppercase tracking-wide text-muted-foreground outline-none transition-colors hover:border-border focus:border-foreground/40"
                        value={t.priority}
                        onChange={(e) =>
                          patchTask(t.id, { priority: e.target.value })
                        }
                      >
                        {(["high", "medium", "low"] as const).map((p) => (
                          <option key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        aria-label={`Status for ${t.title}`}
                        className="h-8 w-[8.5rem] cursor-pointer appearance-none rounded-full border border-border bg-background px-3 text-center text-[11px] uppercase tracking-wide text-muted-foreground outline-none transition-colors focus:border-foreground/40"
                        value={t.status}
                        onChange={(e) =>
                          patchTask(t.id, { status: e.target.value })
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setOpenClientId(t.clientId)}
                        className={cn(QUIET_LINK, "cursor-pointer")}
                        aria-label={`Open ${t.companyName ?? "client"}`}
                      >
                        Open
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Pager — the roster carries thousands of checklist tasks. */}
        {!loading && pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className={cn(CAPTION, "tabular-nums")}>
              {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, tasks.length)} of{" "}
              {tasks.length.toLocaleString("en-US")}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 0}
                className={cn(
                  GHOST_PILL,
                  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                Previous
              </button>
              <span className={cn(CAPTION, "tabular-nums")}>
                {safePage + 1} / {pageCount}
              </span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= pageCount - 1}
                className={cn(
                  GHOST_PILL,
                  "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Open → full client details (checklist, stage, assets) */}
      <ClientDetailModal
        clientId={openClientId}
        onClose={() => setOpenClientId(null)}
        onSaved={load}
      />

      <AddCustomTaskModal
        open={createOpen}
        clients={feed?.clients ?? []}
        staff={feed?.staff ?? []}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />
    </div>
  );
}

/** Add Task to Client — client, title, assignee. Assignment is explicit: the
 * picker lists real staff accounts and defaults to unassigned. */
function AddCustomTaskModal({
  open,
  clients,
  staff,
  onClose,
  onCreated,
}: {
  open: boolean;
  clients: { id: string; companyName: string }[];
  staff: { id: string; name: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    clientId: "",
    title: "",
    assigneeId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.clientId || !form.title.trim()) {
      setError("Pick a client and enter a task title.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${form.clientId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          assigneeId: form.assigneeId || null,
        }),
      });
      if (!res.ok) throw new Error();
      setForm({ clientId: "", title: "", assigneeId: "" });
      onCreated();
    } catch {
      setError("Could not create the task — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.form
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onSubmit={submit}
            className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
          >
            <div className="flex items-start justify-between pb-6">
              <h2 className={cn(H1, "text-xl")} style={TITLE_FONT}>
                Add Task to Client
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">
                  Client
                </span>
                <select
                  className={selectClass}
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">
                  Task Title
                </span>
                <Input
                  placeholder="e.g. Migrate DNS to the new host"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">
                  Assignee
                </span>
                <select
                  className={selectClass}
                  value={form.assigneeId}
                  onChange={(e) =>
                    setForm({ ...form, assigneeId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className={cn(CAPTION, "mt-1.5")}>
                  Leave unassigned and a teammate can claim it.
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className={GHOST_PILL}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                  disabled={saving}
                >
                  {saving ? "Creating…" : "Create Task"}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
