import { Skeleton } from "@/components/ui/skeleton";

// Shown while a dashboard page's server data streams in — keeps navigation
// feeling instant instead of blank.
export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-40 rounded-3xl sm:h-44" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}
