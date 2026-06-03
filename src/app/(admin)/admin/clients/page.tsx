import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { sql, eq, ne, desc } from "drizzle-orm";
import { AdminMast, DataTable, StatusPill, type Column } from "@/components/admin/ascii-table";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  type: string;
  projectCount: number;
  createdAt: Date;
};

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminClientsPage() {
  const rows = (await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      type: users.type,
      projectCount: sql<number>`count(${projects.id})::int`,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(projects, eq(projects.userId, users.id))
    .where(ne(users.role, "admin"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))) as ClientRow[];

  const columns: Column<ClientRow>[] = [
    {
      header: "Name",
      cell: (c) => (
        <span className="font-medium text-foreground">
          {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—"}
        </span>
      ),
    },
    { header: "Email", cell: (c) => <span className="text-muted-foreground">{c.email}</span> },
    {
      header: "Type",
      cell: (c) => (
        <StatusPill tone={c.type === "agent" ? "orange" : "muted"}>{c.type}</StatusPill>
      ),
    },
    { header: "Builds", align: "right", cell: (c) => c.projectCount },
    {
      header: "Joined",
      align: "right",
      cell: (c) => <span className="text-muted-foreground">{fmtDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminMast eyebrow="Clients" title="Everyone you build for" subtitle="Humans and agents on the platform." />
      <DataTable
        title="All clients"
        count={rows.length}
        columns={columns}
        rows={rows}
        getKey={(c) => c.id}
        empty="No clients yet."
      />
    </div>
  );
}
