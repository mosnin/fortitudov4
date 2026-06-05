import "server-only";
import { cookies } from "next/headers";

// "View as client" lets an admin/team member experience the app exactly as a
// customer would — their own builds, no admin chrome — and even purchase a
// build. It's a per-browser cookie and never changes their real role.
export const VIEW_AS_COOKIE = "fortitudo_view_as";

export async function isViewingAsClient(): Promise<boolean> {
  const store = await cookies();
  return store.get(VIEW_AS_COOKIE)?.value === "client";
}
