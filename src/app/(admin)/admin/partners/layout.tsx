import { assertPartnersPage } from "@/lib/admin-page-guard";

/**
 * Server-side guard for `/admin/partners`.
 *
 * The predicate is `canManagePartners` (admin + project_manager) rather than
 * `isAdmin`, because a PM runs client work day to day and has to be able to
 * quote a partner. The one that matters is the deny: a **VA is bounced to
 * `/admin`**, on direct URL access included. The parent `(admin)` layout admits
 * every staff role so PMs and VAs can reach the operational pages, and a
 * partner request is a commercial document carrying another company's budget —
 * a VA is scoped to the tasks they hold and has no business reading it
 * (plans/partners.md).
 *
 * The nav entry is hidden for VAs by the same predicate, but a hidden link is
 * not access control. This layout is the enforcement.
 */
export default async function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertPartnersPage();
  return <>{children}</>;
}
