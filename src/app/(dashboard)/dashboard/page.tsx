import Link from "next/link";
import { db } from "@/db";
import {
  projects,
  projectPhases,
  decisionRequests,
  blueprints,
  deliverables as deliverablesTable,
  teamMembers,
} from "@/db/schema";
import { eq, inArray, desc, and } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { WelcomeRotator } from "@/components/dashboard/welcome-rotator";
import { Reveal } from "@/components/ui/motion";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { formatPrice } from "@/lib/catalog";
import {
  Plus,
  ArrowRight,
  ShieldQuestion,
  Sparkles,
  Layers,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};
const statusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-5";

// Never let a single failing query blank the whole dashboard. If the database
// schema is out of date (e.g. a missing column/table), show a clear, actionable
// message instead of a crash.
export default async function DashboardPage() {
  try {
    return await DashboardBody();
  } catch (error) {
    // Re-throw Next.js control-flow signals (redirect / notFound / dynamic usage)
    // so the framework can handle them; only show the card for real failures.
    if (error && typeof (error as { digest?: unknown }).digest === "string") throw error;
    console.error("Dashboard failed to load:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return (
      <div className={card}>
        <h1 className="text-xl font-bold">We couldn&apos;t load your dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This usually means the database schema is out of date. Reconcile it with{" "}
          <code className="rounded bg-background/60 px-1.5 py-0.5 text-xs">pnpm db:push</code>{" "}
          (or run the latest migration SQL) against your Supabase database, then refresh.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted-foreground">Technical details</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-background/60 p-3 text-xs text-destructive">
            {detail}
          </pre>
        </details>
      </div>
    );
  }
}

