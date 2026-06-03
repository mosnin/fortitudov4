import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blueprints, projects } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { formatPrice } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Clock, FileText, Layers } from "lucide-react";
import Link from "next/link";
import { AcceptBlueprintButton } from "./accept-button";

// Per-user authed data — always render on demand.
export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-charcoal-dark py-10 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Masthead */}
        <div className="text-center mb-8">
          <Badge variant="orange" className="mb-3">Your Blueprint</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{blueprint.title}</h1>
          {blueprint.summary && (
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{blueprint.summary}</p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange" />
              {blueprint.estimatedTimeline}
            </span>
            {blueprint.validUntil && (
              <span>Valid until {new Date(blueprint.validUntil).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Scope */}
        <section className="rounded-2xl border border-border bg-card p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-orange" />
            <h2 className="font-semibold">What we&apos;ll build</h2>
          </div>
          <ul className="space-y-3">
            {scope.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.detail && <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Architecture */}
        {blueprint.architectureNotes && (
          <section className="rounded-2xl border border-border bg-card p-6 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-orange" />
              <h2 className="font-semibold">Architecture</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{blueprint.architectureNotes}</p>
          </section>
        )}

        {/* Investment */}
        <section className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Investment</h2>
          <div className="space-y-3">
            {lineItems.map((li, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{li.label}</p>
                  {li.description && <p className="text-xs text-muted-foreground mt-0.5">{li.description}</p>}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{formatPrice(li.amount)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-orange">{formatPrice(blueprint.total)}</span>
          </div>
        </section>

        {/* Action */}
        {accepted ? (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
            <p className="font-semibold text-success">Blueprint accepted</p>
            <p className="text-sm text-muted-foreground mt-1">Your build is underway.</p>
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
              <Link href={`/projects/${project.id}#messages`} className="text-orange hover:underline">
                Talk to your architect
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
