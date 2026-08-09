"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";
import { PressButton } from "./press-button";

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
      { label: "Pricing", href: "/pricing", description: "Fixed, transparent plans" },
      { label: "Contact", href: "/contact", description: "Talk to a builder" },
      { label: "FAQ", href: "/faq", description: "Common questions, answered" },
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
      className="absolute top-full left-1/2 z-50 mt-2 w-[420px] -translate-x-1/2 rounded-[12px] border border-white/10 bg-panel p-1.5 shadow-2xl shadow-black/50 animate-fade-in"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="block rounded-[8px] px-3 py-2.5 transition-colors hover:bg-white/5"
        >
          <span className="block text-[14px] font-medium text-white">
            {item.label}
          </span>
          <span className="block text-[12px] text-white/50">
            {item.description}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function LandingNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Announcement banner — full-width orange, like the reference */}
        {bannerOpen && (
          <Link
            href="/contact"
            className="relative flex w-full items-center justify-center bg-orange px-10 py-2 text-center text-white transition-colors hover:bg-orange-hover"
          >
            <span className="text-[13px] tracking-[-0.015em] md:text-[14px]">
              Now Booking <span className="font-bold">Q3 2026</span> Builds |
              Limited Slots
            </span>
            <button
              type="button"
              aria-label="Dismiss banner"
              className="absolute right-3 cursor-pointer p-1 text-white/80 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setBannerOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </Link>
        )}

        {/* Nav bar — dark, hairline-bottomed */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-night/95 px-4 py-2 backdrop-blur-[6px] lg:px-6 xl:px-16">
          <Link href="/" className="flex h-[39px] shrink-0 items-center gap-2.5 px-1">
            <Image
              src={LOGO_SRC}
              alt="Fortitudo"
              width={26}
              height={26}
              className="rounded-[6px]"
            />
            <span className="text-[18px] font-bold tracking-[-0.02em] text-orange">
              Fortitudo
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
          >
            {navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === group.label ? null : group.label)
                  }
                  className={cn(
                    "flex h-[39px] cursor-pointer items-center gap-1 rounded-[12px] px-4 text-[15px] tracking-[-0.015em] transition-colors",
                    openMenu === group.label
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
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
              className="flex h-[39px] items-center rounded-[12px] px-4 text-[15px] tracking-[-0.015em] text-white/60 transition-colors hover:text-white"
            >
              Customers
            </Link>
            <Link
              href="/contact"
              className="flex h-[39px] items-center rounded-[12px] px-4 text-[15px] tracking-[-0.015em] text-white/60 transition-colors hover:text-white"
            >
              Book a call
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className="hidden items-center rounded-[12px] border border-white/20 px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-white/10 sm:inline-flex"
                >
                  Log in
                </Link>
                <div className="hidden sm:block">
                  <PressButton href="/services" size="md">
                    Get started
                  </PressButton>
                </div>
              </>
            ) : (
              <div className="hidden sm:block">
                <PressButton href="/dashboard" size="md">
                  Dashboard
                </PressButton>
              </div>
            )}
            <button
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] text-white transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for the fixed header */}
      <div className={bannerOpen ? "h-[93px]" : "h-[56px]"} />

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-night shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src={LOGO_SRC}
                  alt="Fortitudo"
                  width={26}
                  height={26}
                  className="rounded-[6px]"
                />
                <span className="font-bold text-orange">Fortitudo</span>
              </Link>
              <button
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[8px] text-white hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {navGroups.map((group) => (
                <div key={group.label} className="mb-5">
                  <p className="px-2 pb-2 font-mono text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-[8px] px-2 py-2.5 transition-colors hover:bg-white/5"
                      >
                        <span className="block text-[14px] font-medium text-white">
                          {item.label}
                        </span>
                        <span className="block text-[12px] text-white/50">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                href="/portfolio"
                onClick={() => setMobileOpen(false)}
                className="block rounded-[8px] px-2 py-2.5 text-[14px] font-medium text-white hover:bg-white/5"
              >
                Customers
              </Link>
            </div>

            <div className="space-y-2.5 border-t border-white/10 p-4">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center rounded-[12px] border border-white/20 py-2.5 text-[15px] font-medium text-white hover:bg-white/10"
                  >
                    Log in
                  </Link>
                  <PressButton href="/services" size="md" className="w-full">
                    Get started
                  </PressButton>
                </>
              ) : (
                <PressButton href="/dashboard" size="md" className="w-full">
                  Dashboard
                </PressButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
