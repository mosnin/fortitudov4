import { assertAdminPage } from "@/lib/admin-page-guard";

/**
 * Admin-only guard for the Team surface (staff roster and role management).
 * The parent (admin) layout admits all staff; this gate bounces PMs/VAs back
 * to the admin overview.
 */
export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAdminPage();
  return <>{children}</>;
}
