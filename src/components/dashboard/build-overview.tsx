import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { PhaseTracker } from "@/components/ui/phase-tracker";
import { cn } from "@/lib/utils";
import { HelixAskForm } from "./helix-ask-form";
import { projectStatusLabels, serviceLabels } from "./project-list";

/**
 * Build overview — the client dashboard's top half: a hero card for the build
 * in flight, a Helix prompt card, and the recent-builds table.
 *
 * Server-safe and purely presentational: the dashboard page loads the rows and
 * passes them down. Every colour is a theme token (or a brand orange that holds
 * contrast in both themes), so light and dark read the same.
 */

export interface BuildPhase {
  id: string;
  name: string;
  status: string;
  order: number;
}

export interface BuildRow {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  createdAt: Date;
  phases: BuildPhase[];
  /** Staff views only: whose build it is. */
  client?: string;
}

const CARD =
  "rounded-2xl border border-border/70 bg-card text-card-foreground " +
  "shadow-[0_1px_2px_rgba(15,16,16,0.04),0_12px_32px_-16px_rgba(15,16,16,0.12)] " +
  "dark:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_12px_32px_-16px_rgba(0,0,0,0.6)]";

const BRAND_BUTTON =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-5 text-sm font-medium " +
  "bg-[#ea580c] text-white hover:bg-[#c2410c] active:scale-[0.98] transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

const BRAND_OUTLINE_BUTTON =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-5 text-sm font-medium " +
  "border border-brand/70 text-brand hover:bg-brand-subtle active:scale-[0.98] transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

/* ─── Phase helpers ──────────────────────────────────────────────────────── */

