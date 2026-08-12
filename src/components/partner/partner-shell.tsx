"use client";

/**
 * The /partner chrome.
 *
 * Same object as `components/shell/app-shell.tsx` — floating rounded sidebar,
 * 13px nav rows on `h-9 rounded-md`, a 2px foreground bar on the active row, a
 * borderless sticky topbar, one primary pill — because a partner should not be
 * looking at a third style of product chrome.
 *
 * It is a separate component rather than `AppShell` with different nav config
 * for one reason: `AppShell` hard-mounts the command palette, global search and
 * the notification bell, with no prop to leave them off. The palette's entire
 * "Open" list is `/admin/*` — Clients, Tasks, Threads, Approvals — so ⌘K on the
 * partner surface would offer a third party the agency's own destinations, and
 * following one bounces them through the admin gate into the CLIENT portal.
 * Global search reads projects a partner has none of, and there are no partner
 * notifications. The right fix is a chrome switch on `AppShell` itself; that
 * file belongs to another agent, so this stays a sibling until it lands.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ClipboardList, FilePlus2, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PRIMARY_PILL } from "@/lib/typography";
import { cn } from "@/lib/utils";

/** Serializable, so the server layout owns the nav config. */
export interface PartnerNavItem {
  label: string;
  href: string;
  icon: "ClipboardList" | "FilePlus2";
}

const NAV_ICONS: Record<PartnerNavItem["icon"], LucideIcon> = {
  ClipboardList,
  FilePlus2,
};

/**
 * Most specific match wins.
 *
 * "Requests" owns `/partner` and everything under it, including a request's
 * detail page — but not `/partner/requests/new`, which is its own destination.
 * A plain prefix test lights both rows at once; the longest matching href
 * settles it without either entry needing an `exact` flag.
 */
function activeHref(items: PartnerNavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const item of items) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

function NavLink({ item, active }: { item: PartnerNavItem; active: boolean }) {
  const Icon = NAV_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={cn(
        "group/link relative flex h-9 items-center gap-2.5 rounded-md pr-2.5 pl-3 text-[13px] transition-colors duration-150",
        active
          ? "bg-foreground/[0.045] font-medium text-foreground"
          : "text-foreground/65 hover:bg-foreground/[0.025] hover:text-foreground"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-foreground"
        />
      )}
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0 transition-colors",
          active
            ? "text-foreground"
            : "text-foreground/55 group-hover/link:text-foreground"
        )}
        strokeWidth={active ? 2.25 : 1.75}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function BottomTab({ item, active }: { item: PartnerNavItem; active: boolean }) {
  const Icon = NAV_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate px-1">{item.label}</span>
    </Link>
  );
}

export function PartnerShell({
  navItems,
  accountEmail,
  cta,
  children,
}: {
  navItems: PartnerNavItem[];
  accountEmail?: string;
  cta?: { label: string; href: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = activeHref(navItems, pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-3 z-40 m-3 hidden h-[calc(100vh-1.5rem)] w-[244px] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-sidebar lg:flex">
        <Link
          href="/partner"
          className="flex h-16 shrink-0 items-center border-b border-border/70 px-5"
        >
          <Logo size={36} />
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={active === item.href}
              />
            ))}
          </div>
        </nav>

        {accountEmail && (
          <div className="flex shrink-0 items-center gap-2.5 border-t border-border px-4 py-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06] text-[11px] font-semibold text-foreground/70 uppercase">
              {accountEmail[0]}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.08em] text-muted-foreground/70 uppercase">
                Signed in
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {accountEmail}
              </p>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/partner" className="lg:hidden">
              <Logo size={26} />
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <span className="ml-0.5 flex items-center">
                <UserButton />
              </span>
              {cta && (
                <Link
                  href={cta.href}
                  className={cn(PRIMARY_PILL, "ml-2 hidden sm:inline-flex")}
                >
                  {cta.label}
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 pb-28 sm:px-6 md:px-10 md:py-7 lg:px-12 lg:pb-12">
          {children}
        </main>

        <nav
          className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch justify-around">
            {navItems.map((item) => (
              <BottomTab
                key={item.href}
                item={item}
                active={active === item.href}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
