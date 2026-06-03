"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { AsciiField } from "@/components/dashboard/ascii-field";

const disciplines = ["software", "commerce", "ai", "infrastructure"] as const;

type Result = { code: string; email: string; projectId: string; isNewClient: boolean };

export default function NewBuildPage() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    businessName: "",
    discipline: "software" as (typeof disciplines)[number],
    description: "",
    features: "",
    timeline: "",
    budget: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit() {
    if (!form.email || !form.businessName || !form.description || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName || undefined,
          businessName: form.businessName,
          discipline: form.discipline,
          description: form.description,
          features: form.features ? form.features.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
          timeline: form.timeline || undefined,
          budget: form.budget || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create build.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create build.");
    } finally {
      setBusy(false);
    }
  }

  const signupUrl = typeof window !== "undefined" ? `${window.location.origin}/sign-up` : "/sign-up";
  const inputCls =
    "h-10 w-full rounded-xl border border-border/60 bg-background/40 px-3 text-sm focus:border-orange/50 focus:outline-none";

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">New build</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">Create a build for a client</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60">
            Spec it out and we&apos;ll generate a Blueprint. The client gets an invite code to make an
            account and see it.
          </p>
        </div>
      </div>

      {result ? (
        <div className="rounded-3xl border border-orange/30 bg-orange/[0.06] p-6">
          <h2 className="font-brand text-2xl text-white">Build created</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.isNewClient
              ? `Send ${result.email} their invite. They sign up with this email and the build appears automatically.`
              : `${result.email} already has an account — the build is in their dashboard now.`}
          </p>

          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Invite code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-border/60 bg-background/60 px-3 py-2 font-mono text-lg tracking-widest">
                {result.code}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`${result.code} — sign up at ${signupUrl} with ${result.email}`);
                  setCopied(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange px-3 py-2 text-sm font-medium text-white hover:bg-orange-dark"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sign-up link: <span className="text-foreground">{signupUrl}</span>
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/admin/projects/${result.projectId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
            >
              Open the build <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setForm({ ...form, email: "", firstName: "", businessName: "", description: "", features: "" });
              }}
              className="rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Create another
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Client email *</span>
              <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Client first name</span>
              <input className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Business / build name *</span>
              <input className={inputCls} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Discipline</span>
              <select
                className={`${inputCls} capitalize`}
                value={form.discipline}
                onChange={(e) => set("discipline", e.target.value)}
              >
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-xs text-muted-foreground">Specs / description *</span>
            <textarea
              rows={5}
              className="mt-1 w-full resize-y rounded-2xl border border-border/60 bg-background/40 p-3 text-sm focus:border-orange/50 focus:outline-none"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What are we building, and what are the key capabilities?"
            />
          </label>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-xs text-muted-foreground">Features (comma-sep)</span>
              <input className={inputCls} value={form.features} onChange={(e) => set("features", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Timeline</span>
              <input className={inputCls} value={form.timeline} onChange={(e) => set("timeline", e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Budget</span>
              <input className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            onClick={submit}
            disabled={busy || !form.email || !form.businessName || !form.description}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Create build & invite
          </button>
        </div>
      )}
    </div>
  );
}
