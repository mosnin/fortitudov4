import { currentUser } from "@clerk/nextjs/server";
import { AppShell, type ShellNavItem } from "@/components/shell/app-shell";
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
 *
 * It is the product's own `AppShell`, with three pieces of chrome decided
 * rather than inherited:
 *   - the ⌘K palette stays, because it now offers this nav and nothing else;
 *   - global search goes, because it searches projects, messages and files
 *     scoped to `projects.userId` — a partner owns none, so it can only ever
 *     answer "no results";
 *   - the bell goes, because nothing in the product writes a notification to a
 *     partner, and a control that is permanently empty teaches people to stop
 *     looking at it.
 * The staff commands — Helix's actions and the agency CRM search — are off by
 * default and only `(admin)` asks for them.
 */
const navItems: ShellNavItem[] = [
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
    <AppShell
      navItems={navItems}
      cta={{ label: "New request", href: "/partner/requests/new" }}
      accountEmail={user?.emailAddresses[0]?.emailAddress}
      /* The logo goes to their own surface, not the marketing home. */
      homeHref="/partner"
      chrome={{ search: false, notifications: false }}
    >
      {children}
    </AppShell>
  );
}
