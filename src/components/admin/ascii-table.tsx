import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";

// ── Studio-grade admin primitives ───────────────────────────────────────────
// Tables and panels that carry the same ASCII signature as the rest of the
// product: charcoal glass, the dot-field motif, brand-ramp rules, and
// terminal-style monospace column headers.

// The brand "ramp" used by the ASCII field, repeated as a hairline rule.
const RAMP = " .·:-=+*≡#%@=*+-:·. ";

/** A faint, decorative ASCII rule line (no semantics). */
export function AsciiRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none overflow-hidden whitespace-nowrap font-mono text-[10px] leading-none text-orange/25",
        className
      )}
    >
      {RAMP.repeat(120)}
    </div>
  );
}

/** Page masthead with the signature animated ASCII field. */
export function AdminMast({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
      <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">{eyebrow}</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm text-white/60">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/** A compact stat tile. */
export function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "orange" | "success" | "warning";
}) {
  const accentClass =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : accent === "orange"
          ? "text-orange"
          : "text-foreground";
  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <p className={cn("font-brand text-3xl tabular-nums", accentClass)}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type PillTone = "orange" | "success" | "warning" | "muted";

/** Status pill matching the studio palette. */
export function StatusPill({ children, tone = "muted" }: { children: ReactNode; tone?: PillTone }) {
  const tones: Record<PillTone, string> = {
    orange: "border-orange/30 bg-orange/10 text-orange",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    muted: "border-border/60 bg-background/40 text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export type Column<T> = {
  header: string;
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
};

/** A glass data table with terminal-style headers and an ASCII header rule. */
export function DataTable<T,>({
  title,
  count,
  columns,
  rows,
  getKey,
  empty = "Nothing here yet.",
}: {
  title?: string;
  count?: number;
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
      {title && (
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
              {title}
            </h2>
            {count !== undefined && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {String(count).padStart(2, "0")}
              </span>
            )}
          </div>
          <AsciiRule className="mt-3" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
                    c.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getKey(row)}
                  className="border-b border-border/40 transition-colors last:border-0 hover:bg-orange/[0.04]"
                >
                  {columns.map((c, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-5 py-3.5 align-middle",
                        c.align === "right" ? "text-right tabular-nums" : "text-left"
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