async function DashboardBody() {
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) return null;
  const firstName = dbUser.firstName || "there";

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, dbUser.id))
    .orderBy(desc(projects.createdAt));

  const active = userProjects.filter((p) => p.status !== "completed" && p.status !== "cancelled");
  const ids = userProjects.map((p) => p.id);
  const lead = active[0];

  // Parallel detail fetches, guarded against empty IN ()
  const [latestBp, latestDeliverable, leadPhases, architect, openDecisionList] = await Promise.all([
    ids.length
      ? db.select().from(blueprints).where(inArray(blueprints.projectId, ids)).orderBy(desc(blueprints.createdAt)).limit(1).then((r) => r[0])
      : Promise.resolve(undefined),
    ids.length
      ? db.select().from(deliverablesTable).where(inArray(deliverablesTable.projectId, ids)).orderBy(desc(deliverablesTable.releasedAt)).limit(1).then((r) => r[0])
      : Promise.resolve(undefined),
    lead
      ? db.select().from(projectPhases).where(eq(projectPhases.projectId, lead.id))
      : Promise.resolve([] as (typeof projectPhases.$inferSelect)[]),
    lead?.architectId
      ? db.select().from(teamMembers).where(eq(teamMembers.id, lead.architectId)).then((r) => r[0])
      : Promise.resolve(undefined),
    getOpenDecisions(ids),
  ]);

  const sortedLeadPhases = leadPhases.slice().sort((a, b) => a.order - b.order);
  const completed = sortedLeadPhases.filter((p) => p.status === "completed").length;
  const pct = sortedLeadPhases.length ? Math.round((completed / sortedLeadPhases.length) * 100) : 0;
  const currentPhase = sortedLeadPhases.find((p) => p.status === "in_progress")?.name ?? (pct === 100 ? "Complete" : "Not started");

  const decisionCount = openDecisionList.length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { day: "2-digit" });
  const monthStr = now.toLocaleDateString("en-US", { month: "long" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <Reveal className="grid grid-cols-12 gap-4">
      {/* ── Signature ASCII hero ── */}
      <section className="col-span-12 lg:col-span-4 relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal-dark min-h-[340px] flex flex-col justify-between p-6">
        <AsciiField className="absolute inset-0 h-full w-full opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Studio</p>
          <WelcomeRotator name={firstName} className="mt-2 text-2xl font-bold text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-5xl font-bold tabular-nums text-white">{active.length}</p>
          <p className="text-sm text-white/60">active {active.length === 1 ? "build" : "builds"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/brief" className="inline-flex items-center gap-1.5 rounded-xl bg-orange px-3.5 py-2 text-sm font-medium text-white hover:bg-orange-dark transition-colors">
              <Plus className="h-4 w-4" /> New Brief
            </Link>
            {lead && (
              <Link href={`/projects/${lead.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm font-medium hover:border-orange/50 transition-colors">
                Open Studio
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Your builds ── */}
      <section className={`col-span-12 lg:col-span-5 ${card} min-h-[340px] flex flex-col`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your builds</p>
            <p className="mt-1 text-3xl font-bold">{dateStr}</p>
            <p className="text-sm text-muted-foreground">{monthStr} · {timeStr}</p>
          </div>
          <Link href="/brief" className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-white hover:bg-orange-dark transition-colors" aria-label="New brief">
            <Plus className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-5 space-y-2 overflow-y-auto">
          {active.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-7 w-7 text-orange mb-2" />
              <p className="text-sm font-medium">Nothing in build yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start a Brief and we&apos;ll architect it into a Blueprint.</p>
            </div>
          ) : (
            active.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 p-3 hover:border-orange/40 transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{disciplineLabels[p.serviceType] ?? p.serviceType}</p>
                </div>
                <span className="shrink-0 rounded-full bg-orange/10 px-2.5 py-1 text-[11px] font-medium text-orange">
                  {statusLabels[p.status] ?? p.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── Latest Blueprint (gradient spotlight) ── */}
      <section className="col-span-12 sm:col-span-6 lg:col-span-3 min-h-[340px] rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-orange via-orange to-amber-400 text-charcoal-dark">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium opacity-80">Latest Blueprint</p>
          <Layers className="h-5 w-5 opacity-80" />
        </div>
        {latestBp ? (
          <>
            <div>
              <p className="text-4xl font-bold tabular-nums">{formatPrice(latestBp.total)}</p>
              <p className="mt-1 text-sm font-medium line-clamp-2">{latestBp.title}</p>
              <p className="text-xs opacity-70 capitalize mt-1">{latestBp.status}</p>
            </div>
            <Link href={`/blueprint/${latestBp.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-charcoal-dark px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Review Blueprint <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <div>
            <p className="text-lg font-semibold">No Blueprint yet</p>
            <p className="text-sm opacity-80 mt-1">Start a Brief to get a bespoke proposal with a price.</p>
            <Link href="/brief" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-charcoal-dark px-4 py-2.5 text-sm font-medium text-white">
              Start a Brief <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── Build progress ── */}
      <section className={`col-span-12 sm:col-span-6 lg:col-span-4 ${card}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Build progress</p>
          {lead && <span className="text-xs text-muted-foreground truncate max-w-[50%]">{lead.name}</span>}
        </div>
        <p className="mt-3 text-4xl font-bold tabular-nums">{pct}<span className="text-xl text-muted-foreground">%</span></p>
        <p className="text-sm text-muted-foreground">{currentPhase}</p>
        <div className="mt-4 h-2.5 w-full rounded-full bg-background/60 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-orange to-amber-400" style={{ width: `${pct}%` }} />
        </div>
        {/* momentum bars per phase */}
        {sortedLeadPhases.length > 0 && (
          <div className="mt-4 flex items-end gap-1.5 h-16">
            {sortedLeadPhases.map((ph) => {
              const hPct = ph.status === "completed" ? 100 : ph.status === "in_progress" ? 55 : 22;
              return (
                <div key={ph.id} className="flex-1 rounded-t-md bg-gradient-to-t from-orange/30 to-amber-400/80" style={{ height: `${hPct}%` }} title={ph.name} />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Needs you (decision loop) ── */}
      <section className={`col-span-12 sm:col-span-6 lg:col-span-4 ${card}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Needs you</p>
          <ShieldQuestion className="h-5 w-5 text-orange" />
        </div>
        {decisionCount === 0 ? (
          <div className="mt-6 flex flex-col items-center text-center py-2">
            <p className="text-sm font-medium">All clear</p>
            <p className="text-xs text-muted-foreground mt-1">We&apos;ll reach out only when a decision is needed.</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-4xl font-bold tabular-nums">{decisionCount}</p>
            <p className="text-sm text-muted-foreground">thing{decisionCount > 1 ? "s" : ""} need{decisionCount > 1 ? "" : "s"} your input</p>
            <div className="mt-3 space-y-1.5">
              {openDecisionList.slice(0, 2).map((d) => (
                <Link key={d.id} href={`/projects/${d.projectId}#decisions`} className="flex items-center justify-between gap-2 rounded-xl border border-orange/30 bg-orange/[0.04] px-3 py-2 text-xs hover:bg-orange/10 transition-colors">
                  <span className="truncate">{d.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-orange shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Your architect (gradient spotlight) ── */}
      <section className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-lime-200 via-emerald-200 to-teal-200 text-charcoal-dark min-h-[180px]">
        <p className="text-sm font-medium opacity-70">Your architect</p>
        {architect ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-dark text-white font-semibold">
                {architect.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{architect.name}</p>
                {architect.title && <p className="text-xs opacity-70 truncate">{architect.title}</p>}
              </div>
            </div>
            {lead && (
              <Link href={`/projects/${lead.id}#messages`} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm opacity-80">An architect is assigned when your build begins.</p>
        )}
      </section>

      {/* ── Latest deliverable ── */}
      <section className={`col-span-12 lg:col-span-8 ${card} flex items-center justify-between gap-4`}>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Latest deliverable</p>
          {latestDeliverable ? (
            <>
              <p className="mt-1 text-lg font-semibold truncate">{latestDeliverable.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{latestDeliverable.kind.replace("_", " ")}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Deliverables land here as your build progresses.</p>
          )}
        </div>
        {latestDeliverable?.url && (
          <a href={latestDeliverable.url} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-medium hover:border-orange/50 transition-colors">
            <ExternalLink className="h-4 w-4" /> Open
          </a>
        )}
      </section>

      {/* ── Quick start ── */}
      <Link href="/brief" className="col-span-12 lg:col-span-4 rounded-3xl border border-dashed border-orange/40 bg-orange/[0.03] p-6 flex flex-col items-center justify-center text-center hover:bg-orange/[0.06] transition-colors">
        <p className="font-semibold">Build something new</p>
        <p className="text-xs text-muted-foreground mt-1">Software · Commerce · AI · Infrastructure</p>
      </Link>
    </Reveal>
  );
}

async function getOpenDecisions(ids: string[]) {
  if (!ids.length) return [] as { id: string; title: string; projectId: string }[];
  return db
    .select({ id: decisionRequests.id, title: decisionRequests.title, projectId: decisionRequests.projectId })
    .from(decisionRequests)
    .where(and(inArray(decisionRequests.projectId, ids), eq(decisionRequests.status, "open")));
}
