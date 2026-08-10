"use client";

import { useState, useEffect } from "react";
import { PageHero, SegmentedTabs } from "@/components/ui/firecrawl";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
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

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Workspace"
          title="Analytics"
          description="Performance metrics for your launched projects."
        />

        {loading ? (
          <ul className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="space-y-2 py-3">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        ) : projects.length === 0 ? (
          <div className="border-t border-border py-10">
            <p className="text-sm font-medium text-foreground">
              No analytics yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Analytics will appear here once you have an active project.
            </p>
          </div>
        ) : (
          <>
            {projects.length > 1 && selectedProject && (
              <SegmentedTabs
                options={projects.map((p) => p.name)}
                value={selectedProject.name}
                onChange={(name) => {
                  const next = projects.find((p) => p.name === name);
                  if (next) setSelectedProjectId(next.id);
                }}
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
