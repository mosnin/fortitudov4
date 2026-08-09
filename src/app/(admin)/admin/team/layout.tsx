import { assertAdminPage } from "@/lib/admin-page-guard";

/**
 * Admin-only guard for the Team surface (role and department management).
 * The parent (admin) layout admits all staff; this mirrors Legendary's
 * (manage) group gate so PMs/VAs are bounced back to the admin overview.
 */
export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAdminPage();
  return <>{children}</>;
}
