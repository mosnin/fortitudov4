import { notFound, redirect } from "next/navigation";
import { and, asc, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { users, tasks } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { TeamManager, type TeamRow } from "@/components/dashboard/team-manager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const me = await getOrCreateCurrentUser();
  if (!me) redirect("/sign-in");
  if (me.role !== "admin") notFound();

  const [staff, openTasks] = await Promise.all([
    db.select().from(users).where(inArray(users.role, ["admin", "team"])).orderBy(asc(users.createdAt)),
    db
      .select({ assigneeId: tasks.assigneeId })
      .from(tasks)
      .where(and(ne(tasks.status, "done"), ne(tasks.status, "cancelled"))),
  ]);

  // Open-task load per member.
  const load = new Map<string, number>();
  for (const t of openTasks) {
    if (t.assigneeId) load.set(t.assigneeId, (load.get(t.assigneeId) ?? 0) + 1);
  }

  const rows: TeamRow[] = staff.map((u) => ({
    id: u.id,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
    email: u.email,
    role: u.role as "admin" | "team",
    pending: u.clerkId.startsWith("pending:"),
    joinedAt: u.createdAt.toISOString(),
    openTasks: load.get(u.id) ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Team</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">The studio</h1>
          <p className="mt-2 font-mono text-xs text-white/55">
            {rows.length.toString().padStart(2, "0")} members ·{" "}
            {rows.filter((r) => r.pending).length} pending
          </p>
        </div>
      </div>

      <TeamManager rows={rows} meId={me.id} />
    </div>
  );
}
