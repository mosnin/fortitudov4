import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blueprints, projects } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { formatPrice } from "@/lib/catalog";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
import { Check, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { AcceptBlueprintButton } from "./accept-button";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl";

export default async function BlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Provision the user row on first visit — never depend on the Clerk webhook.
  const dbUser = await getOrCreateCurrentUser();
  if (!dbUser) redirect("/sign-in");

  const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.id, id));
  if (!blueprint) notFound();

  const [project] = await db.select().from(projects).where(eq(projects.id, blueprint.projectId));
  if (!project) notFound();
  if (project.userId !== dbUser.id && dbUser.role !== "admin") notFound();

  const accepted = blueprint.status === "accepted";
  // jsonb columns; guard against legacy rows where they may be null.
  const scope = blueprint.scope ?? [];
  const lineItems = blueprint.lineItems ?? [];

  return (
    <div className="min-h-screen bg-charcoal-dark px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Masthead */}
        <Reveal className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-8 text-center sm:p-10">
          <AsciiField className="absolute inset-0 h-full w-full opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.18),transparent_65%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.25em] text-orange/80">
              Your Blueprint
            </p>
            <h1 className="font-brand mt-3 text-3xl sm:text-5xl">{blueprint.title}</h1>
            {blueprint.summary && (
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                {blueprint.summary}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange" />
                {blueprint.estimatedTimeline}
              </span>
              {blueprint.validUntil && (
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1">
                  Valid until {new Date(blueprint.validUntil).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </Reveal>

        <RevealGroup className="space-y-5">
          {/* Scope */}
          <RevealItem>
            <section className={`${card} p-6 sm:p-7`}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-orange/80">
                What we&apos;ll build
              </h2>
              <ul className="mt-5 space-y-4">
                {scope.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </RevealItem>

          {/* Architecture */}
          {blueprint.architectureNotes && (
            <RevealItem>
              <section className={`${card} p-6 sm:p-7`}>
                <h2 className="text-xs uppercase tracking-[0.2em] text-orange/80">
                  Architecture
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {blueprint.architectureNotes}
                </p>
              </section>
            </RevealItem>
          )}

          {/* Investment */}
          <RevealItem>
            <section className={`${card} p-6 sm:p-7`}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-orange/80">
                Investment
              </h2>
              <div className="mt-5 space-y-3">
                {lineItems.map((li, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{li.label}</p>
                      {li.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{li.description}</p>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-sm font-medium tabular-nums">
                      {formatPrice(li.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-5">
                <span className="font-semibold">Total</span>
                <span className="font-brand text-3xl text-orange tabular-nums">
                  {formatPrice(blueprint.total)}
                </span>
              </div>
            </section>
          </RevealItem>

          {/* Action */}
          <RevealItem>
            {accepted ? (
              <div className="rounded-3xl border border-success/30 bg-success/5 p-7 text-center">
                <p className="font-semibold text-success">Blueprint accepted</p>
                <p className="mt-1 text-sm text-muted-foreground">Your build is underway.</p>
                <Link
                  href={`/projects/${project.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-orange hover:underline"
                >
                  Go to your Studio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <AcceptBlueprintButton blueprintId={blueprint.id} projectId={project.id} />
                <p className="text-center text-xs text-muted-foreground">
                  Accepting starts your build. Need a change?{" "}
                  <Link
                    href={`/projects/${project.id}#messages`}
                    className="text-orange hover:underline"
                  >
                    Talk to your architect
                  </Link>
                  .
                </p>
              </div>
            )}
          </RevealItem>
        </RevealGroup>
      </div>
    </div>
  );
}
