import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { agencyClients, users, weeklyReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isPartner } from "@/lib/permissions";
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

  /* Partners get their own surface, not this one.
     This layout has never had a role guard — every page under it enforces its
     own access, so a signed-in stranger saw the client chrome and empty pages
     rather than data. That was survivable while the only two logins were staff
     and clients. A partner is neither: they would get the client portal's nav,
     its "New Project" call to action and its Projects/Messages/Payments
     sections, none of which mean anything for someone whose relationship with
     us is a queue of jobs. */
  if (user) {
    const [row] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);
    if (row && isPartner(row.role)) redirect("/partner");
  }

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
