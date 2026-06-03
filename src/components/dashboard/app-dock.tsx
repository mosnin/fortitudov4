"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import {
  Home,
  FolderKanban,
  MessageSquare,
  LayoutGrid,
  Plus,
  X,
  Bell,
  Settings,
  Code2,
  ShoppingCart,
  Bot,
  Server,
  type LucideIcon,
} from "lucide-react";

// ── Dock items ──────────────────────────────────────────────────────────────
// Real routes only. Verified to exist under src/app/(dashboard)/ and
// src/app/onboarding. The center "New Brief" is the prominent orange action.
type DockItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
};

const dockItems: DockItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Builds", href: "/projects", icon: FolderKanban },
  { label: "New Brief", href: "/onboarding", icon: Plus, accent: true },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

// ── Launchpad tiles ─────────────────────────────────────────────────────────
// Every real destination in the studio app, with a one-line description.
type Tile = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  highlight?: boolean;
};

const launchpadTiles: Tile[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Your studio at a glance — builds, blueprints, decisions.",
  },
  {
    label: "Builds",
    href: "/projects",
    icon: FolderKanban,
    description: "Every project we're architecting and shipping for you.",
  },
  {
    label: "New Brief",
    href: "/onboarding",
    icon: Plus,
    description: "Start something new — we turn it into a Blueprint.",
    highlight: true,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    description: "Talk directly with your architect.",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "Phase updates, deliverables, and decisions.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account, profile, and workspace preferences.",
  },
];

// The four building disciplines — flavor, not routes. The actionable path is
// always "New Brief".
const disciplines: { label: string; icon: LucideIcon }[] = [
  { label: "Software", icon: Code2 },
  { label: "Commerce", icon: ShoppingCart },
  { label: "AI", icon: Bot },
  { label: "Infrastructure", icon: Server },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppDock() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the launchpad is open (mirrors the header sidebar).
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* ── Floating bottom dock ── */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-3 w-auto max-w-[calc(100%-1rem)]">
        <div className="flex items-center gap-1 rounded-3xl border border-border/60 bg-background/80 px-2 py-2 shadow-lg shadow-black/20 backdrop-blur-xl sm:gap-2 sm:px-3">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            if (item.accent) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className="group flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-orange text-white shadow-md shadow-orange/30 transition-all duration-200 group-hover:bg-orange-dark group-hover:scale-105 sm:h-14 sm:w-14",
                      active && "ring-2 ring-orange/50 ring-offset-2 ring-offset-background"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="hidden text-[11px] font-medium text-orange sm:block">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="group flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200 sm:h-12 sm:w-12",
                    active
                      ? "bg-orange/10 text-orange"
                      : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] sm:block",
                    active ? "font-medium text-orange" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <span className="mx-0.5 h-8 w-px bg-border/60" aria-hidden="true" />

          {/* Apps / Menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open apps menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="group flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200 sm:h-12 sm:w-12",
                menuOpen
                  ? "bg-orange/10 text-orange"
                  : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </span>
            <span
              className={cn(
                "hidden text-[11px] sm:block",
                menuOpen ? "font-medium text-orange" : "text-muted-foreground"
              )}
            >
              Apps
            </span>
          </button>
        </div>
      </div>

      {/* ── Full-page launchpad ── */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Apps menu"
          className="fixed inset-0 z-[100] animate-fade-in"
        >
          {/* Backdrop — charcoal + ASCII signature + radial orange glow */}
          <button
            type="button"
            aria-label="Close apps menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 cursor-default bg-charcoal-dark/95 backdrop-blur-xl"
          />
          <AsciiField className="pointer-events-none absolute inset-0 h-full w-full opacity-40" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(249,115,22,0.18),transparent_60%)]" />

          {/* Content */}
          <div className="animate-scale-in pointer-events-none relative flex h-full flex-col overflow-y-auto">
            {/* Header row */}
            <div className="pointer-events-auto flex items-center justify-between px-5 pt-6 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
                  Fortitudo // Studio
                </p>
                <h2 className="font-brand mt-1 text-2xl font-bold text-foreground">
                  Apps
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/40 text-foreground transition-colors hover:border-orange/50 hover:bg-background/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tile grid */}
            <div className="pointer-events-auto mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {launchpadTiles.map((tile) => {
                  const Icon = tile.icon;
                  const active = isActivePath(pathname, tile.href);
                  return (
                    <Link
                      key={tile.href}
                      href={tile.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "group relative flex flex-col gap-3 rounded-3xl border bg-card/70 p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-orange/50 hover:bg-card",
                        tile.highlight
                          ? "border-orange/40 bg-orange/[0.06]"
                          : "border-border/60",
                        active && "ring-1 ring-orange/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                          tile.highlight
                            ? "bg-orange text-white"
                            : "bg-orange/10 text-orange group-hover:bg-orange/20"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="font-brand text-lg font-bold text-foreground">
                          {tile.label}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tile.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Disciplines — flavor strip */}
              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  What we build
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {disciplines.map((d) => {
                    const Icon = d.icon;
                    return (
                      <span
                        key={d.label}
                        className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-3.5 py-2 text-sm text-muted-foreground"
                      >
                        <Icon className="h-4 w-4 text-orange" />
                        {d.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
