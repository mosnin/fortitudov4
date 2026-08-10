import Link from "next/link";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";
import { QUIET_LINK, STATUS_PILL } from "@/lib/typography";

/**
 * ProjectList — the canonical row list for a client's projects
 * (design-product.md): hairline-divided `py-3` rows, name + one muted
 * secondary line, a neutral word pill for status. No icons, no colour, no
 * per-row cards. Server-safe: pages query and pass data down; the row layout
 * is shared by the dashboard and /projects.
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

export interface ProjectListItem {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  phases: { id: string; name: string; status: string; order: number }[];
}

export function ProjectList({
  projects,
  showQuickActions = false,
}: {
  projects: ProjectListItem[];
  /** Also render Messages / Files shortcuts on each row (dashboard). */
  showQuickActions?: boolean;
}) {
  return (
    <ul className="animate-fade-up divide-y divide-border/60">
      {projects.map((project) => {
        const total = project.phases.length;
        const done = project.phases.filter(
          (p) => p.status === "completed"
        ).length;

        return (
          <li
            key={project.id}
            className="group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="truncate text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {project.name}
                </Link>
                <span className={STATUS_PILL}>
                  {projectStatusLabels[project.status] || project.status}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {serviceLabels[project.serviceType] || project.serviceType}
                {total > 0 && (
                  <>
                    {" · "}
                    <span className="tabular-nums">
                      {done} of {total}
                    </span>{" "}
                    phases complete
                  </>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4 pt-0.5">
              {showQuickActions && (
                <>
                  <Link href="/messages" className={cn(QUIET_LINK, "hidden sm:inline")}>
                    Messages
                  </Link>
                  <Link
                    href={`/projects/${project.id}`}
                    className={cn(QUIET_LINK, "hidden sm:inline")}
                  >
                    Files
                  </Link>
                </>
              )}
              <Link href={`/projects/${project.id}`} className={QUIET_LINK}>
                View
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Loading placeholder that mirrors the same hairline rows. */
export function ProjectListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-2 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}
