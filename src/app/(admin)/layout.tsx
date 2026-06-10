import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { isViewingAsClient } from "@/lib/view-as";
import { AdminNav } from "@/components/dashboard/admin-nav";
import { ViewAsToggle } from "@/components/dashboard/view-as-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Provision the user row on first visit, then gate on role — never depend on
  // the Clerk webhook for the row to exist.
  const user = await getOrCreateCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Agency staff (owners + team members) get in; clients are bounced.
  if (user.role !== "admin" && user.role !== "team") {
    redirect("/dashboard");
  }
  // While a staff member is "viewing as a client", the admin surface is hidden
  // so the experience is faithful — Exit (in the client banner) brings it back.
  if (await isViewingAsClient()) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-charcoal-dark dark:bg-charcoal-dark">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-charcoal/80 backdrop-blur-2xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                alt="Fortitudo"
                width={30}
                height={30}
                className="rounded-full"
              />
              <span className="font-brand font-bold text-white hidden sm:inline">Fortitudo</span>
              <span className="rounded-full border border-orange/30 bg-orange/10 px-2 py-0.5 text-[11px] font-medium text-orange">
                Studio
              </span>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-2">
            <ViewAsToggle />
            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
