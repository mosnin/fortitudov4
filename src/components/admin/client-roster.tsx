"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import {
  FilterSelect,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowAction,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
  Toolbar,
  ToolbarActions,
  ToolbarSearch,
} from "@/components/crm";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import {
  CLIENT_PACKAGES,
  INDUSTRIES,
  PACKAGE_LABELS,
  type ClientPackage,
} from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  H1,
  H3,
  PRIMARY_PILL,
  TITLE_FONT,
} from "@/lib/typography";
import { CreditCard, Pause, Pencil, Play, Trash2, X } from "lucide-react";

interface ClientRow {
  id: string;
  contactName: string;
  companyName: string;
  businessType: string | null;
  package: ClientPackage;
  packageLabel: string | null;
  setupFee: number;
  monthlyFee: number;
  startDate: string;
  nextDueDate: string | null;
  status: "active" | "paused" | "churned";
  userId: string | null;
  notes: string | null;
  portalEmail: string | null;
}

interface PortalUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

/** Local calendar date — UTC would read as tomorrow for evening US users. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

/** Whole days until the due date; negative = overdue. */
function daysLeft(due: string | null): number | null {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86_400_000);
}

const STATUSES = ["active", "paused", "churned"] as const;

const usd = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

/** Every offering reads the same: a neutral word pill, never a colour code. */
const packageName = (c: { package: ClientPackage; packageLabel: string | null }) =>
  c.package === "custom" && c.packageLabel
    ? c.packageLabel
    : PACKAGE_LABELS[c.package] ?? "—";

const selectClass =
  "h-10 w-full rounded-full border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

const emptyForm = {
  contactName: "",
  companyName: "",
  businessType: INDUSTRIES[0],
  businessTypeCustom: "",
  package: "websites" as string,
  packageLabel: "",
  setupFee: "",
  monthlyFee: "",
  startDate: "",
  nextDueDate: "",
  status: "active" as string,
  userId: "",
  notes: "",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium">
        {label} {required && <span aria-hidden>*</span>}
      </span>
      {children}
    </div>
  );
}

/**
 * The agency client roster — search, status filter, header totals, per-row
 * actions (record payment, edit, pause/resume, delete), plus the add/edit
 * and record-payment modals. Shared by the Clients page (which can create
 * clients via `addTrigger`) and the Clients & Payments page, so both always
 * show the same synced roster.
 */
