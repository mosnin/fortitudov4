import { auth } from "@clerk/nextjs/server";
import {
  CrmPageHeader,
  RecordList,
  RecordRow,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
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
 * genuine failure earns colour (design.md), everything else is the
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

/** "growth_plus" → "Growth Plus" — the plan reads as a word, not a key. */
const titleCase = (s: string) =>
  s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
          <CrmPageHeader
            section="Workspace."
            title="Payments"
            subtitle="Your account is still being set up — refresh in a moment."
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

  const planLabel =
    roster && roster.package === "custom" && roster.packageLabel
      ? roster.packageLabel
      : roster
        ? titleCase(roster.package)
        : null;

  // One sentence of status — what the client owes, or doesn't.
  const status = !hasAnything
    ? "Nothing billed yet — invoices land here once billing is set up."
    : overdue
      ? `Your retainer is ${-daysLeft!} ${
          daysLeft === -1 ? "day" : "days"
        } overdue.`
      : daysLeft !== null
        ? `Next payment due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}.`
        : `${formatUsd(totalPaid)} paid to date, nothing outstanding.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title="Payments"
          subtitle={status}
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
            {roster ? (
              <StatStrip columns={4} ariaLabel="Plan and billing">
                <StatCell label="Your plan">
                  <Stat>{planLabel}</Stat>
                  <StatMeta>
                    Since{" "}
                    {new Date(roster.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </StatMeta>
                </StatCell>

                <StatCell label="Monthly retainer">
                  <Stat suffix="/mo">{formatUsd(roster.monthlyFee)}</Stat>
                </StatCell>

                <StatCell label="Next payment due">
                  {roster.nextDueDate ? (
                    <Stat>
                      {new Date(roster.nextDueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </Stat>
                  ) : (
                    <StatEmpty>no date scheduled.</StatEmpty>
                  )}
                  {daysLeft !== null && (
                    <StatMeta>
                      {overdue ? (
                        <span className="text-destructive">
                          {-daysLeft} day{daysLeft === -1 ? "" : "s"} overdue
                        </span>
                      ) : (
                        `in ${daysLeft} days`
                      )}
                    </StatMeta>
                  )}
                </StatCell>

                <StatCell label="Total paid to date">
                  {totalPaid > 0 ? (
                    <Stat>{formatUsd(totalPaid)}</Stat>
                  ) : (
                    <StatEmpty>nothing settled yet.</StatEmpty>
                  )}
                </StatCell>
              </StatStrip>
            ) : (
              <StatStrip columns={2} ariaLabel="Billing summary">
                <StatCell label="Total paid to date">
                  {totalPaid > 0 ? (
                    <Stat>{formatUsd(totalPaid)}</Stat>
                  ) : (
                    <StatEmpty>nothing settled yet.</StatEmpty>
                  )}
                </StatCell>
                <StatCell label="Payments recorded">
                  {projectPayments.length > 0 ? (
                    <Stat>
                      {projectPayments.length.toLocaleString("en-US")}
                    </Stat>
                  ) : (
                    <StatEmpty>no payments recorded yet.</StatEmpty>
                  )}
                </StatCell>
              </StatStrip>
            )}

            {/* Retainer history */}
            {retainerHistory.length > 0 && (
              <section className={cn("animate-fade-up", SECTION_RHYTHM)}>
                <p className={SECTION_LABEL}>Retainer &amp; setup payments</p>
                <RecordList className="border-t border-border/60">
                  {retainerHistory.map((p, i) => (
                    <RecordRow
                      key={p.id}
                      index={i}
                      primary={
                        paymentTypeLabels[p.paymentType] || p.paymentType
                      }
                      secondary={
                        <span className="tabular-nums">
                          {fmtDay(new Date(p.paidAt))} · {p.method}
                        </span>
                      }
                      meta={
                        <span className="text-sm tabular-nums text-foreground">
                          {formatUsd(p.amount)}
                        </span>
                      }
                    />
                  ))}
                </RecordList>
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
                <RecordList className="border-t border-border/60">
                  {projectPayments.map((p, i) => (
                    <RecordRow
                      key={p.id}
                      index={i}
                      primary={p.projectName || "—"}
                      status={
                        <RowPill
                          className={cn(
                            isFailedStatus(p.status) &&
                              "border-destructive/40 text-destructive"
                          )}
                        >
                          {p.status.replace(/_/g, " ")}
                        </RowPill>
                      }
                      secondary={
                        <span className="tabular-nums">
                          {[
                            fmtDay(new Date(p.createdAt)),
                            p.invoiceNumber,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      }
                      meta={
                        <span className="text-sm tabular-nums text-foreground">
                          {formatUsd(p.amount)}
                        </span>
                      }
                    />
                  ))}
                </RecordList>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
