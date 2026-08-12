import { currentUser } from "@clerk/nextjs/server";
import { PartnerShell, type PartnerNavItem } from "@/components/partner/partner-shell";
import { requirePartnerAccess } from "./access";

/**
 * The fourth surface's shell.
 *
 * The gate runs here AND in every page: a layout does not re-run on a client
 * navigation between two of its own pages, so it is chrome, not a lock.
 *
 * The nav is two destinations and no more. A partner has no clients, no leads,
 * no finance and no CRM — see plans/partners.md — so there is nothing else to
 * put in it, and inventing entries to fill the sidebar would be inventing
 * access.
 */
const navItems: PartnerNavItem[] = [
  { label: "Requests", href: "/partner", icon: "ClipboardList" },
  { label: "New request", href: "/partner/requests/new", icon: "FilePlus2" },
];

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePartnerAccess();
  const user = await currentUser();

  return (
    <PartnerShell
      navItems={navItems}
      cta={{ label: "New request", href: "/partner/requests/new" }}
      accountEmail={user?.emailAddresses[0]?.emailAddress}
    >
      {children}
    </PartnerShell>
  );
}