export function phaseProgress(phases: BuildPhase[]) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const done = sorted.filter((p) => p.status === "completed").length;
  const currentIndex = sorted.findIndex((p) => p.status === "in_progress");
  const fallback = sorted.findIndex((p) => p.status === "pending");
  const at = currentIndex >= 0 ? currentIndex : fallback;
  return {
    total: sorted.length,
    done,
    pct: sorted.length ? Math.round((done / sorted.length) * 100) : 0,
    current: at >= 0 ? sorted[at] : undefined,
    next: at >= 0 ? sorted.slice(at + 1).find((p) => p.status !== "completed") : undefined,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Welcome row ────────────────────────────────────────────────────────── */

export function WelcomeRow({
  firstName,
  badge,
  tip = { label: "Ask Helix where your build stands", href: "/helix" },
}: {
  firstName: string;
  /** Small chip after the greeting — the staff role on the admin side. */
  badge?: string;
  tip?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Welcome back, {firstName}!
        </h1>
        {badge && <TonePill tone="brand">{badge}</TonePill>}
      </div>
      <Link
        href={tip.href}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/50"
      >
        <span aria-hidden>👋</span>
        Pro tip:
        <span className="font-medium text-brand">{tip.label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/* ─── Hero: the build in flight ──────────────────────────────────────────── */

export function BuildHeroCard({
  activeCount,
  lead,
}: {
  activeCount: number;
  lead: BuildRow | undefined;
}) {
  const progress = lead ? phaseProgress(lead.phases) : undefined;

  return (
    <div className={cn(CARD, "relative flex flex-col justify-between overflow-visible p-7 sm:p-8")}>
      <BuildCubes className="pointer-events-none absolute -top-14 right-2 hidden h-40 w-44 sm:block" />

      <div className="flex items-center gap-4">
        <NumberTicker
          value={activeCount}
          className="text-6xl leading-none font-light tracking-tight text-foreground"
        />
        <span className="text-lg text-muted-foreground">
          {activeCount === 1 ? "build in progress" : "builds in progress"}
        </span>
      </div>

      <div className="mt-8 space-y-4">
        {lead && progress ? (
          <>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{lead.name}</span>{" "}
              {progress.current ? (
                <>
                  is in{" "}
                  <span className="font-medium text-foreground">
                    {progress.current.name}
                  </span>
                  .
                  {progress.next && <> Up next: {progress.next.name}.</>}
                </>
              ) : (
                <>
                  is{" "}
                  {(projectStatusLabels[lead.status] ?? lead.status).toLowerCase()}
                  .
                </>
              )}
            </p>
            {progress.total > 0 && (
              <PhaseTracker
                className="max-w-md"
                phases={[...lead.phases].sort((a, b) => a.order - b.order)}
              />
            )}
          </>
        ) : (
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Nothing in flight yet. Start a project and you&rsquo;ll follow every
            phase of the build right here.
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {lead ? (
            <>
              <Link href={`/projects/${lead.id}`} className={BRAND_BUTTON}>
                Open project
              </Link>
              <Link href="/messages" className={BRAND_OUTLINE_BUTTON}>
                Message the team
              </Link>
            </>
          ) : (
            <>
              <Link href="/onboarding" className={BRAND_BUTTON}>
                Start a project
              </Link>
              <Link href="/services" className={BRAND_OUTLINE_BUTTON}>
                Browse services
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="max-w-md">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{label}</span>
        <span>{pct}%</span>
      </p>
    </div>
  );
}

/**
 * Two isometric cubes — the reference's illustration, drawn in SVG so it takes
 * the theme: a brand-orange cube and a neutral one that follows the surface.
 */
export function BuildCubes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 160" className={className} aria-hidden>
      <defs>
        <radialGradient id="cube-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="146" rx="62" ry="10" className="text-foreground" fill="url(#cube-shadow)" />
      {/* Neutral cube (back-left) */}
      <g transform="translate(22 62) rotate(-8 40 40)">
        <polygon points="40,0 80,18 40,36 0,18" className="fill-zinc-200 dark:fill-zinc-600" />
        <polygon points="0,18 40,36 40,80 0,62" className="fill-zinc-100 dark:fill-zinc-700" />
        <polygon points="40,36 80,18 80,62 40,80" className="fill-zinc-300 dark:fill-zinc-800" />
      </g>
      {/* Brand cube (front-right, lifted) */}
      <g transform="translate(82 10) rotate(10 42 42)">
        <polygon points="42,0 84,19 42,38 0,19" fill="#fdba74" />
        <polygon points="0,19 42,38 42,84 0,65" fill="#fb923c" />
        <polygon points="42,38 84,19 84,65 42,84" fill="#ea580c" />
      </g>
    </svg>
  );
}

/* ─── Helix prompt card ──────────────────────────────────────────────────── */

export function HelixPromptCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] p-7 text-white shadow-[0_12px_32px_-16px_rgba(234,88,12,0.6)] sm:p-8 dark:from-[#c2410c] dark:to-[#9a3412] dark:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)]">
      <BlueprintLines className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.09]" />

      <div className="relative flex h-full flex-col justify-center gap-6">
        <p className="max-w-sm text-xl leading-snug font-medium">
          Ask Helix anything about your build
        </p>
        <HelixAskForm />
        <p className="text-xs text-white/75">
          Helix reads your project and answers. To request changes, message the
          team.
        </p>
      </div>
    </div>
  );
}

/** Faint blueprint grid + contour — stands in for the reference's map. */
export function BlueprintLines({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden preserveAspectRatio="none" viewBox="0 0 400 240">
      <defs>
        <pattern id="helix-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="240" fill="url(#helix-grid)" />
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M-20 190 C 80 140, 150 230, 260 170 S 380 90, 430 120" />
        <path d="M-20 60 C 60 20, 170 110, 250 50 S 360 10, 430 40" />
        <circle cx="330" cy="200" r="46" />
        <circle cx="330" cy="200" r="72" />
      </g>
    </svg>
  );
}

/* ─── Recent builds table ────────────────────────────────────────────────── */

const STATUS_TONE: Record<string, Tone> = {
  in_progress: "brand",
  revision: "amber",
  completed: "green",
  onboarding: "sky",
  payment_pending: "muted",
  cancelled: "muted",
};

function StatusPill({ status }: { status: string }) {
  return (
    <TonePill tone={STATUS_TONE[status] ?? "muted"}>
      {projectStatusLabels[status] ?? status}
    </TonePill>
  );
}

export function RecentBuildsCard({
  builds,
  totalCount,
  title = "Your recent builds",
  basePath = "/projects",
  emptyText = "No builds yet. Once a project starts, it shows up here with its current phase and progress.",
}: {
  builds: BuildRow[];
  totalCount: number;
  title?: string;
  /** Where "View details" and "Show all" point: /projects or /admin/projects. */
  basePath?: string;
  emptyText?: string;
}) {
  const showClient = builds.some((b) => b.client);
  const headings = [
    "Started",
    ...(showClient ? ["Client"] : []),
    "Project",
    "Service",
    "Current phase",
    "Progress",
    "Status",
  ];
  return (
    <section className={cn(CARD, "px-5 pt-6 pb-5 sm:px-7")}>
      <h2 className="text-lg text-foreground/80">{title}</h2>

      {builds.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          {/* Table from md up */}
          <div className="mt-4 hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  {headings.map((h) => (
                    <th key={h} scope="col" className="pb-3 pr-4 font-medium text-foreground">
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="pb-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {builds.map((b) => {
                  const p = phaseProgress(b.phases);
                  return (
                    <tr key={b.id} className="border-b border-border/60 text-muted-foreground transition-colors hover:bg-muted/30">
                      <td className="py-3.5 pr-4 whitespace-nowrap tabular-nums">{formatDate(b.createdAt)}</td>
                      {showClient && (
                        <td className="max-w-[10rem] truncate py-3.5 pr-4">{b.client ?? "—"}</td>
                      )}
                      <td className="max-w-[14rem] truncate py-3.5 pr-4 text-foreground/90">{b.name}</td>
                      <td className="py-3.5 pr-4">{serviceLabels[b.serviceType] ?? b.serviceType}</td>
                      <td className="py-3.5 pr-4">
                        {b.status === "completed" ? "Delivered" : p.current?.name ?? "—"}
                      </td>
                      <td className="py-3.5 pr-4">
                        {p.total > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-brand" style={{ width: `${p.pct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums">{p.pct}%</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <Link href={`${basePath}/${b.id}`} className="inline-flex items-center gap-0.5 font-medium text-brand hover:underline">
                          View details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stacked rows on phones */}
          <ul className="mt-3 divide-y divide-border/60 md:hidden">
            {builds.map((b) => {
              const p = phaseProgress(b.phases);
              return (
                <li key={b.id}>
                  <Link href={`${basePath}/${b.id}`} className="flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{b.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {b.client && `${b.client} · `}
                        {serviceLabels[b.serviceType] ?? b.serviceType}
                        {p.total > 0 && ` · ${p.pct}%`}
                      </p>
                    </div>
                    <StatusPill status={b.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {totalCount > builds.length && (
        <Link href={basePath} className="mt-4 inline-flex items-center gap-0.5 text-sm font-medium text-brand hover:underline">
          Show all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </section>
  );
}

/* ─── Workspace cards: invoices, revisions, assets, chat ─────────────────── */

export function WorkspaceCard({
  title,
  href,
  linkLabel,
  headline,
  headlineMeta,
  children,
  className,
}: {
  title: string;
  href: string;
  linkLabel: string;
  headline?: React.ReactNode;
  headlineMeta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(CARD, "flex flex-col p-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] text-foreground/80">{title}</h2>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-brand hover:underline"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {headline !== undefined && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-light tracking-tight text-foreground tabular-nums">
            {typeof headline === "number" ? <NumberTicker value={headline} locale /> : headline}
          </span>
          {headlineMeta && (
            <span className="text-sm text-muted-foreground">{headlineMeta}</span>
          )}
        </div>
      )}
      {children && <div className="mt-4 flex-1">{children}</div>}
    </section>
  );
}

/** Paid-of-billed meter for the invoices card. */
export function PaidMeter({ paid, billed }: { paid: number; billed: number }) {
  const pct = billed > 0 ? Math.min(100, Math.round((paid / billed) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-green-600 dark:bg-green-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Compact list used inside workspace cards. */
export function MiniList({
  items,
  empty,
}: {
  items: { id: string; primary: React.ReactNode; meta?: React.ReactNode; href?: string; pill?: React.ReactNode }[];
  empty: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="divide-y divide-border/60">
      {items.map((item) => {
        const body = (
          <>
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground/90">{item.primary}</p>
              {item.meta && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.meta}</p>
              )}
            </div>
            {item.pill}
          </>
        );
        return (
          <li key={item.id}>
            {item.href ? (
              <Link href={item.href} className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-foreground">
                {body}
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-3 py-2.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const TONE: Record<string, string> = {
  brand: "bg-brand-subtle text-brand",
  green: "bg-green-500/15 text-green-700 dark:text-green-400",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  red: "bg-red-500/15 text-red-700 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
};

export type Tone = keyof typeof TONE;

/** Whole dollars from integer cents, rolling. Money is always cents (AGENTS.md). */
export function MoneyTicker({ cents }: { cents: number }) {
  return <NumberTicker value={Math.round(cents / 100)} prefix="$" locale />;
}

export function TonePill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase",
        TONE[tone]
      )}
    >
      {children}
    </span>
  );
}

export function relativeTime(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export { CARD as DASH_CARD, BRAND_BUTTON, BRAND_OUTLINE_BUTTON, StatusPill, formatDate };
