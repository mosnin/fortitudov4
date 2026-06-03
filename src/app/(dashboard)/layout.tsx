import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppDock } from "@/components/dashboard/app-dock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background dark:bg-charcoal-dark">
      <DashboardHeader />

      {/* Bottom padding so content clears the floating dock. */}
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 sm:pb-32 lg:px-8 lg:pb-36">
        {children}
      </main>

      {/* Persistent bottom dock + full-page launchpad (client component). */}
      <AppDock />
    </div>
  );
}
