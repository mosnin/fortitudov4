"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { activeHref, type ShellNavItem } from "./nav";
import { springSnappy } from "@/lib/motion";
import { PRIMARY_PILL } from "@/lib/typography";
import {
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";

/* The nav config and the active-row rule live in `nav.ts` — pure, so they can
   be tested without React. Re-exported here so layouts keep one import. */
export type { ShellNavItem };

/**
 * Which pieces of chrome this surface gets.
 *
 * Every one defaults to what the product portals already had, so a layout that
 * says nothing keeps today's shell. A surface that should not have a piece —
 * the partner portal, which is a third party inside our product — turns it off
 * here rather than growing a second copy of this file, which is what happened
 * the last time there was no switch.
 */
export interface ShellChrome {
  /** ⌘K over this surface's own destinations. */
  palette?: boolean;
  /** Topbar search across projects, messages and files. */
  search?: boolean;
  /** Topbar notification bell. */
  notifications?: boolean;
  /**
   * The palette's staff-only content: Helix's "Do" actions and the agency CRM
   * search. Off by default — it is the agency's own internals, and a surface
   * that forgets to mention it must get the safe answer.
   */
  staffCommands?: boolean;
}

const DEFAULT_CHROME: Required<ShellChrome> = {
  palette: true,
  search: true,
  notifications: true,
  staffCommands: false,
};

interface AppShellProps {
  navItems: ShellNavItem[];
  /** Small chip next to the wordmark, e.g. "Admin" / "Project Manager". */
  roleLabel?: string;
  /** Primary CTA in the topbar. */
  cta?: { label: string; href: string };
  /** Account line pinned at the sidebar bottom. */
  accountEmail?: string;
  /** Where the sidebar logo goes. Defaults to the marketing home. */
  homeHref?: string;
  /** Opt individual pieces of chrome out; see `ShellChrome`. */
  chrome?: ShellChrome;
  children: React.ReactNode;
}

function NavIcon({
  name,
  className,
  active,
}: {
  name: string;
  className?: string;
  active?: boolean;
}) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;
  return <Icon className={className} strokeWidth={active ? 2.25 : 1.75} />;
}

function NavLink({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: ShellNavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group/link relative rounded-md text-[13px] transition-colors duration-150",
        collapsed
          ? "mx-auto flex h-10 w-10 items-center justify-center"
          : "flex h-9 items-center gap-2.5 pr-2.5 pl-3",
        isActive
          ? "bg-foreground/[0.045] font-medium text-foreground"
          : "text-foreground/65 hover:bg-foreground/[0.025] hover:text-foreground"
      )}
      title={collapsed ? item.label : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          transition={springSnappy}
          className="absolute inset-0 rounded-md bg-foreground/[0.045]"
        />
      )}
      {/* 2px foreground bar on the live route's left edge — never a tint. */}
      {isActive && !collapsed && (
        <motion.span
          layoutId="nav-tick"
          transition={springSnappy}
          className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-foreground"
        />
      )}
      <NavIcon
        name={item.icon}
        active={isActive}
        className={cn(
          "relative h-[15px] w-[15px] shrink-0 transition-colors",
          isActive ? "text-foreground" : "text-foreground/55 group-hover/link:text-foreground"
        )}
      />
      {!collapsed && <span className="relative truncate">{item.label}</span>}
      {isActive && collapsed && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-foreground" />
      )}
    </Link>
  );
}


