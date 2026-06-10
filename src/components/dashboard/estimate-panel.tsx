"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  estimatedHours: number | null;
  actualHours: number | null;
};

function parse(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function EstimatePanel({ projectId, estimatedHours, actualHours }: Props) {
  const router = useRouter();
  const [est, setEst] = useState(estimatedHours?.toString() ?? "");
  const [act, setAct] = useState(actualHours?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const e = parse(est);
  const a = parse(act);
  const variance = e !== null && a !== null ? a - e : null;
  const variancePct = e && a !== null ? Math.round(((a - e) / e) * 100) : null;

  async function save() {
    if (busy) return;
    setBusy(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/projects/${projectId}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedHours: e, actualHours: a }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 w-full rounded-xl border border-border/60 bg-background/40 px-3 text-sm tabular-nums focus:border-orange/50 focus:outline-none";

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Effort</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Estimated (hrs)</span>
          <input className={inputCls} inputMode="numeric" value={est} onChange={(e) => setEst(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Actual (hrs)</span>
          <input className={inputCls} inputMode="numeric" value={act} onChange={(e) => setAct(e.target.value)} />
        </label>
      </div>

      {variance !== null && (
        <p className="mt-3 text-sm">
          Variance:{" "}
          <span className={variance > 0 ? "text-orange" : "text-success"}>
            {variance > 0 ? "+" : ""}
            {variance} hrs{variancePct !== null ? ` (${variancePct > 0 ? "+" : ""}${variancePct}%)` : ""}
          </span>
        </p>
      )}

      <button
        onClick={save}
        disabled={busy}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {saved && !busy ? "Saved" : "Save"}
      </button>
    </div>
  );
}
