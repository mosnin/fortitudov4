import Link from "next/link";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import { Reveal, RevealGroup, RevealLift } from "@/components/ui/motion";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { db } from "@/db";
import { projects, projectPhases } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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

// Status chip accent — kept tasteful, orange-leaning with a few semantic tones.
const statusChip: Record<string, string> = {
  in_progress: "border-orange/30 bg-orange/10 text-orange",
  completed: "border-success/30 bg-success/10 text-success",
  revision: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  payment_pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  onboarding: "border-border/60 bg-background/40 text-muted-foreground",
  cancelled: "border-border/60 bg-background/40 text-muted-foreground",
};

// Disciplines, matching the service_type enum (software/commerce/ai/infrastructure).
const serviceLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl";

export default async function ProjectsPage() {
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) return null;

  const userProjects =
    dbUser.role === "admin"
      ? await db.select().from(projects)
      : await db.select().from(projects).where(eq(projects.userId, dbUser.id));

  const projectIds = userProjects.map((p) => p.id);
  const allPhases =
    projectIds.length > 0
      ? await db
          .select()
          .from(projectPhases)
          .where(inArray(projectPhases.projectId, projectIds))
      : [];

  return (
    <div className="space-y-8">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">
            Fortitudo // Studio
          </p>
          <h1 className="font-brand mt-2 text-3xl sm:text-4xl">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Every build you&apos;ve commissioned, in one place.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-dark"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </Reveal>

      {userProjects.length === 0 ? (
        <Reveal
          delay={0.1}
          className={`${card} flex flex-col items-center justify-center px-6 py-20 text-center`}
        >
          <Sparkles className="mb-3 h-8 w-8 text-orange" />
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Start your first Brief and we&apos;ll architect it into a Blueprint,
            then build it together.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-dark"
          >
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Reveal>
      ) : (
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {userProjects.map((project) => {
            const phases = allPhases
              .filter((p) => p.projectId === project.id)
              .sort((a, b) => a.order - b.order);
            const total = phases.length;
            const completed = phases.filter((p) => p.status === "completed").length;
            const pct = total ? Math.round((completed / total) * 100) : 0;
            const currentPhase =
              phases.find((p) => p.status === "in_progress")?.name ??
              (pct === 100 ? "Complete" : total ? "Not started" : "Awaiting kickoff");

            return (
              <RevealLift key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className={`group flex h-full flex-col ${card} p-6 transition-colors hover:border-orange/40`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {serviceLabels[project.serviceType] || project.serviceType}
                      </p>
                      <h2 className="mt-1.5 truncate text-lg font-semibold">
                        {project.name}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        statusChip[project.status] ?? statusChip.onboarding
                      }`}
                    >
                      {statusLabels[project.status] || project.status}
                    </span>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-muted-foreground">
                        {currentPhase}
                      </span>
                      <span className="tabular-nums font-medium text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-orange">
                    View Project
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </RevealLift>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
