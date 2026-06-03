import Link from "next/link";
import { db } from "@/db";
import { projects, users, payments, decisionRequests } from "@/db/schema";
import { sql, eq, desc, ne } from "drizzle-orm";
import { AdminMast, StatTile, DataTable, StatusPill, type Column } from "@/components/admin/ascii-table";

export const dynamic = "force-dynamic";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type RecentRow = {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  clientFirst: string | null;
  clientLast: string | null;
  clientEmail: string | null;
};

function statusTone(status: string): "orange" | "success" | "warning" | "muted" {
  if (status === "completed") return "success";
  if (status === "payment_pending") return "warning";
  if (status === "cancelled") return "muted";
  return "orange";
}

export default async function AdminDashboardPage() {
  const [clientCount, activeCount, revenueRow, openDecisionCount, recent] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(users).where(ne(users.role, "admin")),
    db.select({ c: sql<number>`count(*)::int` }).from(projects).where(eq(projects.status, "in_progress")),
    db
      .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(eq(payments.status, "completed")),
    db.select({ c: sql<number>`count(*)::int` }).from(decisionRequests).where(eq(decisionRequests.status, "open")),
    db
      .select({
        id: projects.id,
        name: projects.name,
        serviceType: projects.serviceType,
        status: projects.status,
        clientFirst: users.firstName,
        clientLast: users.lastName,
        clientEmail: users.email,
      })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .orderBy(desc(projects.createdAt))
      .limit(8),
  ]);

  const recentRows = recent as RecentRow[];

  const columns: Column<RecentRow>[] = [
    {
      header: "Client",
      cell: (p) => `${p.clientFirst ?? ""} ${p.clientLast ?? ""}`.trim() || p.clientEmail || "—",
    },
    {
      header: "Build",
      cell: (p) => (
        <Link href={`/admin/projects/${p.id}`} className="font-medium text-foreground hover:text-orange">
          {p.name}
        </Link>
      ),
    },
    {
      header: "Discipline",
      cell: (p) => (
        <span className="text-muted-foreground">{disciplineLabels[p.serviceType] ?? p.serviceType}</span>
      ),
    },
    {
      header: "Status",
      cell: (p) => <StatusPill tone={statusTone(p.status)}>{p.status.replace("_", " ")}</StatusPill>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminMast
        eyebrow="Studio"
        title="Mission control"
        subtitle="Every client, build, and decision in one place."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Clients" value={String(clientCount[0]?.c ?? 0)} />
        <StatTile label="Active builds" value={String(activeCount[0]?.c ?? 0)} accent="orange" />
        <StatTile label="Revenue" value={formatUsd(revenueRow[0]?.total ?? 0)} accent="success" />
        <StatTile
          label="Open decisions"
          value={String(openDecisionCount[0]?.c ?? 0)}
          accent={openDecisionCount[0]?.c ? "warning" : undefined}
        />
      </div>

      <DataTable
        title="Recent builds"
        count={recentRows.length}
        columns={columns}
        rows={recentRows}
        getKey={(p) => p.id}
        empty="No builds yet."
      />
    </div>
  );
}
