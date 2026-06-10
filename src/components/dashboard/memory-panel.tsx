"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Scope = "global" | "client" | "project";
type Kind = "preference" | "pattern" | "decision" | "fact" | "component";

interface MemoryRow {
  id: string;
  scope: Scope;
  kind: Kind;
  title: string;
  content: string;
  tags: string[] | null;
  createdAt: string;
}

const SCOPES: Scope[] = ["global", "client", "project"];
const KINDS: Kind[] = ["preference", "pattern", "decision", "fact", "component"];

const panel = "rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl";
const field =
  "w-full rounded-2xl border border-border/60 bg-background/40 px-3.5 py-2.5 text-sm transition-colors focus:border-orange/50 focus:outline-none";
const label = "font-mono text-[11px] uppercase tracking-[0.22em] text-orange/80";

export function MemoryPanel() {
  // Add form.
  const [scope, setScope] = useState<Scope>("global");
  const [kind, setKind] = useState<Kind>("preference");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  // Search list.
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<MemoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/memory?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        if (res.status !== 401) toast.error("Couldn't load memory", "Try again in a moment.");
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      toast.error("Couldn't load memory", "Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search input; load on mount with empty query.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(q.trim()), 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q, load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          kind,
          title: title.trim(),
          content: content.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success("Saved to memory", "The studio knows this now.");
        setTitle("");
        setContent("");
        setTags("");
        load(q.trim());
      } else {
        toast.error("Couldn't save", "Your memory wasn't recorded — try again.");
      }
    } catch {
      toast.error("Couldn't save", "Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Add form */}
      <form onSubmit={save} className={cn(panel, "space-y-4 p-5 lg:col-span-2")}>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Record</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={label} htmlFor="mem-scope">
              Scope
            </label>
            <select
              id="mem-scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className={field}
            >
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="mem-kind">
              Kind
            </label>
            <select
              id="mem-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className={field}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="mem-title">
            Title
          </label>
          <input
            id="mem-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Prefers minimal, type-led design"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="mem-content">
            Content
          </label>
          <textarea
            id="mem-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="What the studio should remember…"
            className={cn(field, "resize-y")}
          />
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="mem-tags">
            Tags
          </label>
          <input
            id="mem-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="design, brand, comma-separated"
            className={field}
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Remember this"}
        </button>
      </form>

      {/* Search + list */}
      <div className={cn(panel, "flex flex-col overflow-hidden lg:col-span-3")}>
        <div className="border-b border-border/60 p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search memory…"
            className={field}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-orange" />
            </div>
          ) : rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              {q.trim() ? "Nothing matches that." : "The studio hasn't recorded anything yet."}
            </p>
          ) : (
            <ul>
              {rows.map((m) => (
                <li
                  key={m.id}
                  className="border-b border-border/40 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-orange/[0.03]"
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span aria-hidden className="text-orange/70">
                      ●
                    </span>
                    <span className="text-orange/80">{m.kind}</span>
                    <span className="text-white/30">/</span>
                    <span>{m.scope}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium">{m.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.content}</p>
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
