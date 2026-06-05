import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppDock } from "@/components/dashboard/app-dock";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { isViewingAsClient } from "@/lib/view-as";
import { ViewAsBanner } from "@/components/dashboard/view-as-banner";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateCurrentUser();
  const realStaff = user?.role === "admin" || user?.role === "team";
  const viewingAsClient = realStaff && (await isViewingAsClient());
  // In "view as client" mode, staff see the exact client surface — the
  // Agency-dashboard tile drops away and a banner offers the way back.
  const isStaff = realStaff && !viewingAsClient;

  return (
    <div className="min-h-screen bg-background dark:bg-charcoal-dark">
      {viewingAsClient && <ViewAsBanner />}
      <DashboardHeader />

      {/* Bottom padding so content clears the floating dock. */}
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 sm:pb-32 lg:px-8 lg:pb-36">
        {children}
      </main>

      {/* Persistent bottom dock + full-page launchpad (client component). */}
      <AppDock isStaff={isStaff} />
    </div>
  );
}
