'use client';

/**
 * The hairline stat strip — the CRM reference's PerformanceStrip vocabulary:
 * a rounded, bordered card whose cells are separated by a 1px gap over the
 * border colour, each cell a SECTION_LABEL over a serif-Times focal number.
 *
 * When a metric has no data the cell renders a calm fact, never a misleading
 * zero. Focal numbers are the scarce serif flourish; everything else is sans.
 */

import { SECTION_LABEL, STAT_NUMBER } from '@/lib/typography';
import { StaggerReveal } from '@/components/motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function StatStrip({
  children,
  columns = 3,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
  ariaLabel?: string;
}) {
  const cols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-3';
  return (
    <section aria-label={ariaLabel}>
      <StaggerReveal
        className={cn(
          'grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60',
          cols,
          className
        )}
      >
        {children}
      </StaggerReveal>
    </section>
  );
}

export function StatCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background px-4 py-4">
      <p className={SECTION_LABEL}>{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** Focal stat number — serif Times, the type scale's loud note. */
export function Stat({
  children,
  suffix,
}: {
  children: React.ReactNode;
  suffix?: string;
}) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className={STAT_NUMBER} style={{ fontFamily: 'var(--font-title)' }}>
        {children}
      </span>
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </p>
  );
}

/** A calm sentence in place of a misleading zero. */
export function StatEmpty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/** Secondary line under a focal number. */
export function StatMeta({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs tabular-nums text-muted-foreground">{children}</p>
  );
}

/** Loading state that mirrors the strip's own geometry. */
export function StatStripSkeleton({ columns = 3 }: { columns?: 2 | 3 | 4 }) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-3";
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60",
        cols
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="space-y-3 bg-background px-4 py-4">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}
