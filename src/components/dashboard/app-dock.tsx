"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import {
  Home,
  FolderKanban,
  MessageSquare,
  LayoutGrid,
  Plus,
  X,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

// ── Dock items ──────────────────────────────────────────────────────────────
// Real routes only. Verified to exist under src/app/(dashboard)/. "New Brief"
// is the prominent orange action — the conversational intake.
type DockItem = { label: string; href: string; icon: LucideIcon };

const navItems: DockItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Builds", href: "/projects", icon: FolderKanban },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

// ── Launchpad tiles ─────────────────────────────────────────────────────────
type Tile = { label: string; href: string; description: string; highlight?: boolean };

const launchpadTiles: Tile[] = [
  { label: "Dashboard", href: "/dashboard", description: "Your studio at a glance — builds, blueprints, decisions." },
  { label: "Builds", href: "/projects", description: "Every project we're architecting and shipping for you." },
  { label: "New Brief", href: "/brief", description: "Start something new — we turn it into a Blueprint.", highlight: true },
  { label: "Messages", href: "/messages", description: "Talk directly with your architect." },
  { label: "Notifications", href: "/notifications", description: "Phase updates, deliverables, and decisions." },
  { label: "Settings", href: "/settings", description: "Account, profile, and workspace preferences." },
];

const disciplines = ["Software", "Commerce", "AI", "Infrastructure"];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppDock() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the launchpad is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const briefActive = isActivePath(pathname, "/brief");

  return (
    <>
      {/* ── Floating dark-glass dock ── */}
      <motion.nav
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-3"
        aria-label="Primary"
      >
        <LayoutGroup>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-charcoal/80 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/5 backdrop-blur-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors duration-200",
                    active ? "text-orange" : "text-white/60 hover:text-white"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="dock-active"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="absolute inset-0 -z-10 rounded-full bg-orange/15 ring-1 ring-inset ring-orange/30"
                    />
                  )}
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* New Brief — the hero action */}
            <Link
              href="/brief"
              aria-label="New Brief"
              aria-current={briefActive ? "page" : undefined}
              className={cn(
                "ml-0.5 flex items-center gap-1.5 rounded-full bg-orange px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition-all duration-200 hover:bg-orange-dark hover:shadow-orange/40",
                briefActive && "ring-2 ring-white/30"
              )}
            >
              <Plus className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">New Brief</span>
            </Link>

            <span className="mx-0.5 h-6 w-px bg-white/10" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open apps menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="flex items-center justify-center rounded-full px-3 py-2.5 text-white/60 transition-colors duration-200 hover:text-white"
            >
              <LayoutGrid className="h-[18px] w-[18px]" />
            </button>
          </div>
        </LayoutGroup>
      </motion.nav>

      {/* ── Full-page launchpad ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Apps menu"
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              aria-label="Close apps menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 cursor-default bg-charcoal-dark/95 backdrop-blur-xl"
            />
            <AsciiField className="pointer-events-none absolute inset-0 h-full w-full opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(249,115,22,0.16),transparent_60%)]" />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none relative flex h-full flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="pointer-events-auto flex items-center justify-between px-5 pt-7 sm:px-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-orange/80">
                    Fortitudo // Studio
                  </p>
                  <h2 className="font-brand mt-1 text-3xl text-white sm:text-4xl">Everything</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Typographic tiles — no decorative icon badges */}
              <div className="pointer-events-auto mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-10">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {launchpadTiles.map((tile, i) => {
                    const active = isActivePath(pathname, tile.href);
                    return (
                      <Link
                        key={tile.href}
                        href={tile.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "group relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1",
                          tile.highlight
                            ? "border-orange/40 bg-orange/[0.07] hover:bg-orange/[0.12]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
                          active && "ring-1 ring-orange/40"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={cn(
                              "font-brand text-sm tabular-nums",
                              tile.highlight ? "text-orange" : "text-white/40"
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <ArrowUpRight
                            className={cn(
                              "h-5 w-5 -translate-y-0.5 translate-x-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
                              tile.highlight ? "text-orange" : "text-white"
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="font-brand text-2xl text-white">{tile.label}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                            {tile.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">What we build</p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {disciplines.map((d) => (
                      <span key={d} className="font-brand text-xl text-white/70">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
