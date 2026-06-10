"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toast";

const HEX = /^#([0-9a-fA-F]{6})$/;

export function BrandSettings({
  projectId,
  initialColor,
  initialName,
}: {
  projectId: string;
  initialColor: string | null;
  initialName: string | null;
}) {
  const [color, setColor] = useState<string>(initialColor ?? "#F97316");
  const [enabled, setEnabled] = useState<boolean>(initialColor != null);
  const [name, setName] = useState<string>(initialName ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    if (pending) return;
    const brandColor = enabled ? color : null;
    if (brandColor && !HEX.test(brandColor)) {
      toast.error("Invalid color", "Use a 6-digit hex like #F97316");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/projects/${projectId}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandColor, brandName: name.trim() || null }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
        toast.success("Brand saved", enabled ? "Portal accents updated" : "Brand accent cleared");
      } catch (e) {
        toast.error("Couldn't save brand", e instanceof Error ? e.message : undefined);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Brand</p>
      <h3 className="mt-2 font-brand text-2xl text-foreground">Client portal accent</h3>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        A bespoke accent for this client&apos;s portal. Orange stays the system default — the brand
        color is a tasteful per-client tint, not a full re-theme.
      </p>

      <div className="mt-5 space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-orange"
          />
          <span className="text-sm text-foreground">Use a custom brand accent</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="brand-color"
              className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Accent color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={color}
                disabled={!enabled}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-xl border border-border/60 bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <span className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">
                {enabled ? color : "—"}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="brand-name"
              className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Brand name
            </label>
            <input
              id="brand-name"
              type="text"
              value={name}
              maxLength={255}
              placeholder="Acme Co."
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-orange/60"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-orange px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save brand"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrandSettings;
