"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Globe,
  ShoppingCart,
  TrendingUp,
  Bot,
  Server,
  ChevronDown,
  CreditCard,
  FolderKanban,
  Users,
  Phone,
  HelpCircle,
  Shield,
  FileText,
  Briefcase,
} from "lucide-react";

interface MegaMenuSection {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const servicesItems: MegaMenuSection[] = [
  { label: "Web Applications", href: "/services#web-application", icon: Globe, description: "Custom web apps built to scale" },
  { label: "Ecommerce Stores", href: "/services#ecommerce-store", icon: ShoppingCart, description: "High-converting online stores" },
  { label: "Funnels", href: "/services#funnels", icon: TrendingUp, description: "Sales funnels that convert" },
  { label: "AI Automation", href: "/services#ai-automation", icon: Bot, description: "Automate with AI workflows" },
  { label: "Open Claw Deployment", href: "/services#open-claw-deployment", icon: Server, description: "Deploy & manage Open Claw" },
];

const companyItems: MegaMenuSection[] = [
  { label: "About Us", href: "/about", icon: Users, description: "Our mission and values" },
  { label: "Portfolio", href: "/portfolio", icon: FolderKanban, description: "See our past work" },
  { label: "Pricing", href: "/pricing", icon: CreditCard, description: "Transparent pricing plans" },
  { label: "Contact", href: "/contact", icon: Phone, description: "Get in touch with us" },
];

const resourceItems: MegaMenuSection[] = [
  { label: "FAQ", href: "/faq", icon: HelpCircle, description: "Common questions answered" },
  { label: "How It Works", href: "/#how-it-works", icon: Briefcase, description: "Our process explained" },
  { label: "Privacy Policy", href: "/privacy", icon: Shield, description: "How we handle your data" },
  { label: "Terms of Service", href: "/terms", icon: FileText, description: "Service agreement" },
];

interface MegaMenuDropdownProps {
  items: MegaMenuSection[];
  isOpen: boolean;
  onClose: () => void;
}

function MegaMenuDropdown({ items, isOpen, onClose }: MegaMenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] rounded-xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-xl animate-fade-in z-50"
    >
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange/10 group-hover:bg-orange/20 transition-colors">
                <Icon className="h-4 w-4 text-orange" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const navGroups = [
  { label: "Services", items: servicesItems },
  { label: "Company", items: companyItems },
  { label: "Resources", items: resourceItems },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
            alt="Fortitudo Agency"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="text-lg font-bold text-foreground">Fortitudo</span>
        </Link>

        {/* Desktop Mega Menu Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === group.label ? null : group.label)
                }
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                  openMenu === group.label
                    ? "text-orange bg-orange/5"
                    : "text-muted-foreground hover:text-foreground"
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
              <MegaMenuDropdown
                items={group.items}
                isOpen={openMenu === group.label}
                onClose={() => setOpenMenu(null)}
              />
            </div>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isSignedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="glow" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-foreground cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-6 lg:hidden max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-4 w-4 text-orange" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
              {!isSignedIn ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button variant="glow" asChild>
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
