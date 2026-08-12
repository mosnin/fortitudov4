"use client";

import { useState, useEffect } from "react";
import { CrmPageHeader, RecordListSkeleton, TabStrip } from "@/components/crm";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { PAGE_RHYTHM, READING_COL } from "@/lib/typography";

interface Project {
  id: string;
  name: string;
}

/**
 * Analytics — event metrics for each launched project. Keeps the existing
 * /api/projects + /api/analytics contracts.
 */
export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const status = loading
    ? "Pulling your event data…"
    : projects.length === 0
      ? "Nothing to measure yet — analytics start at launch."
      : selectedProject
        ? `Tracking ${selectedProject.name}.`
        : "Pick a project to see its events.";

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title="Analytics"
          subtitle={status}
        />

        {loading ? (
          <RecordListSkeleton rows={4} />
        ) : projects.length === 0 ? (
          <EmptyState
            className="border-t border-border/60"
            title="No analytics yet"
            description="Analytics will appear here once you have an active project."
          />
        ) : (
          <>
            {projects.length > 1 && selectedProjectId && (
              <TabStrip
                tabs={projects.map((p) => ({ key: p.id, label: p.name }))}
                active={selectedProjectId}
                onChange={setSelectedProjectId}
                ariaLabel="Project"
              />
            )}

            {selectedProjectId && (
              <AnalyticsOverview projectId={selectedProjectId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
