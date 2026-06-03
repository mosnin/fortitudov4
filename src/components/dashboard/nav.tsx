"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Builds", href: "/projects" },
  { label: "Messages", href: "/messages" },
  { label: "Analytics", href: "/analytics" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <LayoutGroup>
      <nav className="hidden items-center gap-0.5 md:flex">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
                active ? "text-orange" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", stiffness: 480, damping: 38 }}
                  className="absolute inset-0 -z-10 rounded-full bg-orange/15 ring-1 ring-inset ring-orange/30"
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
