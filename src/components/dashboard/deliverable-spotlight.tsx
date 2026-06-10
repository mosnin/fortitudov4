"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type SpotlightDeliverable = {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  description: string | null;
  status: string;
};

export type DeliverableSpotlightProps = {
  deliverable: SpotlightDeliverable | null;
  brandColor?: string | null;
};

const ease = [0.16, 1, 0.3, 1] as const;

function statusChip(status: string): { label: string; tone: "pending" | "approved" | "changes" } {
  switch (status) {
    case "approved":
      return { label: "Approved", tone: "approved" };
    case "changes_requested":
      return { label: "Changes requested", tone: "changes" };
    default:
      return { label: "Awaiting your review", tone: "pending" };
  }
}

/**
 * A richer "latest deliverable" hero — the moment the studio just shipped
 * something. A faint accent radial, a mono eyebrow, the title in font-brand, the
 * kind as a mono tag, the description, a status chip, and (when there's a URL)
 * accent-tinted Open + Review affordances. Themed to the client's brand.
 */
export function DeliverableSpotlight({ deliverable, brandColor }: DeliverableSpotlightProps) {
  const reduce = useReducedMotion();
  const accent = brandColor || "#F97316";

  if (!deliverable) return null;

  const chip = statusChip(deliverable.status);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl sm:p-7"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 85% 0%, ${accent}1f, transparent 60%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
            {!reduce && (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: accent }}
              />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
            Latest deliverable
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h3 className="font-brand text-2xl leading-tight text-white sm:text-3xl">{deliverable.title}</h3>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
            {deliverable.kind}
          </span>
        </div>

        {deliverable.description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{deliverable.description}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]",
              chip.tone === "approved"
                ? "border-success/40 bg-success/10 text-success"
                : chip.tone === "changes"
                  ? "border-warning/40 bg-warning/10 text-warning"
                  : "border-white/15 bg-white/[0.03] text-white/75"
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: chip.tone === "pending" ? accent : "currentColor" }}
            />
            {chip.label}
          </span>

          {deliverable.url && (
            <div className="flex items-center gap-2">
              <a
                href={deliverable.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: accent }}
              >
                Open
              </a>
              <a
                href={deliverable.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                Review
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
