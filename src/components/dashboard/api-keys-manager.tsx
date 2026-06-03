"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Plus, Trash2, Check } from "lucide-react";

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export function ApiKeysManager() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [fresh, setFresh] = useState<{ key: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () =>
    fetch("/api/keys")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setKeys(d))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFresh({ key: data.key, name: data.name });
        setName("");
        setCopied(false);
        load();
      }
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    load();
  }

  function copy() {
    if (!fresh) return;
    navigator.clipboard?.writeText(fresh.key);
    setCopied(true);
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">API keys</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Programmatic access for you or your agents. Authenticate with{" "}
        <code className="rounded bg-background/60 px-1 py-0.5 text-xs">Authorization: Bearer &lt;key&gt;</code>.
      </p>

      {/* Freshly-created key (shown once) */}
      {fresh && (
        <div className="mt-4 rounded-2xl border border-orange/30 bg-orange/[0.06] p-4">
          <p className="text-sm font-medium text-orange">Copy your key now — it won&apos;t be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs">
              {fresh.key}
            </code>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange px-3 py-2 text-sm font-medium text-white hover:bg-orange-dark"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Create */}
      <div className="mt-4 flex items-end gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Key name (e.g. Production agent)"
          className="h-10 flex-1 rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none"
        />
        <button
          onClick={create}
          disabled={!name.trim() || creating}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
          </div>
        ) : keys.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No keys yet.</p>
        ) : (
          keys.map((k) => {
            const revoked = Boolean(k.revokedAt);
            return (
              <div
                key={k.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {k.name}{" "}
                    {revoked && <span className="text-xs text-muted-foreground">(revoked)</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {k.prefix}… · {k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}
                  </p>
                </div>
                {!revoked && (
                  <button
                    onClick={() => revoke(k.id)}
                    aria-label="Revoke key"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
