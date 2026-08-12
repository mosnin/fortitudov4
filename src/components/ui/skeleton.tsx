import { cn } from "@/lib/utils";

/**
 * The one shimmer placeholder. Every loading state in the product is built
 * from this — `RecordListSkeleton` and `StatStripSkeleton` in the kit included
 * — so a page mid-load reads as one surface rather than three different greys.
 *
 * The list and stat-tile skeletons that used to live here as well have been
 * dropped: they were second copies of the kit's, drawn at a different radius,
 * and a loading state that does not match the thing it is loading is worse
 * than no loading state at all. Use `RecordListSkeleton` / `StatStripSkeleton`
 * from `@/components/crm`.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
