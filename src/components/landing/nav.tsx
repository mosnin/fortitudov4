"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

const LOGO_SRC =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png";

interface NavItem {
  label: string;
  href: string;
  description: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Services",
    items: [
      { label: "Web Applications", href: "/services#web-application", description: "Custom software, built to scale" },
      { label: "Ecommerce Stores", href: "/services#ecommerce-store", description: "Storefronts that convert" },
      { label: "Funnels", href: "/services#funnels", description: "Landing pages & sales funnels" },
      { label: "AI Automation", href: "/services#ai-automation", description: "Workflows that run themselves" },
      { label: "Open Claw Deployment", href: "/services#open-claw-deployment", description: "Managed agent infrastructure" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About Us", href: "/about", description: "Who we are and how we work" },
      { label: "Portfolio", href: "/portfolio", description: "Recent client work" },
      { label: "Pricing", href: "/pricing", description: "Fixed, transparent plans" },
      { label: "Contact", href: "/contact", description: "Talk to a builder" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "FAQ", href: "/faq", description: "Common questions, answered" },
      { label: "How It Works", href: "/#how-it-works", description: "Our process, explained" },
      { label: "Privacy Policy", href: "/privacy", description: "How we handle your data" },
      { label: "Terms of Service", href: "/terms", description: "The fine print" },
    ],
  },
];

function Dropdown({
  items,
  isOpen,
  onClose,
}: {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 z-50 mt-3 w-[440px] -translate-x-1/2 rounded-2xl border border-white/10 bg-charcoal p-2 shadow-2xl shadow-black/40 animate-fade-in"
    >
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <p className="text-sm font-medium text-cream">{item.label}</p>
            <p className="mt-0.5 text-xs text-cream/50">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LandingNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-40 bg-cream px-4 py-2.5 text-center">
        <p className="text-xs tracking-wide text-ink-soft">
          Now booking new builds for{" "}
          <span className="font-semibold text-orange">Q3 2026</span> — limited
          slots.{" "}
          <Link
            href="/contact"
            className="font-medium text-orange underline-offset-2 hover:underline"
          >
            Reserve yours →
          </Link>
        </p>
      </div>

      {/* Sticky nav bar */}
      <div className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <header className="mx-auto flex h-[60px] max-w-6xl items-center justify-between rounded-2xl bg-ink/95 pr-2.5 pl-4 shadow-lg shadow-black/10 backdrop-blur-md sm:pl-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={LOGO_SRC}
              alt="Fortitudo Agency"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight text-orange">
              Fortitudo
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === group.label ? null : group.label)
                  }
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-lg px-3.5 py-2 text-sm transition-colors",
                    openMenu === group.label
                      ? "text-cream"
                      : "text-cream/70 hover:text-cream"
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      openMenu === group.label && "rotate-180"
                    )}
                  />
                </button>
                <Dropdown
                  items={group.items}
                  isOpen={openMenu === group.label}
                  onClose={() => setOpenMenu(null)}
                />
              </div>
            ))}
            <Link
              href="/portfolio"
              className="rounded-lg px-3.5 py-2 text-sm text-cream/70 transition-colors hover:text-cream"
            >
              Customers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className="hidden h-10 items-center rounded-xl border border-white/15 px-4 text-sm font-medium text-cream transition-colors hover:bg-white/10 sm:inline-flex"
                >
                  Log in
                </Link>
                <Link
                  href="/services"
                  className="hidden h-10 items-center gap-1.5 rounded-xl bg-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-dark sm:inline-flex"
                >
                  Get started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="hidden h-10 items-center rounded-xl bg-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-dark sm:inline-flex"
              >
                Dashboard
              </Link>
            )}
            <button
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-cream transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ink shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src={LOGO_SRC}
                  alt="Fortitudo"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
                <span className="font-bold text-orange">Fortitudo</span>
              </Link>
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-cream hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {navGroups.map((group) => (
                <div key={group.label} className="mb-5">
                  <p className="px-2 pb-2 text-xs font-semibold tracking-widest text-cream/40 uppercase">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-xl px-2 py-2.5 transition-colors hover:bg-white/5"
                      >
                        <p className="text-sm font-medium text-cream">
                          {item.label}
                        </p>
                        <p className="text-xs text-cream/50">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-white/10 p-4">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-cream hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-orange text-sm font-semibold text-white hover:bg-orange-dark"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-orange text-sm font-semibold text-white hover:bg-orange-dark"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
