import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { agencyClients, users, weeklyReports } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  // Read-only: Helix answers questions about the client's own engagement and
  // cannot change anything. Requests go to a person, in Messages.
  {
    label: "Ask Helix",
    href: "/helix",
    icon: "Sparkles",
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
  // Gadgets the agency built and deliberately shared. Named "Tools" here —
  // "gadget" is agency-side vocabulary the client has no reason to learn.
  {
    label: "Tools",
    href: "/tools",
    icon: "Boxes",
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

  // Weekly reports exist for digital-marketing engagements only — the nav
  // entry appears only for clients who actually have them.
  let nav = navItems;
  if (user) {
    const [report] = await db
      .select({ id: weeklyReports.id })
      .from(weeklyReports)
      .innerJoin(agencyClients, eq(weeklyReports.clientId, agencyClients.id))
      .innerJoin(users, eq(agencyClients.userId, users.id))
      .where(eq(users.clerkId, user.id))
      .limit(1);
    if (report) {
      const at = navItems.findIndex((i) => i.href === "/messages") + 1;
      nav = [
        ...navItems.slice(0, at),
        {
          label: "Weekly Reports",
          href: "/reports",
          icon: "ClipboardCheck",
          section: "Workspace",
        },
        ...navItems.slice(at),
      ];
    }
  }

  return (
    <AppShell
      navItems={nav}
      cta={{ label: "New Project", href: "/services" }}
      accountEmail={user?.emailAddresses[0]?.emailAddress}
    >
      {children}
    </AppShell>
  );
}
