import { auth } from "@clerk/nextjs/server";
import { PageHero } from "@/components/ui/firecrawl";
import { EmptyState } from "@/components/ui/empty-state";
import { AsciiField } from "@/components/ui/ascii-field";
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
import { CreditCard, Receipt } from "lucide-react";

/**
 * Payments — the client's money picture in one place (ported from Legendary's
 * payments page, extended with fortitudo's project invoices/payments data).
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

/** Loose project-payment status → mono tone (values are free-form varchar). */
function paymentStatusTone(status: string): string {
  const s = status.toLowerCase();
  if (["paid", "succeeded", "completed", "settled"].includes(s))
    return "text-success";
  if (["failed", "cancelled", "refunded"].includes(s))
    return "text-destructive";
  return "text-warning";
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
      <div className="space-y-8">
        <PageHero
          title="Payments"
          description="Your account is being set up. Please refresh in a moment."
        />
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
    <div className="space-y-10">
      <PageHero
        title="Payments"
        description="Your plan, project invoices, and payment history."
      />

      {!hasAnything ? (
        <div className="animate-fade-up relative overflow-hidden rounded-xl border border-border">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 70%)",
            }}
          >
            <AsciiField className="h-full w-full opacity-40" />
          </div>
          <div className="relative">
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Once your project billing is set up, your invoices and payment history will appear here."
            />
          </div>
        </div>
      ) : (
        <>
          {/* Plan band — hairline-divided, only when a retainer plan exists */}
          {roster && (
            <section className="animate-fade-up grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-6 sm:first:pl-0">
                <p className="micro-label">Your Plan</p>
                <p className="mt-2 text-2xl font-bold capitalize tracking-tight">
                  {roster.package === "custom" && roster.packageLabel
                    ? roster.packageLabel
                    : roster.package.replace(/_/g, " ")}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  Since{" "}
                  {new Date(roster.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </div>
              <div className="px-5 py-6">
                <p className="micro-label">Monthly Retainer</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {formatUsd(roster.monthlyFee)}
                  <span className="text-base font-semibold text-muted-foreground">
                    /mo
                  </span>
                </p>
              </div>
              <div className="px-5 py-6">
                <p className="micro-label">Next Payment Due</p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-bold tracking-tight",
                    overdue && "text-destructive"
                  )}
                >
                  {roster.nextDueDate
                    ? new Date(roster.nextDueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })
                    : "—"}
                </p>
                {daysLeft !== null && (
                  <p
                    className={cn(
                      "mt-1 font-mono text-[11px]",
                      overdue
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
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
          <section className="animate-fade-up border-b border-border pb-6">
            <p className="micro-label">Total Paid to Date</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {formatUsd(totalPaid)}
            </p>
          </section>

          {/* Retainer history */}
          {retainerHistory.length > 0 && (
            <section className="animate-fade-up">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[15px] font-semibold">
                  Retainer &amp; Setup Payments
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="micro-label py-3 pr-4">Date</th>
                      <th className="micro-label py-3 pr-4">Type</th>
                      <th className="micro-label py-3 pr-4">Method</th>
                      <th className="micro-label py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {retainerHistory.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDay(new Date(p.paidAt))}
                        </td>
                        <td className="py-3 pr-4">
                          {paymentTypeLabels[p.paymentType] || p.paymentType}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {p.method}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold">
                          {formatUsd(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Project invoices & payments */}
          <section className="animate-fade-up">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[15px] font-semibold">
                Project Invoices &amp; Payments
              </h2>
            </div>
            {projectPayments.length === 0 ? (
              <p className="pt-6 text-center text-sm text-muted-foreground">
                No project payments recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="micro-label py-3 pr-4">Date</th>
                      <th className="micro-label py-3 pr-4">Project</th>
                      <th className="micro-label py-3 pr-4">Invoice</th>
                      <th className="micro-label py-3 pr-4 text-right">
                        Amount
                      </th>
                      <th className="micro-label py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDay(new Date(p.createdAt))}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {p.projectName || "—"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {p.invoiceNumber || "—"}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono font-semibold">
                          {formatUsd(p.amount)}
                        </td>
                        <td className="py-3">
                          <span
                            className={cn(
                              "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
                              paymentStatusTone(p.status)
                            )}
                          >
                            {p.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
