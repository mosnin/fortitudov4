import { cn } from "@/lib/utils";

/** Quiet placeholder block while real content streams in. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-foreground/[0.06]", className)} />;
}
