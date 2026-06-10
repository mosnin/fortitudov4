"use client";

import { useState } from "react";
import { CreditCard, Check, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/catalog";

type MilestoneRow = {
  id: string;
  label: string;
  description: string | null;
  amount: number;
  status: string;
  dueAt: string | null;
};

export function MilestonesClient({ milestones }: { milestones: MilestoneRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (milestones.length === 0) return null;

  async function pay(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/milestones/${id}/checkout`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't start checkout.");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError("Payments aren't configured yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 text-sm font-medium">Milestones</p>
      <ul className="space-y-2">
        {milestones.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(m.amount)}
                {m.dueAt ? ` · due ${new Date(m.dueAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            {m.status === "paid" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                <Check className="h-3.5 w-3.5" /> Paid
              </span>
            ) : (
              <button
                onClick={() => pay(m.id)}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
              >
                {busy === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                Pay
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
