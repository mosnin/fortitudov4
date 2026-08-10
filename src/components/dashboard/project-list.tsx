import Link from "next/link";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import {
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowAction,
  RowPill,
} from "@/components/crm";
import { services } from "@/lib/services";

/**
 * ProjectList — the client's projects rendered with the kit's canonical row
 * vocabulary (`RecordList` + `RecordRow`): name + neutral status pill, one
 * truncating secondary line joined with " · ", and hover-revealed row actions.
 *
 * Server-safe: pages query and pass data down; the row layout is shared by the
 * dashboard and /projects.
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
  /** Also render the Messages shortcut on each row (dashboard). */
  showQuickActions?: boolean;
}) {
  return (
    <RecordList>
      {projects.map((project, index) => {
        const total = project.phases.length;
        const done = project.phases.filter(
          (p) => p.status === "completed"
        ).length;

        const facts = [serviceLabels[project.serviceType] || project.serviceType];
        if (total > 0) facts.push(`${done} of ${total} phases complete`);

        return (
          <RecordRow
            key={project.id}
            index={index}
            primary={
              <Link
                href={`/projects/${project.id}`}
                className="transition-colors hover:text-muted-foreground"
              >
                {project.name}
              </Link>
            }
            status={
              <RowPill>
                {projectStatusLabels[project.status] || project.status}
              </RowPill>
            }
            secondary={
              <span className="tabular-nums">{facts.join(" · ")}</span>
            }
            actions={
              <>
                {showQuickActions && (
                  <RowAction label="Messages" href="/messages">
                    <MessageSquare size={14} />
                  </RowAction>
                )}
                <RowAction
                  label="Open project"
                  href={`/projects/${project.id}`}
                >
                  <ArrowUpRight size={14} />
                </RowAction>
              </>
            }
          />
        );
      })}
    </RecordList>
  );
}

/** Loading placeholder — the kit's row skeleton. */
export function ProjectListSkeleton({ rows = 3 }: { rows?: number }) {
  return <RecordListSkeleton rows={rows} />;
}
