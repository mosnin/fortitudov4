import { db } from "@/db";
import { users, projects } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { AdminMast, DataTable, StatusPill, type Column } from "@/components/admin/ascii-table";
import { RoleSelect } from "@/components/dashboard/role-select";

export const dynamic = "force-dynamic";

type PersonRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  type: string;
  role: string;
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
      role: users.role,
      projectCount: sql<number>`count(${projects.id})::int`,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(projects, eq(projects.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))) as PersonRow[];

  const columns: Column<PersonRow>[] = [
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
    { header: "Role", cell: (c) => <RoleSelect userId={c.id} role={c.role} /> },
    { header: "Builds", align: "right", cell: (c) => c.projectCount },
    {
      header: "Joined",
      align: "right",
      cell: (c) => <span className="text-muted-foreground">{fmtDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminMast
        eyebrow="People"
        title="Everyone on the platform"
        subtitle="Clients, agents, and your team. Set roles to grant agency access."
      />
      <DataTable
        title="All people"
        count={rows.length}
        columns={columns}
        rows={rows}
        getKey={(c) => c.id}
        empty="No one yet."
      />
    </div>
  );
}
