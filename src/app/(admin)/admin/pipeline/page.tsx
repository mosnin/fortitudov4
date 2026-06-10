import Link from "next/link";
import { db } from "@/db";
import { projects, users, decisionRequests, teamMembers } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AdminMast, StatusPill } from "@/components/admin/ascii-table";

export const dynamic = "force-dynamic";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

// Pipeline columns, in delivery order.
const COLUMNS: { key: string; label: string }[] = [
  { key: "onboarding", label: "Onboarding" },
  { key: "payment_pending", label: "Payment pending" },
  { key: "in_progress", label: "In progress" },
  { key: "revision", label: "Revision" },
  { key: "completed", label: "Completed" },
];

const ACTIVE = ["onboarding", "payment_pending", "in_progress", "revision"];

type ProjectCard = {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  clientFirst: string | null;
  clientLast: string | null;
  clientEmail: string | null;
};

function clientLabel(p: ProjectCard) {
  return `${p.clientFirst ?? ""} ${p.clientLast ?? ""}`.trim() || p.clientEmail || "—";
}

export default async function AdminPipelinePage() {
  const [rows, openDecisions, architects] = await Promise.all([
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
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: decisionRequests.id,
        title: decisionRequests.title,
        projectId: decisionRequests.projectId,
        blocking: decisionRequests.blocking,
        dueAt: decisionRequests.dueAt,
        projectName: projects.name,
      })
      .from(decisionRequests)
      .leftJoin(projects, eq(decisionRequests.projectId, projects.id))
      .where(eq(decisionRequests.status, "open"))
      .orderBy(sql`${decisionRequests.dueAt} asc nulls last`),
    db
      .select({
        id: teamMembers.id,
        name: teamMembers.name,
        title: teamMembers.title,
        load: sql<number>`count(${projects.id}) filter (where ${projects.status} in ('onboarding','payment_pending','in_progress','revision'))::int`,
      })
      .from(teamMembers)
      .leftJoin(projects, eq(projects.architectId, teamMembers.id))
      .where(eq(teamMembers.active, true))
      .groupBy(teamMembers.id)
      .orderBy(desc(sql`count(${projects.id})`)),
  ]);

  const cards = rows as ProjectCard[];
  const byStatus = (status: string) => cards.filter((c) => c.status === status);
  const activeCount = cards.filter((c) => ACTIVE.includes(c.status)).length;
  const now = Date.now();

  return (
    <div className="space-y-5">
      <AdminMast
        eyebrow="Pipeline"
        title="Every build in motion"
        subtitle={`${activeCount} active across the studio.`}
      />

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = byStatus(col.key);
          return (
            <div
              key={col.key}
              className="flex flex-col rounded-3xl border border-border/60 bg-card/40 p-3 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {col.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">—</p>
                ) : (
                  items.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/projects/${p.id}`}
                      className="block rounded-2xl border border-border/60 bg-background/40 p-3 transition-colors hover:border-orange/40 hover:bg-orange/[0.04]"
                    >
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{clientLabel(p)}</p>
                      <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-orange/70">
                        {disciplineLabels[p.serviceType] ?? p.serviceType}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Needs attention — open decisions */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl lg:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
            Awaiting the client
          </h2>
          <div className="mt-4 space-y-2">
            {openDecisions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing blocked — every build is clear.
              </p>
            ) : (
              openDecisions.map((d) => {
                const overdue = d.dueAt ? new Date(d.dueAt).getTime() < now : false;
                return (
                  <Link
                    key={d.id}
                    href={`/admin/projects/${d.projectId}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3 transition-colors hover:border-orange/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{d.projectName ?? "—"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {d.blocking && <StatusPill tone="warning">blocking</StatusPill>}
                      {d.dueAt && (
                        <StatusPill tone={overdue ? "orange" : "muted"}>
                          {overdue ? "overdue" : `due ${new Date(d.dueAt).toLocaleDateString()}`}
                        </StatusPill>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Architect load */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
            Architect load
          </h2>
          <div className="mt-4 space-y-2">
            {architects.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No architects yet.</p>
            ) : (
              architects.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.name}</p>
                    {a.title && <p className="truncate text-xs text-muted-foreground">{a.title}</p>}
                  </div>
                  <span className="font-brand text-lg tabular-nums text-orange">{a.load}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
