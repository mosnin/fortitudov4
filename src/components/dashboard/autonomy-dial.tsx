"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Mirrors AUTONOMY_LEVELS / AUTONOMY_COPY from @/lib/project-settings, which is
// server-only and can't be imported into a client component.
type Level = "manual" | "assisted" | "autonomous";

const LEVELS: Level[] = ["manual", "assisted", "autonomous"];

const COPY: Record<Level, { label: string; detail: string }> = {
  manual: { label: "Manual", detail: "Humans do everything. Agents only assist on request." },
  assisted: { label: "Assisted", detail: "Agents draft the work; a human approves every step." },
  autonomous: { label: "Autonomous", detail: "Agents act and notify you; you can veto anything." },
};

export function AutonomyDial({
  projectId,
  initial,
}: {
  projectId: string;
  initial: Level;
}) {
  const [level, setLevel] = useState<Level>(initial);
  const [pending, startTransition] = useTransition();

  function select(next: Level) {
    if (next === level || pending) return;
    const prev = level;
    setLevel(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/projects/${projectId}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autonomyLevel: next }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
        toast.success("Autonomy updated", COPY[next].label);
      } catch (e) {
        setLevel(prev);
        toast.error("Couldn't update autonomy", e instanceof Error ? e.message : undefined);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Autonomy</p>
      <h3 className="mt-2 font-brand text-2xl text-foreground">How much the agents drive</h3>

      <div
        role="radiogroup"
        aria-label="Autonomy level"
        className="mt-5 grid grid-cols-3 gap-1 rounded-full border border-border/60 bg-background/40 p-1"
      >
        {LEVELS.map((l) => {
          const active = l === level;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={pending}
              onClick={() => select(l)}
              className={cn(
                "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed",
                active
                  ? "bg-orange text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {COPY[l].label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{COPY[level].detail}</p>
    </div>
  );
}

export default AutonomyDial;
