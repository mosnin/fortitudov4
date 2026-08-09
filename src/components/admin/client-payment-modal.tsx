"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

export { PAYMENT_METHODS };

export interface RosterClient {
  id: string;
  companyName: string;
  setupFee: number;
  monthlyFee: number;
}

export interface EditablePayment {
  id: string;
  paidAt?: string;
  paymentType: "setup_fee" | "monthly_retainer";
  method: string;
  amount: number;
  notes?: string | null;
}

const selectClass =
  "h-10 w-full rounded-full border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-foreground/40";

/** Today as the admin sees it on their own calendar. Using the UTC date
 * here would default to *tomorrow* for US users after ~5pm. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const usd = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

/**
 * Record / edit a client payment. Create mode picks the roster client and
 * derives the amount from their fee (overridable); edit mode patches an
 * existing payment. Shared by the Payments and Clients pages.
 */
export function ClientPaymentModal({
  open,
  onClose,
  onSaved,
  payment,
  presetClientId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** When set, the modal edits this payment instead of creating one. */
  payment?: EditablePayment | null;
  /** Create mode: preselect a roster client. */
  presetClientId?: string;
}) {
  const [clients, setClients] = useState<RosterClient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientId: "",
    paymentType: "monthly_retainer",
    method: PAYMENT_METHODS[0],
    amount: "",
    paidAt: today(),
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    fetch("/api/admin/clients")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setClients(data.clients ?? []);
        setForm((f) => ({
          ...f,
          clientId: payment ? "" : presetClientId ?? f.clientId,
          paymentType: payment?.paymentType ?? "monthly_retainer",
          method: payment?.method ?? PAYMENT_METHODS[0],
          amount: payment ? String(payment.amount / 100) : "",
          paidAt: payment?.paidAt ? payment.paidAt.slice(0, 10) : today(),
          notes: payment?.notes ?? "",
        }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payment?.id, presetClientId]);

  const selectedClient = clients.find((c) => c.id === form.clientId);
  const defaultAmount = selectedClient
    ? form.paymentType === "setup_fee"
      ? selectedClient.setupFee
      : selectedClient.monthlyFee
    : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!payment && !form.clientId) {
      setError("Pick a client.");
      return;
    }
    const override = form.amount.trim()
      ? Math.round(parseFloat(form.amount) * 100)
      : undefined;
    if (override !== undefined && (!Number.isFinite(override) || override <= 0)) {
      setError("Enter a positive amount.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        paymentType: form.paymentType,
        method: form.method,
        ...(override !== undefined && { amount: override }),
        ...(form.paidAt && {
          paidAt: new Date(form.paidAt + "T00:00:00Z").toISOString(),
        }),
      };
      const res = payment
        ? await fetch(`/api/admin/client-payments/${payment.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...body, notes: form.notes.trim() || null }),
          })
        : await fetch(`/api/admin/clients/${form.clientId}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...body,
              notes: form.notes.trim() || undefined,
            }),
          });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "failed");
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "failed"
          ? err.message
          : "Could not save the payment — try again."
      );
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
            className="absolute inset-0 bg-background/60 backdrop-blur-xl"
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
              <h2 className="font-title text-xl tracking-tight">
                {payment ? "Edit Payment" : "Record Payment"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {!payment && (
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Client <span className="text-destructive">*</span>
                  </span>
                  <select
                    className={selectClass}
                    value={form.clientId}
                    onChange={(e) =>
                      setForm({ ...form, clientId: e.target.value })
                    }
                  >
                    <option value="">Select client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Payment Type
                  </span>
                  <select
                    className={selectClass}
                    value={form.paymentType}
                    onChange={(e) =>
                      setForm({ ...form, paymentType: e.target.value })
                    }
                  >
                    <option value="setup_fee">Setup Fee</option>
                    <option value="monthly_retainer">Monthly Retainer</option>
                  </select>
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Payment Method
                  </span>
                  <select
                    className={selectClass}
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Amount ($)
                  </span>
                  <Input
                    inputMode="decimal"
                    placeholder={
                      !payment && defaultAmount > 0
                        ? `${usd(defaultAmount)} (default)`
                        : "Amount"
                    }
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Date Received
                  </span>
                  <Input
                    type="date"
                    value={form.paidAt}
                    max={today()}
                    onChange={(e) =>
                      setForm({ ...form, paidAt: e.target.value })
                    }
                  />
                  <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                    Back-date it and the payment lands in that week&apos;s
                    revenue, not today&apos;s.
                  </p>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-[13px] font-medium">
                  Notes
                </span>
                <Input
                  placeholder="e.g. wire ref, partial payment"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              {!payment && form.paymentType === "monthly_retainer" && (
                <p className="font-mono text-[10px] text-muted-foreground">
                  Recording a retainer moves the client&apos;s next due date one
                  month out.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="mt-8 flex justify-end gap-2 border-t border-border pt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : payment ? "Save" : "Confirm Payment"}
              </Button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
