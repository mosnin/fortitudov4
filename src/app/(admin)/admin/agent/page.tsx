"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AsciiField } from "@/components/dashboard/ascii-field";

type Cfg = { offerings: string; systemPrompt: string; guardrails: string };

const fields: { key: keyof Cfg; label: string; hint: string; rows: number }[] = [
  {
    key: "offerings",
    label: "Products & services",
    hint: "What the studio offers — the only things the agent can propose. Cached as the agent's stable context.",
    rows: 12,
  },
  {
    key: "systemPrompt",
    label: "System prompt",
    hint: "The agent's persona, interview style, research behavior, and how it creates proposals.",
    rows: 12,
  },
  {
    key: "guardrails",
    label: "Guardrails",
    hint: "Hard rules for deciding fit — what to accept, what to decline.",
    rows: 6,
  },
];

export default function AdminAgentPage() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/agent-config")
      .then((r) => r.json())
      .then((d) => setCfg(d))
      .catch(() => setCfg({ offerings: "", systemPrompt: "", guardrails: "" }));
  }, []);

  async function save() {
    if (!cfg || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Agent</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">Context & guardrails</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Tune what the Brief agent knows and how it behaves. Changes apply to the next conversation.
          </p>
        </div>
      </div>

      {!cfg ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange" />
        </div>
      ) : (
        <>
          {fields.map((f) => (
            <div key={f.key} className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
              <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">{f.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.hint}</p>
              <textarea
                value={cfg[f.key]}
                onChange={(e) => setCfg({ ...cfg, [f.key]: e.target.value })}
                rows={f.rows}
                className="mt-4 w-full resize-y rounded-2xl border border-border/60 bg-background/40 p-4 font-mono text-sm leading-relaxed focus:border-orange/50 focus:outline-none"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved && !saving ? "Saved" : "Save context"}
            </button>
            <p className="text-xs text-muted-foreground">
              Leave a field blank to fall back to the built-in default.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
