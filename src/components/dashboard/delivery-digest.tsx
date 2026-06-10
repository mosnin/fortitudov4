"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface DigestRisk {
  label: string;
  detail: string;
}

interface DigestNextAction {
  label: string;
}

interface Digest {
  headline: string;
  progressPct: number;
  velocity: string;
  risks: DigestRisk[];
  nextActions: DigestNextAction[];
}

export function DeliveryDigest({ projectId }: { projectId: string }) {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = () =>
      fetch(`/api/projects/${projectId}/digest`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data && typeof data.headline === "string") setDigest(data);
        })
        .catch(() => {
          if (active) setDigest(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    load();
    // Liveness: the digest is derived live; refresh on focus + a calm interval.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    const timer = setInterval(load, 60000);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-border/60 bg-card/60 py-16 backdrop-blur-xl">
        <Loader2 className="h-5 w-5 animate-spin text-orange" />
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-xl">
        <p className="font-mono text-sm text-muted-foreground">~ status unavailable ~</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-orange/80">
          Delivery lead
        </p>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {digest.progressPct}% complete
        </span>
      </div>

      {/* Headline */}
      <h3 className="font-brand mt-3 text-2xl leading-tight text-foreground sm:text-3xl">
        {digest.headline}
      </h3>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange to-orange-light transition-[width] duration-700"
            style={{ width: `${Math.min(100, Math.max(0, digest.progressPct))}%` }}
          />
        </div>
      </div>

      {/* Velocity */}
      <p className="mt-4 font-mono text-xs text-muted-foreground">{digest.velocity}</p>

      {/* Risk chips */}
      {digest.risks.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Risks
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {digest.risks.map((r, i) => (
              <span
                key={i}
                title={r.detail}
                className="inline-flex items-center gap-1.5 rounded-full border border-orange/30 bg-orange/[0.07] px-3 py-1 font-mono text-[11px] text-orange-light"
              >
                <span aria-hidden className="text-amber-400">
                  ▲
                </span>
                {r.label}
              </span>
            ))}
          </div>
          <ul className="mt-2 space-y-1">
            {digest.risks.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-foreground/80">{r.label}</span> — {r.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next actions */}
      {digest.nextActions.length > 0 && (
        <div className="mt-5 border-t border-border/40 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Next actions
          </p>
          <ul className="mt-2 space-y-1.5">
            {digest.nextActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <span aria-hidden className="mt-0.5 font-mono text-xs text-orange">
                  ○
                </span>
                <span className="min-w-0 flex-1">{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
