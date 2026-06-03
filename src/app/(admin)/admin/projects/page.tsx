import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminMast, DataTable, StatusPill, type Column } from "@/components/admin/ascii-table";

export const dynamic = "force-dynamic";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

type ProjectRow = {
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

export default async function AdminProjectsPage() {
  const rows = (await db
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
    .orderBy(desc(projects.createdAt))) as ProjectRow[];

  const columns: Column<ProjectRow>[] = [
    {
      header: "Build",
      cell: (p) => (
        <Link href={`/admin/projects/${p.id}`} className="font-medium text-foreground hover:text-orange">
          {p.name}
        </Link>
      ),
    },
    {
      header: "Client",
      cell: (p) => (
        <span className="text-muted-foreground">
          {`${p.clientFirst ?? ""} ${p.clientLast ?? ""}`.trim() || p.clientEmail || "—"}
        </span>
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
    {
      header: "",
      align: "right",
      cell: (p) => (
        <Link
          href={`/admin/projects/${p.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-orange"
        >
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminMast
        eyebrow="Builds"
        title="Every build in flight"
        subtitle="Manage phases, decisions, and delivery."
        action={
          <Link
            href="/admin/builds/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition-colors hover:bg-orange-dark"
          >
            <Plus className="h-4 w-4" /> New build
          </Link>
        }
      />
      <DataTable
        title="All builds"
        count={rows.length}
        columns={columns}
        rows={rows}
        getKey={(p) => p.id}
        empty="No builds yet."
      />
    </div>
  );
}
