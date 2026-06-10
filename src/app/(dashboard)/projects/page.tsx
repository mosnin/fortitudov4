import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { db } from "@/db";
import { projects, projectPhases } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

const serviceLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

export default async function ProjectsPage() {
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) return null;

  const userProjects =
    dbUser.role === "admin"
      ? await db.select().from(projects).orderBy(desc(projects.createdAt))
      : await db
          .select()
          .from(projects)
          .where(eq(projects.userId, dbUser.id))
          .orderBy(desc(projects.createdAt));

  const projectIds = userProjects.map((p) => p.id);
  const allPhases =
    projectIds.length > 0
      ? await db.select().from(projectPhases).where(inArray(projectPhases.projectId, projectIds))
      : [];

  const activeCount = userProjects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  ).length;

  return (
    <div className="space-y-5">
      {/* ── Masthead ── */}
      <Reveal className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-7 sm:p-10">
        <AsciiField className="absolute inset-0 h-full w-full opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Builds</p>
            <h1 className="font-brand mt-2 text-4xl text-white sm:text-6xl">
              {activeCount}
              <span className="ml-2 text-lg font-normal text-white/60 sm:text-2xl">
                in build
              </span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Every project we&apos;re architecting and shipping for you — tracked from Blueprint to
              launch.
            </p>
          </div>
          <Link
            href="/brief"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-orange-dark hover:shadow-orange/40"
          >
            <Plus className="h-4 w-4" /> New Brief
          </Link>
        </div>
      </Reveal>

      {/* ── Builds ── */}
      {userProjects.length === 0 ? (
        <Reveal
          delay={0.1}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange/30 bg-orange/[0.03] px-6 py-20 text-center"
        >
          <p className="font-brand text-2xl">Nothing in build yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start a Brief and we&apos;ll architect it into a Blueprint with real scope and a price.
          </p>
          <Link
            href="/brief"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-dark"
          >
            <Plus className="h-4 w-4" /> Start a Brief
          </Link>
        </Reveal>
      ) : (
        <RevealGroup className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {userProjects.map((project) => {
            const phases = allPhases
              .filter((p) => p.projectId === project.id)
              .sort((a, b) => a.order - b.order);
            const total = phases.length;
            const completed = phases.filter((p) => p.status === "completed").length;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            const current =
              phases.find((p) => p.status === "in_progress")?.name ??
              (pct === 100 ? "Complete" : "Not started");

            return (
              <RevealItem key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="group flex h-full flex-col justify-between gap-6 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange/40 hover:bg-card/80 sm:p-7"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
                        {serviceLabels[project.serviceType] ?? project.serviceType}
                      </p>
                      <span className="shrink-0 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        {statusLabels[project.status] ?? project.status}
                      </span>
                    </div>
                    <h2 className="font-brand mt-3 text-2xl leading-tight sm:text-3xl">
                      {project.name}
                    </h2>
                  </div>

                  <div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-brand text-3xl tabular-nums">
                          {pct}
                          <span className="text-lg text-muted-foreground">%</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{current}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-orange">
                        View build
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {total > 0 && (
                      <div className="mt-3 flex items-end gap-1 h-8">
                        {phases.map((ph) => {
                          const h =
                            ph.status === "completed"
                              ? 100
                              : ph.status === "in_progress"
                                ? 55
                                : 22;
                          return (
                            <div
                              key={ph.id}
                              title={ph.name}
                              className="flex-1 rounded-t-sm bg-gradient-to-t from-orange/25 to-amber-400/70"
                              style={{ height: `${h}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
