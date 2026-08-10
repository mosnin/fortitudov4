import { auth } from "@clerk/nextjs/server";
import { PageHero } from "@/components/ui/firecrawl";
import { db } from "@/db";
import {
  agencyClients,
  clientPayments,
  invoices,
  payments,
  projects,
  users,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
} from "@/lib/typography";

/**
 * Payments — the client's money picture in one place.
 *
 * - Plan band + retainer history come from the agency roster
 *   (agencyClients + clientPayments), when the team has set one up.
 * - Project payments & invoices come from fortitudo's per-project billing
 *   (payments joined to invoices).
 *
 * Server-rendered: everything here is the signed-in user's own data.
 */

const paymentTypeLabels: Record<string, string> = {
  setup_fee: "Setup Fee",
  monthly_retainer: "Monthly Retainer",
};

/**
 * Payment status → pill treatment. Statuses are free-form varchar; only a
 * genuine failure earns colour (design-product.md), everything else is the
 * neutral pill.
 */
function isFailedStatus(status: string): boolean {
  return ["failed", "cancelled", "refunded"].includes(status.toLowerCase());
}

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function PaymentsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  if (!dbUser) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={READING_COL}>
          <PageHero
            section="Workspace"
            title="Payments"
            description="Your account is being set up. Please refresh in a moment."
          />
        </div>
      </div>
    );
  }

  // Agency roster record (retainer plan) — optional.
  const [roster] = await db
    .select()
    .from(agencyClients)
    .where(eq(agencyClients.userId, dbUser.id));

  const retainerHistory = roster
    ? await db
        .select({
          id: clientPayments.id,
          paymentType: clientPayments.paymentType,
          method: clientPayments.method,
          amount: clientPayments.amount,
          paidAt: clientPayments.paidAt,
        })
        .from(clientPayments)
        .where(eq(clientPayments.clientId, roster.id))
        .orderBy(desc(clientPayments.paidAt))
    : [];

  // Fortitudo project payments, joined to their invoice + project.
  const projectPayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      createdAt: payments.createdAt,
      projectName: projects.name,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(payments)
    .leftJoin(invoices, eq(invoices.paymentId, payments.id))
    .leftJoin(projects, eq(payments.projectId, projects.id))
    .where(eq(payments.userId, dbUser.id))
    .orderBy(desc(payments.createdAt));

  const paidStates = ["paid", "succeeded", "completed", "settled"];
  const projectPaid = projectPayments
    .filter((p) => paidStates.includes(p.status.toLowerCase()))
    .reduce((s, p) => s + p.amount, 0);
  const retainerPaid = retainerHistory.reduce((s, p) => s + p.amount, 0);
  const totalPaid = projectPaid + retainerPaid;

  // Server component: rendered per-request, so "now" is stable for the render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const daysLeft = roster?.nextDueDate
    ? Math.ceil((new Date(roster.nextDueDate).getTime() - now) / 86_400_000)
    : null;
  const overdue = daysLeft !== null && daysLeft < 0;

  const hasAnything =
    roster !== undefined ||
    retainerHistory.length > 0 ||
    projectPayments.length > 0;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Workspace"
          title="Payments"
          description="Your plan, project invoices, and payment history."
        />

        {!hasAnything ? (
          <div className="border-t border-border py-10">
            <p className="text-sm font-medium text-foreground">
              No payments yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once your project billing is set up, your invoices and payment
              history will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Plan band — hairline-divided, only when a retainer plan exists */}
            {roster && (
              <section className="animate-fade-up grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="py-5 sm:px-6 sm:first:pl-0">
                  <p className={SECTION_LABEL}>Your plan</p>
                  <p className="mt-2 text-xl capitalize tracking-tight text-foreground">
                    {roster.package === "custom" && roster.packageLabel
                      ? roster.packageLabel
                      : roster.package.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    Since{" "}
                    {new Date(roster.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <div className="py-5 sm:px-6">
                  <p className={SECTION_LABEL}>Monthly retainer</p>
                  <p className="mt-2 text-xl tracking-tight tabular-nums text-foreground">
                    {formatUsd(roster.monthlyFee)}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </p>
                </div>
                <div className="py-5 sm:px-6">
                  <p className={SECTION_LABEL}>Next payment due</p>
                  <p
                    className={cn(
                      "mt-2 text-xl tracking-tight tabular-nums",
                      overdue ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {roster.nextDueDate
                      ? new Date(roster.nextDueDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          }
                        )
                      : "—"}
                  </p>
                  {daysLeft !== null && (
                    <p
                      className={cn(
                        "mt-1 text-xs tabular-nums",
                        overdue ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {overdue
                        ? `${-daysLeft} day${daysLeft === -1 ? "" : "s"} overdue`
                        : `in ${daysLeft} days`}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Lifetime total */}
            <section className="animate-fade-up">
              <p className={SECTION_LABEL}>Total paid to date</p>
              <p className="mt-2 text-3xl tracking-tight tabular-nums text-foreground">
                {formatUsd(totalPaid)}
              </p>
            </section>

            {/* Retainer history */}
            {retainerHistory.length > 0 && (
              <section className={cn("animate-fade-up", SECTION_RHYTHM)}>
                <p className={SECTION_LABEL}>Retainer &amp; setup payments</p>
                <ul className="divide-y divide-border/60 border-t border-border/60">
                  {retainerHistory.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-start gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {paymentTypeLabels[p.paymentType] || p.paymentType}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          <span className="tabular-nums">
                            {fmtDay(new Date(p.paidAt))}
                          </span>{" "}
                          · {p.method}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-foreground">
                        {formatUsd(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Project invoices & payments */}
            <section className={cn("animate-fade-up", SECTION_RHYTHM)}>
              <p className={SECTION_LABEL}>Project invoices &amp; payments</p>
              {projectPayments.length === 0 ? (
                <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
                  No project payments recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-border/60 border-t border-border/60">
                  {projectPayments.map((p) => (
                    <li key={p.id} className="flex items-start gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {p.projectName || "—"}
                          </span>
                          <span
                            className={cn(
                              STATUS_PILL,
                              "shrink-0",
                              isFailedStatus(p.status) &&
                                "border-destructive/40 text-destructive"
                            )}
                          >
                            {p.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          <span className="tabular-nums">
                            {fmtDay(new Date(p.createdAt))}
                          </span>
                          {p.invoiceNumber && (
                            <>
                              {" · "}
                              <span className="tabular-nums">
                                {p.invoiceNumber}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-foreground">
                        {formatUsd(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
