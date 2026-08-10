"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { CLIENT_PACKAGES, INDUSTRIES, PACKAGE_LABELS } from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  H1,
  H3,
  PRIMARY_PILL,
  QUIET_LINK,
  SECTION_LABEL,
  STATUS_PILL,
  TITLE_FONT,
} from "@/lib/typography";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "churned", label: "Canceled" },
];

const TASK_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const selectClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

interface Task {
  id: string;
  title: string;
  status: string;
  assigneeName: string | null;
}

interface Req {
  id: string;
  description: string;
  status: string;
  createdAt: string;
}

interface ClientData {
  id: string;
  contactName: string;
  companyName: string;
  businessType: string | null;
  package: string;
  packageLabel: string | null;
  email: string | null;
  status: string;
  startDate: string;
  driveUrl: string | null;
  landingPageUrl: string | null;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
    </div>
  );
}

/** Client Details & Tasks — edit metadata + assets and manage the onboarding
 * checklist. Task status changes save immediately (auto-advancing the pipeline
 * stage); metadata saves on "Save Changes". */
export function ClientDetailModal({
  clientId,
  onClose,
  onSaved,
}: {
  clientId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteNote, setInviteNote] = useState<string | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    status: "active",
    industry: "",
    industryCustom: "",
    package: "",
    packageCustom: "",
    startDate: "",
    driveUrl: "",
    landingPageUrl: "",
  });

  const load = useCallback(() => {
    if (!clientId) return;
    fetch(`/api/admin/clients/${clientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.client) return;
        const c: ClientData = data.client;
        const knownIndustry =
          c.businessType && INDUSTRIES.includes(c.businessType);
        setForm({
          companyName: c.companyName,
          contactName: c.contactName,
          email: c.email ?? "",
          status: c.status,
          industry: c.businessType
            ? knownIndustry
              ? c.businessType
              : "Custom"
            : "",
          industryCustom:
            c.businessType && !knownIndustry ? c.businessType : "",
          package: c.package,
          packageCustom: c.package === "custom" ? c.packageLabel ?? "" : "",
          startDate: c.startDate ? c.startDate.slice(0, 10) : "",
          driveUrl: c.driveUrl ?? "",
          landingPageUrl: c.landingPageUrl ?? "",
        });
        setTasks(data.tasks ?? []);
        setRequests(data.requests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      setLoading(true);
      load();
    }
  }, [clientId, load]);

  async function setTaskStatus(taskId: string, status: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    await fetch(`/api/admin/client-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onSaved();
  }

  async function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/admin/client-tasks/${taskId}`, { method: "DELETE" });
    onSaved();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim() || !clientId) return;
    const res = await fetch(`/api/admin/clients/${clientId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim() }),
    });
    if (res.ok) {
      setNewTask("");
      load();
    }
  }

  /** Email this client their portal invite on demand — invites are never
   * sent automatically, so the agency controls the timing. */
  async function sendInvite() {
    if (!clientId || !form.email.trim()) return;
    setInviting(true);
    setInviteNote(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          resendInvite: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "failed");
      setInviteNote(
        data?.inviteStatus === "sent"
          ? `Invite emailed to ${form.email.trim()}.`
          : "Saved, but the invite couldn't be sent — check Clerk config."
      );
      onSaved();
    } catch (err) {
      setInviteNote(
        err instanceof Error && err.message !== "failed"
          ? err.message
          : "Could not send the invite — try again."
      );
    } finally {
      setInviting(false);
    }
  }

  async function save() {
    if (!clientId) return;
    setSaving(true);
    const industry =
      form.industry === "Custom"
        ? form.industryCustom.trim() || "Custom"
        : form.industry || null;
    try {
      await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim() || null,
          status: form.status,
          businessType: industry,
          package: form.package || undefined,
          packageLabel:
            form.package === "custom"
              ? form.packageCustom.trim() || "Custom"
              : null,
          startDate: form.startDate
            ? new Date(form.startDate + "T00:00:00Z").toISOString()
            : undefined,
          driveUrl: form.driveUrl.trim() || null,
          landingPageUrl: form.landingPageUrl.trim() || null,
        }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;

  return (
    <AnimatePresence>
      {clientId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
          >
            <div className="flex items-start justify-between pb-6">
              <h2 className={cn(H1, "text-2xl")} style={TITLE_FONT}>
                Client Details &amp; Tasks
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

            {loading ? (
              <p className={cn(BODY_MUTED, "py-10 text-center")}>Loading…</p>
            ) : (
              <>
                {/* Metadata */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Business Name">
                    <Input
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Contact Name">
                    <Input
                      value={form.contactName}
                      onChange={(e) =>
                        setForm({ ...form, contactName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Login Email">
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={sendInvite}
                        disabled={inviting || !form.email.trim()}
                        className={cn(
                          GHOST_PILL,
                          "h-8 border border-border px-3 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        {inviting ? "Sending…" : "Send Portal Invite"}
                      </button>
                      <span className={CAPTION}>
                        Invites are only sent when you click.
                      </span>
                    </div>
                    {inviteNote && (
                      <p className={cn(CAPTION, "mt-1.5")}>{inviteNote}</p>
                    )}
                  </Field>
                  <Field label="Status">
                    <select
                      className={selectClass}
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Industry">
                    <select
                      className={selectClass}
                      value={form.industry}
                      onChange={(e) =>
                        setForm({ ...form, industry: e.target.value })
                      }
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                    {form.industry === "Custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Custom industry"
                        value={form.industryCustom}
                        onChange={(e) =>
                          setForm({ ...form, industryCustom: e.target.value })
                        }
                      />
                    )}
                  </Field>
                  <Field label="Package">
                    <select
                      className={selectClass}
                      value={form.package}
                      onChange={(e) =>
                        setForm({ ...form, package: e.target.value })
                      }
                    >
                      <option value="">Select offering</option>
                      {CLIENT_PACKAGES.map((p) => (
                        <option key={p} value={p}>
                          {PACKAGE_LABELS[p]}
                        </option>
                      ))}
                    </select>
                    {form.package === "custom" && (
                      <Input
                        className="mt-2"
                        placeholder="Custom engagement name"
                        value={form.packageCustom}
                        onChange={(e) =>
                          setForm({ ...form, packageCustom: e.target.value })
                        }
                      />
                    )}
                  </Field>
                  <Field label="Date Started">
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 space-y-4">
                  <Field label="Google Drive Link">
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={form.driveUrl}
                      onChange={(e) =>
                        setForm({ ...form, driveUrl: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Landing Page Link">
                    <Input
                      placeholder="https://..."
                      value={form.landingPageUrl}
                      onChange={(e) =>
                        setForm({ ...form, landingPageUrl: e.target.value })
                      }
                    />
                  </Field>
                </div>

                {/* Onboarding checklist */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <h3 className={H3}>Onboarding Checklist</h3>
                    <p className={cn(SECTION_LABEL, "mt-0.5 tabular-nums")}>
                      {done} of {total} complete
                    </p>
                  </div>
                  <form onSubmit={addTask} className="flex items-center gap-2">
                    <Input
                      className="h-9 w-40"
                      placeholder="New task"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />
                    <button
                      type="submit"
                      className={cn(GHOST_PILL, "border border-border")}
                    >
                      Add Task
                    </button>
                  </form>
                </div>
                <ul className="divide-y divide-border/60">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t.title}
                        </p>
                        {t.assigneeName && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {t.assigneeName}
                          </p>
                        )}
                      </div>
                      <select
                        aria-label={`Status for ${t.title}`}
                        className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2.5 text-[11px] uppercase tracking-wide text-muted-foreground outline-none transition-colors focus:border-foreground/40"
                        value={t.status}
                        onChange={(e) => setTaskStatus(t.id, e.target.value)}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Delete ${t.title}`}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                  {tasks.length === 0 && (
                    <li className={cn(BODY_MUTED, "py-4 text-center")}>
                      No tasks yet.
                    </li>
                  )}
                </ul>

                {/* Client requests */}
                <h3 className={cn(H3, "mt-8 border-b border-border pb-3")}>
                  Client Requests
                </h3>
                {requests.length === 0 ? (
                  <p className={cn(BODY_MUTED, "py-4")}>
                    No requests from this client.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {requests.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-start justify-between gap-3 py-3 text-sm"
                      >
                        <p className="min-w-0 flex-1">{r.description}</p>
                        <span className={cn(STATUS_PILL, "shrink-0")}>
                          {r.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
                  <button type="button" className={QUIET_LINK} onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
