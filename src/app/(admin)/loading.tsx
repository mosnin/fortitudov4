import { Skeleton } from "@/components/ui/skeleton";

// Streaming placeholder for admin pages (dark shell).
export default function AdminLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-36 rounded-3xl bg-white/[0.05]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-3xl bg-white/[0.05] lg:col-span-1" />
        <Skeleton className="h-44 rounded-3xl bg-white/[0.05] lg:col-span-2" />
      </div>
      <Skeleton className="h-56 rounded-3xl bg-white/[0.05]" />
    </div>
  );
}
