import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { DashboardNav } from "@/components/dashboard/nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Floating pill-style header, matching the marketing site.
export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <header className="mx-auto max-w-7xl rounded-2xl border border-border/60 bg-background/70 shadow-lg shadow-black/20 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-5">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                alt="Fortitudo"
                width={30}
                height={30}
                className="rounded-md"
              />
              <span className="font-brand text-base font-bold hidden sm:inline">Fortitudo</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <GlobalSearch />
            <NotificationBell />
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>
    </div>
  );
}
