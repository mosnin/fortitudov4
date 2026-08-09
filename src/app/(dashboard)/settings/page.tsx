import { currentUser } from "@clerk/nextjs/server";
import { PageHero } from "@/components/ui/firecrawl";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/db/schema";

/**
 * Settings — account details, restyled to the fused system. Sign-in details
 * (email, password, 2FA, profile photo) are managed securely by Clerk via the
 * user menu in the shell; billing runs through your invoices on /payments.
 */
export default async function SettingsPage() {
  const user = await currentUser();

  const dbUser = user
    ? (
        await db.select().from(users).where(eq(users.clerkId, user.id))
      )[0]
    : undefined;

  const memberSince = dbUser
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-10">
      <PageHero
        title="Settings"
        description="Your account details and how billing works."
      />

      <div className="animate-fade-up grid grid-cols-1 divide-y divide-border border-b border-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Account */}
        <section className="pb-8 lg:pb-10 lg:pr-10">
          <h2 className="text-[15px] font-semibold">Account</h2>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            Sign-in details, managed securely by Clerk.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">
                {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                  "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="font-mono text-xs">
                {user?.emailAddresses[0]?.emailAddress ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary">
                {ROLE_LABELS[(dbUser?.role ?? "client") as UserRole]}
              </Badge>
            </div>
            {memberSince && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-mono text-xs">{memberSince}</span>
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Change your email, password, profile photo, or two-factor
            authentication from the account menu in the top-right corner of the
            portal.
          </p>
        </section>

        {/* Billing */}
        <section className="py-8 lg:py-0 lg:pb-10 lg:pl-10">
          <h2 className="text-[15px] font-semibold">Billing</h2>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            Invoices, plans, and payment history.
          </p>

          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p>
              Every project invoice lives on its project page, and your full
              payment history — retainer and project payments alike — is on the{" "}
              <a
                href="/payments"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Payments
              </a>{" "}
              page.
            </p>
            <p>
              For billing questions, changes to your plan, or receipts, message
              the team directly — we usually reply within one business day.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
