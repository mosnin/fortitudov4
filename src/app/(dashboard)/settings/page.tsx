import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { CrmPageHeader, RowPill } from "@/components/crm";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/db/schema";
import { cn } from "@/lib/utils";
import { PAGE_RHYTHM, READING_COL, SECTION_LABEL } from "@/lib/typography";

/**
 * Settings — account details. Sign-in details (email, password, 2FA, profile
 * photo) are managed securely by Clerk via the user menu in the shell; billing
 * runs through your invoices on /payments.
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

  const roleLabel = ROLE_LABELS[(dbUser?.role ?? "client") as UserRole];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Account."
          title="Settings"
          subtitle={
            memberSince
              ? `Signed in as ${roleLabel.toLowerCase()}, with us since ${memberSince}.`
              : `Signed in as ${roleLabel.toLowerCase()}.`
          }
        />

        <div className="animate-fade-up grid grid-cols-1 divide-y divide-border border-y border-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {/* Account */}
          <section className="py-6 lg:pr-10">
            <p className={SECTION_LABEL}>Account</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign-in details, managed securely by Clerk.
            </p>

            <dl className="mt-5 divide-y divide-border/60 border-t border-border/60">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="truncate text-sm font-medium text-foreground">
                  {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                    "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="truncate text-sm text-foreground">
                  {user?.emailAddresses[0]?.emailAddress ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Role</dt>
                <dd>
                  <RowPill>{roleLabel}</RowPill>
                </dd>
              </div>
              {memberSince && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted-foreground">
                    Member since
                  </dt>
                  <dd className="text-sm tabular-nums text-foreground">
                    {memberSince}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-5 text-sm text-muted-foreground">
              Change your email, password, profile photo, or two-factor
              authentication from the account menu in the top-right corner of
              the portal.
            </p>
          </section>

          {/* Billing */}
          <section className="py-6 lg:pl-10">
            <p className={SECTION_LABEL}>Billing</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoices, plans, and payment history.
            </p>

            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <p>
                Every project invoice lives on its project page, and your full
                payment history — retainer and project payments alike — is on
                the{" "}
                <Link
                  href="/payments"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Payments
                </Link>{" "}
                page.
              </p>
              <p>
                For billing questions, changes to your engagement, or receipts,
                message the team directly — we usually reply within one business
                day.
              </p>
            </div>
          </section>
        </div>

        {/* Below the two-column block, full width: the board needs the room,
            and shortcuts are a different kind of fact from account and billing
            details — nothing here is about this reader's account. */}
        <div className="border-b border-border">
          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  );
}
