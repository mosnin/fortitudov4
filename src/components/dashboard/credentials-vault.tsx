"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Copy, Check, KeyRound, Loader2, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Cred = { id: string; label: string; status: string; note: string | null };

export function CredentialsVault({
  projectId,
  credentials,
}: {
  projectId: string;
  credentials: Cred[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fulfill, setFulfill] = useState<Record<string, string>>({});

  async function add() {
    if (!label.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), secret: secret.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Failed.");
      setLabel("");
      setSecret("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reveal(id: string) {
    if (revealed[id]) {
      setRevealed((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      return;
    }
    const res = await fetch(`/api/credentials/${id}/reveal`, { method: "POST" });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.secret) setRevealed((p) => ({ ...p, [id]: data.secret }));
  }

  async function provide(id: string) {
    const value = (fulfill[id] ?? "").trim();
    if (!value) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value }),
      });
      if (res.ok) {
        setFulfill((p) => ({ ...p, [id]: "" }));
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function copy(id: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const inputCls =
    "h-10 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-orange" />
        <p className="text-sm font-medium">Logins & credentials</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Securely hand off or request logins. Secrets are encrypted and shown blurred until revealed.
      </p>

      {/* Add / request */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input className={inputCls} placeholder="Label (e.g. Shopify admin)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className={inputCls} type="password" placeholder="Secret (leave blank to request)" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <button
          onClick={add}
          disabled={busy || !label.trim()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white hover:bg-orange-dark disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {secret.trim() ? "Provide" : "Request"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {/* List */}
      <div className="mt-4 space-y-2">
        {credentials.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">No credentials yet.</p>
        ) : (
          credentials.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.label}</p>
                  {c.note && <p className="truncate text-xs text-muted-foreground">{c.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      c.status === "provided"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-warning/30 bg-warning/10 text-warning"
                    )}
                  >
                    {c.status === "provided" ? "provided" : "requested"}
                  </span>
                  <button
                    onClick={() => remove(c.id)}
                    disabled={busy}
                    className="inline-flex items-center rounded-full border border-border/60 px-2 py-1 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {c.status === "provided" ? (
                <div className="mt-2 flex items-center gap-2">
                  <code
                    className={cn(
                      "min-w-0 flex-1 truncate rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs",
                      !revealed[c.id] && "select-none blur-sm"
                    )}
                  >
                    {revealed[c.id] ?? "••••••••••••"}
                  </code>
                  <button onClick={() => reveal(c.id)} className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground" title="Reveal">
                    {revealed[c.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {revealed[c.id] && (
                    <button onClick={() => copy(c.id, revealed[c.id])} className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground" title="Copy">
                      {copiedId === c.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Provide the login…"
                    value={fulfill[c.id] ?? ""}
                    onChange={(e) => setFulfill((p) => ({ ...p, [c.id]: e.target.value }))}
                    className="h-9 flex-1 rounded-lg border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none"
                  />
                  <button
                    onClick={() => provide(c.id)}
                    disabled={busy || !(fulfill[c.id] ?? "").trim()}
                    className="rounded-lg bg-orange px-3 py-2 text-sm font-medium text-white hover:bg-orange-dark disabled:opacity-50"
                  >
                    Provide
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
