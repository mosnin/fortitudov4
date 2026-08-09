import { currentUser } from "@clerk/nextjs/server";
import { AppShell, type ShellNavItem } from "@/components/shell/app-shell";

const navItems: ShellNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    section: "Workspace",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: "FolderKanban",
    section: "Workspace",
  },
  {
    label: "Messages",
    href: "/messages",
    icon: "MessageSquare",
    section: "Workspace",
  },
  {
    label: "Weekly Reports",
    href: "/reports",
    icon: "ClipboardCheck",
    section: "Workspace",
  },
  {
    label: "Payments",
    href: "/payments",
    icon: "CreditCard",
    section: "Workspace",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
    section: "Workspace",
  },
  {
    label: "Guides",
    href: "/guides",
    icon: "BookOpen",
    section: "Learn",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "Bell",
    section: "Account",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    section: "Account",
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <AppShell
      navItems={navItems}
      cta={{ label: "New Project", href: "/services" }}
      accountEmail={user?.emailAddresses[0]?.emailAddress}
    >
      {children}
    </AppShell>
  );
}
