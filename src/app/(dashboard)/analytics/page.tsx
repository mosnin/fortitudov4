import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance metrics for your launched projects.
        </p>
      </div>

      <AnalyticsOverview />
    </div>
  );
}
