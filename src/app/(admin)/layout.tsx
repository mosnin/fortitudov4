import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppShell, type ShellNavItem } from "@/components/shell/app-shell";
import {
  isStaff,
  isPartner,
  canManageAgency,
  canManageLeads,
  canManagePartners,
  canViewAllProjects,
  ROLE_LABELS,
} from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user || !isStaff(user.role)) {
    /* Send them to their OWN surface, not the client portal. This used to be a
       bare redirect to /dashboard, which was right while there were only two
       kinds of person here — a partner typing /admin would have landed in the
       client portal, a place they have no rows in and no business being. */
    redirect(user && isPartner(user.role) ? "/partner" : "/dashboard");
  }

  // Role-gated nav, expressed as serializable config for the client shell.
  const navItems: ShellNavItem[] = [
    {
      label: "Overview",
      href: "/admin",
      icon: "LayoutDashboard",
      exact: true,
      section: "Operations",
    },
    ...(canViewAllProjects(user.role)
      ? [
          {
            label: "Clients",
            href: "/admin/clients",
            icon: "Users",
            section: "Operations",
          },
          {
            label: "Tasks",
            href: "/admin/tasks",
            icon: "ClipboardList",
            section: "Operations",
          },
        ]
      : []),
    ...(canManageLeads(user.role)
      ? [
          {
            label: "Leads",
            href: "/admin/leads",
            icon: "Inbox",
            section: "Operations",
          },
        ]
      : []),
    // Admin + PM only. A VA who types the URL is redirected by the partners
    // layout as well — the nav hides it, the guard enforces it.
    ...(canManagePartners(user.role)
      ? [
          {
            label: "Partners",
            href: "/admin/partners",
            icon: "Handshake",
            section: "Operations",
          },
        ]
      : []),
    {
      label: "Projects",
      href: "/admin/projects",
      icon: "FolderKanban",
      section: "Operations",
    },
    {
      label: "Messages",
      href: "/admin/messages",
      icon: "MessageSquare",
      section: "Operations",
    },
    // Helix's own surfaces. Threads is where work is asked for; Approvals is
    // where its changes wait — they go nowhere until someone reviews them.
    {
      label: "Threads",
      href: "/admin/helix",
      icon: "Sparkles",
      exact: true,
      section: "Helix",
    },
    {
      label: "Approvals",
      href: "/admin/helix/approvals",
      icon: "CheckCheck",
      section: "Helix",
    },
    {
      label: "Gadgets",
      href: "/admin/helix/gadgets",
      icon: "Boxes",
      section: "Helix",
    },
    {
      label: "Activity",
      href: "/admin/helix/activity",
      icon: "ScrollText",
      section: "Helix",
    },
    ...(canManageAgency(user.role)
      ? [
          {
            label: "Financials",
            href: "/admin/financials",
            icon: "BarChart3",
            section: "Finance",
          },
          {
            label: "Payments",
            href: "/admin/payments",
            icon: "CreditCard",
            section: "Finance",
          },
          {
            label: "Team",
            href: "/admin/team",
            icon: "UserCog",
            section: "Manage",
          },
        ]
      : []),
  ];

  return (
    <AppShell
      navItems={navItems}
      roleLabel={ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? "Staff"}
      accountEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
