import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Minimal, backgroundless top strip. Navigation lives in the dock; up here we
// keep only the wordmark and round utility controls, floating over the page.
export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <header className="mx-auto max-w-7xl">
        <div className="flex h-12 items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
              alt="Fortitudo"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="font-brand text-base font-bold text-foreground hidden sm:inline">
              Fortitudo
            </span>
          </Link>
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