export function ClientRoster({
  addTrigger = 0,
  onChanged,
}: {
  /** Increment to open the Add Client modal from outside (e.g. a hero button). */
  addTrigger?: number;
  /** Called after any mutation (client saved/deleted, payment recorded). */
  onChanged?: () => void;
}) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Default to the collections view the agency works from: overdue first,
  // then whoever is due soonest.
  const [sort, setSort] = useState("due_soon");
  const [paymentFor, setPaymentFor] = useState<ClientRow | null>(null);
  const [payForm, setPayForm] = useState({
    paymentType: "monthly_retainer",
    method: PAYMENT_METHODS[0],
    paidAt: today(),
  });

  const load = useCallback(() => {
    fetch("/api/admin/clients")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.clients)) {
          setClients(data.clients);
          setPortalUsers(data.portalUsers ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const changed = useCallback(() => {
    load();
    onChanged?.();
  }, [load, onChanged]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, startDate: new Date().toISOString().slice(0, 10) });
    setError(null);
    setModalOpen(true);
  }

  useEffect(() => {
    if (addTrigger > 0) openAdd();
  }, [addTrigger]);

  function openEdit(c: ClientRow) {
    setEditingId(c.id);
    setForm({
      contactName: c.contactName,
      companyName: c.companyName,
      businessType:
        c.businessType && INDUSTRIES.includes(c.businessType)
          ? c.businessType
          : "Custom",
      businessTypeCustom:
        c.businessType && !INDUSTRIES.includes(c.businessType)
          ? c.businessType
          : "",
      package: c.package,
      packageLabel: c.packageLabel ?? "",
      setupFee: String(c.setupFee / 100),
      monthlyFee: String(c.monthlyFee / 100),
      startDate: c.startDate.slice(0, 10),
      nextDueDate: c.nextDueDate ? c.nextDueDate.slice(0, 10) : "",
      status: c.status,
      userId: c.userId ?? "",
      notes: c.notes ?? "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.contactName.trim() || !form.companyName.trim()) {
      setError("Contact and company name are required.");
      return;
    }
    const cents = (v: string) => Math.round((parseFloat(v) || 0) * 100);
    const payload = {
      contactName: form.contactName.trim(),
      companyName: form.companyName.trim(),
      businessType:
        form.businessType === "Custom"
          ? form.businessTypeCustom.trim() || "Custom"
          : form.businessType,
      package: form.package,
      packageLabel:
        form.package === "custom" ? form.packageLabel.trim() || null : null,
      setupFee: cents(form.setupFee),
      monthlyFee: cents(form.monthlyFee),
      startDate: new Date(form.startDate + "T00:00:00Z").toISOString(),
      nextDueDate: form.nextDueDate
        ? new Date(form.nextDueDate + "T00:00:00Z").toISOString()
        : null,
      status: form.status,
      userId: form.userId || null,
      notes: form.notes.trim() || undefined,
    };
    setSaving(true);
    try {
      const res = editingId
        ? await fetch(`/api/admin/clients/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "failed");
      }

      setModalOpen(false);
      changed();
    } catch {
      setError("Could not save the client — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentFor) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${paymentFor.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: payForm.paymentType,
          method: payForm.method,
          ...(payForm.paidAt && {
            paidAt: new Date(payForm.paidAt + "T00:00:00Z").toISOString(),
          }),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "failed");
      }
      setPaymentFor(null);
      changed();
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "failed"
          ? err.message
          : "Could not record the payment — try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePause(c: ClientRow) {
    const status = c.status === "paused" ? "active" : "paused";
    await fetch(`/api/admin/clients/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    changed();
  }

  async function removeClient(c: ClientRow) {
    if (
      !window.confirm(
        `Delete ${c.companyName}? Their payment history goes with them.`,
      )
    )
      return;
    await fetch(`/api/admin/clients/${c.id}`, { method: "DELETE" });
    changed();
  }

  const visible = clients
    .filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q);
      const dl = daysLeft(c.nextDueDate);
      const isOverdue = c.status === "active" && dl !== null && dl < 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "overdue" ? isOverdue : c.status === statusFilter);
      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      switch (sort) {
        case "due_late":
        case "due_soon": {
          // Clients with no due date sink to the bottom either way.
          const da = a.nextDueDate ? new Date(a.nextDueDate).getTime() : null;
          const db_ = b.nextDueDate ? new Date(b.nextDueDate).getTime() : null;
          if (da === null && db_ === null) return 0;
          if (da === null) return 1;
          if (db_ === null) return -1;
          // Ascending = most overdue first, then 1 day left before 10.
          return sort === "due_soon" ? da - db_ : db_ - da;
        }
        case "mrr_high":
          return b.monthlyFee - a.monthlyFee;
        case "mrr_low":
          return a.monthlyFee - b.monthlyFee;
        case "name":
          return a.companyName.localeCompare(b.companyName);
        case "newest":
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        default:
          return 0;
      }
    });

  const setupTotal = visible.reduce((s, c) => s + c.setupFee, 0);
  const mrrTotal = visible
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + c.monthlyFee, 0);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  return (
    <>
      <section className="space-y-4">
        <StatStrip columns={3} ariaLabel="Roster totals">
          <StatCell label="Clients in view">
            {visible.length > 0 ? (
              <Stat>{visible.length}</Stat>
            ) : (
              <StatEmpty>Nothing matches these filters.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="Setup fees">
            {setupTotal > 0 ? (
              <Stat>{usd(setupTotal)}</Stat>
            ) : (
              <StatEmpty>No setup fees on these clients.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="Monthly recurring">
            {mrrTotal > 0 ? (
              <>
                <Stat suffix="/mo">{usd(mrrTotal)}</Stat>
                <StatMeta>active retainers only</StatMeta>
              </>
            ) : (
              <StatEmpty>No active retainers in view.</StatEmpty>
            )}
          </StatCell>
        </StatStrip>

        <Toolbar>
          <ToolbarSearch
            value={query}
            onChange={setQuery}
            placeholder="Search clients or companies…"
          />
          <ToolbarActions>
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "overdue", label: "Overdue" },
                { value: "paused", label: "Paused" },
                { value: "churned", label: "Churned" },
              ]}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "due_soon", label: "Due soonest" },
                { value: "due_late", label: "Due latest" },
                { value: "mrr_high", label: "MRR high → low" },
                { value: "mrr_low", label: "MRR low → high" },
                { value: "name", label: "Company A–Z" },
                { value: "newest", label: "Newest clients" },
              ]}
            />
          </ToolbarActions>
        </Toolbar>

        {loading ? (
          <RecordListSkeleton rows={5} />
        ) : clients.length === 0 ? (
          <div className="py-14 text-center">
            <h3 className={H3}>No clients yet</h3>
            <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-md")}>
              Add your first client with their package and retainer — Financials
              builds MRR and package metrics from this roster.
            </p>
          </div>
        ) : (
          <RecordList>
            {visible.map((client, i) => {
              const dl = daysLeft(client.nextDueDate);
              const isOverdue =
                client.status === "active" && dl !== null && dl < 0;
              const dueLine = !client.nextDueDate
                ? "No due date"
                : isOverdue
                  ? `${-dl!} day${dl === -1 ? "" : "s"} overdue`
                  : `Due ${fmtDate(client.nextDueDate)} · ${dl} days`;
              return (
                <RecordRow
                  key={client.id}
                  index={i}
                  primary={client.companyName}
                  status={
                    <>
                      <RowPill className="whitespace-nowrap">
                        {packageName(client)}
                      </RowPill>
                      {/* Overdue is a genuine semantic — everything else is
                          a neutral word pill. */}
                      {isOverdue ? (
                        <RowPill className="border-destructive/40 text-destructive">
                          Overdue
                        </RowPill>
                      ) : client.status !== "active" ? (
                        <RowPill>{client.status}</RowPill>
                      ) : null}
                    </>
                  }
                  secondary={[
                    client.contactName,
                    client.businessType,
                    `Started ${fmtDate(client.startDate)}`,
                    `${usd(client.setupFee)} setup`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  meta={
                    <>
                      <span className="text-xs font-medium tabular-nums whitespace-nowrap text-foreground">
                        {usd(client.monthlyFee)}
                        <span className="font-normal text-muted-foreground">
                          /mo
                        </span>
                      </span>
                      <span
                        className={cn(
                          "hidden text-xs tabular-nums whitespace-nowrap sm:inline",
                          isOverdue
                            ? "font-medium text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {dueLine}
                      </span>
                    </>
                  }
                  actions={
                    <>
                      <RowAction
                        label={`Record payment for ${client.companyName}`}
                        onClick={() => {
                          setPaymentFor(client);
                          setPayForm({
                            paymentType: "monthly_retainer",
                            method: PAYMENT_METHODS[0],
                            paidAt: today(),
                          });
                          setError(null);
                        }}
                      >
                        <CreditCard size={13} />
                      </RowAction>
                      <RowAction
                        label={`Edit ${client.companyName}`}
                        onClick={() => openEdit(client)}
                      >
                        <Pencil size={13} />
                      </RowAction>
                      {client.status !== "churned" && (
                        <RowAction
                          label={
                            client.status === "paused"
                              ? `Resume ${client.companyName}`
                              : `Pause ${client.companyName}`
                          }
                          onClick={() => togglePause(client)}
                        >
                          {client.status === "paused" ? (
                            <Play size={13} />
                          ) : (
                            <Pause size={13} />
                          )}
                        </RowAction>
                      )}
                      <RowAction
                        label={`Delete ${client.companyName}`}
                        destructive
                        onClick={() => removeClient(client)}
                      >
                        <Trash2 size={13} />
                      </RowAction>
                    </>
                  }
                />
              );
            })}
          </RecordList>
        )}
      </section>

      {/* Record payment modal */}
      <AnimatePresence>
        {paymentFor && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setPaymentFor(null)}
            />
            <motion.form
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onSubmit={recordPayment}
              className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
            >
              <div className="flex items-start justify-between pb-1">
                <h2 className={cn(H1, "text-xl")} style={TITLE_FONT}>
                  Record Payment
                </h2>
                <button
                  type="button"
                  onClick={() => setPaymentFor(null)}
                  className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className={cn(CAPTION, "pb-6 tabular-nums")}>
                {paymentFor.companyName} ·{" "}
                {payForm.paymentType === "setup_fee"
                  ? `${usd(paymentFor.setupFee)} setup fee`
                  : `${usd(paymentFor.monthlyFee)} monthly retainer`}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Payment Type">
                  <select
                    className={selectClass}
                    value={payForm.paymentType}
                    onChange={(e) =>
                      setPayForm({ ...payForm, paymentType: e.target.value })
                    }
                  >
                    <option value="setup_fee">Setup Fee</option>
                    <option value="monthly_retainer">Monthly Retainer</option>
                  </select>
                </Field>
                <Field label="Payment Method">
                  <select
                    className={selectClass}
                    value={payForm.method}
                    onChange={(e) =>
                      setPayForm({ ...payForm, method: e.target.value })
                    }
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Date Received">
                  <Input
                    type="date"
                    value={payForm.paidAt}
                    max={today()}
                    onChange={(e) =>
                      setPayForm({ ...payForm, paidAt: e.target.value })
                    }
                  />
                </Field>
              </div>

              {payForm.paymentType === "monthly_retainer" && (
                <p className={cn(CAPTION, "mt-4")}>
                  Recording a retainer moves the next due date one month out.
                </p>
              )}

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <div className="mt-8 flex justify-end gap-2 border-t border-border pt-5">
                <button
                  type="button"
                  className={GHOST_PILL}
                  onClick={() => setPaymentFor(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Confirm Payment"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Add / edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.form
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onSubmit={submit}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-[0_1px_3px_rgba(15,16,16,0.06),0_24px_60px_-16px_rgba(15,16,16,0.3)] sm:p-8"
            >
              <div className="flex items-start justify-between pb-6">
                <h2 className={cn(H1, "text-xl")} style={TITLE_FONT}>
                  {editingId ? "Edit Client" : "Add New Client"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Contact Name" required>
                  <Input
                    placeholder="John Doe"
                    value={form.contactName}
                    onChange={(e) =>
                      setForm({ ...form, contactName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Company Name" required>
                  <Input
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Industry">
                  <select
                    className={selectClass}
                    value={form.businessType}
                    onChange={(e) =>
                      setForm({ ...form, businessType: e.target.value })
                    }
                  >
                    {INDUSTRIES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {form.businessType === "Custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Enter custom industry"
                      value={form.businessTypeCustom}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          businessTypeCustom: e.target.value,
                        })
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
                    {CLIENT_PACKAGES.map((p) => (
                      <option key={p} value={p}>
                        {PACKAGE_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  {form.package === "custom" && (
                    <Input
                      className="mt-2"
                      placeholder="Enter custom engagement name"
                      value={form.packageLabel}
                      onChange={(e) =>
                        setForm({ ...form, packageLabel: e.target.value })
                      }
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Setup Fee ($)">
                  <Input
                    inputMode="decimal"
                    placeholder="1500"
                    value={form.setupFee}
                    onChange={(e) =>
                      setForm({ ...form, setupFee: e.target.value })
                    }
                  />
                </Field>
                <Field label="Monthly Fee ($)">
                  <Input
                    inputMode="decimal"
                    placeholder="500"
                    value={form.monthlyFee}
                    onChange={(e) =>
                      setForm({ ...form, monthlyFee: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Start Date">
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Next Due Date">
                  <Input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) =>
                      setForm({ ...form, nextDueDate: e.target.value })
                    }
                  />
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
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Portal Account (optional)">
                  <select
                    className={selectClass}
                    value={form.userId}
                    onChange={(e) =>
                      setForm({ ...form, userId: e.target.value })
                    }
                  >
                    <option value="">Not linked</option>
                    {portalUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                          u.email}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Notes">
                  <Input
                    placeholder="Anything worth remembering about this client"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </div>

              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              <div className="mt-8 flex justify-end gap-2 border-t border-border pt-5">
                <button
                  type="button"
                  className={GHOST_PILL}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(PRIMARY_PILL, "disabled:opacity-50")}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Client"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
