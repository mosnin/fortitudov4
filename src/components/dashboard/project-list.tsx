import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/firecrawl";
import {
  PhaseTrackerHorizontal,
  type Phase,
} from "@/components/dashboard/phase-tracker";
import { ArrowRight, MessageSquare, Upload } from "lucide-react";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * ProjectList — hairline-divided project sections (ported from Legendary's
 * campaign-list patterns, project-domain). Server-safe: pages query and pass
 * data down; the row layout is shared by the dashboard and /projects.
 */

export const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

export const projectStatusLabels: Record<string, string> = {
  onboarding: "Onboarding",
  payment_pending: "Payment Pending",
  in_progress: "In Progress",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Status → uppercase-mono text color (fused system semantics). */
export const projectStatusTone: Record<string, string> = {
  onboarding: "text-muted-foreground",
  payment_pending: "text-warning",
  in_progress: "text-brand",
  revision: "text-warning",
  completed: "text-success",
  cancelled: "text-destructive",
};

export interface ProjectListItem {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  phases: Phase[];
}

export function ProjectList({
  projects,
  showQuickActions = false,
}: {
  projects: ProjectListItem[];
  /** Also render Messages / Upload shortcuts under each project (dashboard). */
  showQuickActions?: boolean;
}) {
  return (
    <div className="animate-fade-up divide-y divide-border border-b border-border">
      {projects.map((project) => {
        const phases = [...project.phases].sort((a, b) => a.order - b.order);
        const completedPhases = phases.filter(
          (p) => p.status === "completed"
        ).length;

        return (
          <section key={project.id} className="py-8 first:pt-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  <Link
                    href={`/projects/${project.id}`}
                    className="transition-colors hover:text-muted-foreground"
                  >
                    {project.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {serviceLabels[project.serviceType] || project.serviceType}
                </p>
              </div>
              <span
                className={cn(
                  "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
                  projectStatusTone[project.status] || "text-muted-foreground"
                )}
              >
                {projectStatusLabels[project.status] || project.status}
              </span>
            </div>

            {phases.length > 0 && (
              <div className="mt-6 space-y-4">
                <BracketLabel
                  n={completedPhases}
                  m={phases.length}
                  label="Phases"
                />
                <PhaseTrackerHorizontal phases={phases} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              {showQuickActions ? (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/messages">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Messages
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projects/${project.id}`}>
                      <Upload className="mr-1 h-4 w-4" />
                      Upload Files
                    </Link>
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${project.id}`} className="group">
                  View Project
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
