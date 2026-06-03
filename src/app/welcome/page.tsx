"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { ArrowRight, Loader2 } from "lucide-react";

const stages = [
  { id: "idea", label: "Just an idea" },
  { id: "early", label: "Early stage" },
  { id: "growing", label: "Growing" },
  { id: "established", label: "Established" },
] as const;

type Stage = (typeof stages)[number]["id"];

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
    targetMarket: "",
    teamSize: "",
  });
  const [stage, setStage] = useState<Stage | "">("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const canSubmit = form.name.trim() !== "" && form.description.trim() !== "";

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          industry: form.industry || undefined,
          website: form.website || undefined,
          targetMarket: form.targetMarket || undefined,
          teamSize: form.teamSize || undefined,
          stage: stage || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/dashboard");
    } catch {
      setError("Couldn't save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal-dark">
      <AsciiField className="absolute inset-0 h-full w-full opacity-[0.14]" cell={14} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
            {user?.firstName ? `Welcome, ${user.firstName}` : "Welcome"}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tell us about your business</h1>
          <p className="mt-2 text-muted-foreground">
            The more we understand who you are, the sharper everything we build for you will be.
          </p>
        </div>

        <div className="space-y-5 rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Business name <span className="text-destructive">*</span>
            </label>
            <Input placeholder="Acme Inc." value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              What does your business do? <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Explain your business in your own words — what you sell, who you serve, and what makes you different."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Industry</label>
              <Input placeholder="e.g. Retail, Fintech, Health" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <Input placeholder="https://example.com" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Who are your customers?</label>
            <Input
              placeholder="Your target market / audience"
              value={form.targetMarket}
              onChange={(e) => set("targetMarket", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">What stage are you at?</label>
            <div className="flex flex-wrap gap-2">
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage((cur) => (cur === s.id ? "" : s.id))}
                  className={`rounded-xl border px-3.5 py-2 text-sm transition-colors ${
                    stage === s.id
                      ? "border-orange bg-orange/10 text-orange"
                      : "border-border text-muted-foreground hover:border-orange/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Skip for now
            </Link>
            <Button variant="glow" onClick={submit} disabled={!canSubmit || saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
