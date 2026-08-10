import { cn } from "@/lib/utils";

/** Shimmer placeholder used while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

/**
 * Stat-tile skeleton. Mirrors the hairline stat band: label, focal number,
 * caption — no icon chip, since the real tile has none (design-product.md).
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

/**
 * List skeleton. Mirrors the `divide-y divide-border/60` row vocabulary at the
 * same `py-3` rhythm, so the loading state has the shape of the real list.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3.5 w-16 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
