import { db } from "@/db";
import { payments, users, projects } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { AdminMast, StatTile, DataTable, StatusPill, type Column } from "@/components/admin/ascii-table";

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  clientFirst: string | null;
  clientLast: string | null;
  clientEmail: string | null;
  projectName: string | null;
};

export default async function AdminPaymentsPage() {
  const [totals, rows] = await Promise.all([
    db
      .select({
        all: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
        paid: sql<number>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'completed'), 0)::int`,
        pending: sql<number>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'pending'), 0)::int`,
      })
      .from(payments),
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.createdAt,
        clientFirst: users.firstName,
        clientLast: users.lastName,
        clientEmail: users.email,
        projectName: projects.name,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(projects, eq(payments.projectId, projects.id))
      .orderBy(desc(payments.createdAt)),
  ]);

  const t = totals[0] ?? { all: 0, paid: 0, pending: 0 };
  const paymentRows = rows as PaymentRow[];

  const columns: Column<PaymentRow>[] = [
    {
      header: "Client",
      cell: (p) => (
        <span className="font-medium text-foreground">
          {`${p.clientFirst ?? ""} ${p.clientLast ?? ""}`.trim() || p.clientEmail || "—"}
        </span>
      ),
    },
    { header: "Build", cell: (p) => <span className="text-muted-foreground">{p.projectName ?? "—"}</span> },
    { header: "Amount", align: "right", cell: (p) => formatUsd(p.amount) },
    {
      header: "Status",
      cell: (p) => (
        <StatusPill tone={p.status === "completed" ? "success" : p.status === "pending" ? "warning" : "muted"}>
          {p.status}
        </StatusPill>
      ),
    },
    {
      header: "Date",
      align: "right",
      cell: (p) => <span className="text-muted-foreground">{fmtDate(p.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminMast eyebrow="Payments" title="Revenue & invoices" subtitle="Every payment across the studio." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total" value={formatUsd(t.all)} />
        <StatTile label="Collected" value={formatUsd(t.paid)} accent="success" />
        <StatTile label="Pending" value={formatUsd(t.pending)} accent="warning" />
      </div>

      <DataTable
        title="Payment history"
        count={paymentRows.length}
        columns={columns}
        rows={paymentRows}
        getKey={(p) => p.id}
        empty="No payments yet."
      />
    </div>
  );
}
