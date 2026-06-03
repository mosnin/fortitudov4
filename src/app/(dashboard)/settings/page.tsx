import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { Reveal } from "@/components/ui/motion";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-6";

export default async function SettingsPage() {
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const user = await getOrCreateCurrentUser();
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Account</p>
        <h1 className="mt-2 text-2xl font-brand sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </Reveal>

      <Reveal delay={0.08} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-muted-foreground mt-1 text-sm">Your profile information from Clerk.</p>
          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="truncate text-sm font-medium">{fullName || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="truncate text-sm font-medium">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd>
                <span className="rounded-full bg-orange/10 px-2.5 py-1 text-xs font-medium text-orange">
                  {isAdmin ? "Admin" : "Client"}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section className={card}>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-muted-foreground mt-1 text-sm">Payment history and invoices.</p>
          <div className="mt-5 rounded-2xl border border-border/60 bg-background/40 px-4 py-4 text-sm text-muted-foreground">
            Payments are processed securely through Creem.io. Contact us for billing inquiries.
          </div>
        </section>
      </Reveal>
    </div>
  );
}
