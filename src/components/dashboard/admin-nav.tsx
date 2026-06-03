"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-orange/15 text-orange font-medium ring-1 ring-inset ring-orange/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