/** Group consecutive items by their section label. */
function groupNav(navItems: ShellNavItem[]) {
  const groups: { section?: string; items: ShellNavItem[] }[] = [];
  for (const item of navItems) {
    const last = groups[groups.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }
  return groups;
}

function SidebarBody({
  navItems,
  active,
  collapsed,
  accountEmail,
  homeHref,
  onNavigate,
}: {
  navItems: ShellNavItem[];
  active: string | null;
  collapsed: boolean;
  accountEmail?: string;
  homeHref: string;
  onNavigate?: () => void;
}) {
  const groups = groupNav(navItems);

  return (
    <>
      {/* Logo band — plain hairline close. */}
      <Link
        href={homeHref}
        className={cn(
          "relative flex h-16 shrink-0 items-center border-b border-border/70",
          collapsed ? "justify-center px-2" : "px-5"
        )}
        onClick={onNavigate}
      >
        <Logo size={collapsed ? 26 : 36} className="relative" />
      </Link>

      {/* Nav — grouped under mono micro-labels; collapsed mode swaps headers
          for hairline separators. */}
      <nav className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        {groups.map((group, gi) => (
          <div key={group.section ?? gi} className={cn(gi > 0 && "mt-4")}>
            {group.section && !collapsed && (
              <p className="px-3 pb-1.5 text-[10px] leading-tight tracking-[0.08em] text-muted-foreground/70 uppercase">{group.section}</p>
            )}
            {group.section && collapsed && gi > 0 && (
              <span className="mx-auto mb-3 block h-px w-6 bg-border" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={active === item.href}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Account — orange monogram chip over a hairline, mono email. */}
      {accountEmail && (
        <div
          className={cn(
            "flex shrink-0 items-center border-t border-border",
            collapsed ? "justify-center px-2 py-3" : "gap-2.5 px-4 py-3.5"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/[0.06] text-[11px] font-semibold text-foreground/70 uppercase">
            {accountEmail[0]}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.08em] text-muted-foreground/70 uppercase">Signed in</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {accountEmail}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function AppShell({
  navItems,
  cta,
  accountEmail,
  homeHref = "/",
  chrome,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const active = activeHref(navItems, pathname);
  const { palette, search, notifications, staffCommands } = {
    ...DEFAULT_CHROME,
    ...chrome,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ⌘K from anywhere in the product. Mounted once, at the shell, over the
          same nav this surface is already showing. */}
      {palette && (
        <CommandPalette destinations={navItems} staffCommands={staffCommands} />
      )}
      {/* Desktop sidebar — floating white card with a soft shadow */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 244 }}
        transition={springSnappy}
        className="sticky top-3 z-40 m-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-sidebar lg:flex"
      >
        <SidebarBody
          navItems={navItems}
          active={active}
          collapsed={collapsed}
          accountEmail={accountEmail}
          homeHref={homeHref}
        />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex cursor-pointer items-center gap-2 border-t border-border/70 py-3 text-[10px] tracking-[0.08em] text-muted-foreground/70 uppercase transition-colors hover:bg-foreground/[0.025] hover:text-foreground",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronsLeft className="h-3.5 w-3.5" /> Collapse
            </>
          )}
        </button>
      </motion.aside>

      {/* Mobile navigation — bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={springSnappy}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 500) {
                  setMobileOpen(false);
                }
              }}
              /* `bg-sidebar` in both themes — the sheet IS the sidebar. It was
                 a literal `bg-white` with a `dark:` escape hatch, which is the
                 one surface in the shell that could not follow a token. */
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-border/60 bg-sidebar shadow-[0_-8px_40px_-12px_rgba(15,16,16,0.25)]"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {/* Grab handle */}
              <div className="flex justify-center pb-1 pt-3">
                <span className="h-1.5 w-10 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-2 pt-1">
                <Logo size={30} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-muted-foreground"
                  )}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav */}
              <nav className="grid grid-cols-2 gap-2 overflow-y-auto p-4">
                {navItems.map((item) => (
                  <SheetNavLink
                    key={item.href}
                    item={item}
                    isActive={active === item.href}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              {accountEmail && (
                <p className="truncate border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
                  {accountEmail}
                </p>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar — borderless and shadowless; the page header draws the first
            hairline. Controls read as quiet ghosts, the CTA as the one pill. */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "text-muted-foreground lg:hidden"
                )}
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {search && <GlobalSearch />}
              {notifications && <NotificationBell />}
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

        {/* Bottom tab bar (mobile) — floating white card, first five destinations */}
        <nav
          className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch justify-around">
            {navItems.slice(0, 5).map((item) => (
              <BottomTab
                key={item.href}
                item={item}
                isActive={active === item.href}
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

/** Bottom-sheet tile — icon + label card. */
function SheetNavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: ShellNavItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-medium transition-colors",
        isActive
          ? "border-foreground/20 bg-foreground/[0.06] text-foreground"
          : "border-border text-foreground hover:bg-muted/70"
      )}
    >
      <NavIcon name={item.icon} active={isActive} className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function BottomTab({
  item,
  isActive,
}: {
  item: ShellNavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <NavIcon name={item.icon} active={isActive} className="h-5 w-5" />
      <span className="truncate px-1">{item.label}</span>
    </Link>
  );
}
