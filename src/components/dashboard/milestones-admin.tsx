"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Check, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/catalog";

export type MilestoneRow = {
  id: string;
  label: string;
  amount: number;
  status: string;
  dueAt: string | null;
};

export function MilestonesAdmin({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: MilestoneRow[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  const total = milestones.reduce((s, m) => s + m.amount, 0);
  const collected = milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);

  async function add() {
    const amountUsd = parseFloat(amount);
    if (!label.trim() || !Number.isFinite(amountUsd) || amountUsd <= 0 || busy) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          amountUsd,
          dueAt: due ? new Date(due).toISOString() : undefined,
        }),
      });
      setLabel("");
      setAmount("");
      setDue("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, path: string, method: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/milestones/${id}${path}`, { method });
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
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Milestones</h3>
        <p className="text-xs text-muted-foreground">
          {formatPrice(collected)} <span className="opacity-60">/ {formatPrice(total)}</span>
        </p>
      </div>

      {/* Create */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input className={inputCls} placeholder="Label (e.g. Deposit)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className={`${inputCls} sm:w-28`} inputMode="decimal" placeholder="USD" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className={`${inputCls} sm:w-44`} type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        <button
          onClick={add}
          disabled={busy || !label.trim() || !amount}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white hover:bg-orange-dark disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {milestones.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No milestones yet.</p>
        ) : (
          milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(m.amount)}
                  {m.dueAt ? ` · due ${new Date(m.dueAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    m.status === "paid"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border/60 bg-background/40 text-muted-foreground"
                  }`}
                >
                  {m.status}
                </span>
                {m.status === "pending" && (
                  <>
                    <button
                      onClick={() => act(m.id, "/mark-paid", "POST")}
                      disabled={busy}
                      title="Mark paid"
                      className="inline-flex items-center gap-1 rounded-full border border-success/40 px-2.5 py-1 text-xs text-success hover:bg-success/10"
                    >
                      <Check className="h-3.5 w-3.5" /> Paid
                    </button>
                    <button
                      onClick={() => act(m.id, "", "DELETE")}
                      disabled={busy}
                      title="Delete"
                      className="inline-flex items-center rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
