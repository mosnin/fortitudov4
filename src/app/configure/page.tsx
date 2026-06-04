"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Check, Loader2, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  coreProducts,
  applicableAddons,
  computeTotal,
  addonCategories,
} from "@/lib/configurator";

function usd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const STORAGE = "ftd_config";

export default function ConfigurePage() {
  const [coreId, setCoreId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState<"checkout" | "later" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate a configuration (e.g. after a sign-up detour).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw);
        setCoreId(s.coreId ?? null);
        setAddonIds(s.addonIds ?? []);
        setBusinessName(s.businessName ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE, JSON.stringify({ coreId, addonIds, businessName }));
  }, [coreId, addonIds, businessName]);

  const core = coreProducts.find((c) => c.id === coreId) ?? null;
  const available = core ? applicableAddons(core.discipline) : [];
  // Drop any selected add-ons that don't apply to the chosen core.
  const validAddonIds = addonIds.filter((id) => available.some((a) => a.id === id));
  const total = core ? computeTotal(core, validAddonIds) : 0;

  function toggleAddon(id: string) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function save(mode: "checkout" | "later") {
    if (!core) return setError("Pick a starting point first.");
    if (!businessName.trim()) return setError("Give your project a name.");
    setSaving(mode);
    setError(null);
    try {
      const res = await fetch("/api/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coreId: core.id, addonIds: validAddonIds, businessName: businessName.trim() }),
      });
      if (res.status === 401) {
        // Not signed in — keep the config and send them to sign up.
        window.location.href = "/sign-up";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      sessionStorage.removeItem(STORAGE);
      window.location.href = mode === "checkout" ? `/blueprint/${data.blueprintId}` : "/projects";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(null);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="Configure"
          title={<>Build your project, <span className="text-gradient-orange">your way.</span></>}
          subtitle="Pick a starting point, add what you need, and see a real price. Save it and check out — or come back to it later."
        />

        <section className="bg-charcoal-dark pb-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {/* Builder */}
            <div className="space-y-10 lg:col-span-2">
              {/* Core */}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
                  01 · Starting point
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {coreProducts.map((c) => {
                    const active = c.id === coreId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCoreId(c.id)}
                        className={cn(
                          "rounded-3xl border p-5 text-left transition-all",
                          active
                            ? "border-orange/50 bg-orange/[0.07] ring-1 ring-inset ring-orange/30"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-brand text-xl text-white">{c.name}</h3>
                            <p className="text-xs uppercase tracking-[0.15em] text-orange/70">{c.tagline}</p>
                          </div>
                          <span className="font-brand text-sm text-orange">from {usd(c.price)}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/55">{c.description}</p>
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/50">
                          <Clock className="h-3.5 w-3.5" /> {c.timeline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add-ons */}
              <div className={cn(!core && "pointer-events-none opacity-40")}>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
                  02 · Add what you need
                </p>
                {!core && <p className="mt-2 text-sm text-white/50">Pick a starting point to see add-ons.</p>}
                {core && (
                  <div className="mt-4 space-y-6">
                    {addonCategories.map((cat) => {
                      const items = available.filter((a) => a.category === cat.id);
                      if (items.length === 0) return null;
                      return (
                        <div key={cat.id}>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{cat.label}</p>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {items.map((a) => {
                              const on = validAddonIds.includes(a.id);
                              return (
                                <button
                                  key={a.id}
                                  onClick={() => toggleAddon(a.id)}
                                  className={cn(
                                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                                    on
                                      ? "border-orange/50 bg-orange/[0.07]"
                                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                                      on ? "border-orange bg-orange text-white" : "border-white/20"
                                    )}
                                  >
                                    {on && <Check className="h-3.5 w-3.5" />}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-medium text-white">{a.name}</span>
                                      <span className="font-brand text-sm text-orange">+{usd(a.price)}</span>
                                    </span>
                                    <span className="mt-0.5 block text-xs text-white/55">{a.description}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <SpotlightCard className="p-6">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Your build</p>

                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Project / business name"
                  className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/40 focus:border-orange/50 focus:outline-none"
                />

                <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm">
                  {core ? (
                    <>
                      <div className="flex justify-between gap-3 text-white/80">
                        <span>{core.name}</span>
                        <span className="tabular-nums">{usd(core.price)}</span>
                      </div>
                      {available
                        .filter((a) => validAddonIds.includes(a.id))
                        .map((a) => (
                          <div key={a.id} className="flex justify-between gap-3 text-white/60">
                            <span>{a.name}</span>
                            <span className="tabular-nums">+{usd(a.price)}</span>
                          </div>
                        ))}
                    </>
                  ) : (
                    <p className="text-white/50">Nothing selected yet.</p>
                  )}
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
                  <span className="text-sm text-white/60">Estimated total</span>
                  <span className="font-brand text-3xl text-orange tabular-nums">{usd(total)}</span>
                </div>
                {core && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/40">
                    <Clock className="h-3.5 w-3.5" />
                    {validAddonIds.includes("expedited") ? `${core.timeline} (expedited)` : core.timeline}
                  </p>
                )}

                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

                <button
                  onClick={() => save("checkout")}
                  disabled={!core || saving !== null}
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-dark disabled:opacity-50"
                >
                  {saving === "checkout" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Save & continue to checkout
                </button>
                <button
                  onClick={() => save("later")}
                  disabled={!core || saving !== null}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white disabled:opacity-50"
                >
                  {saving === "later" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save for later"}
                </button>
                <p className="mt-3 text-center text-[11px] text-white/40">
                  Final scope is confirmed with your architect. No charge until you accept.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
