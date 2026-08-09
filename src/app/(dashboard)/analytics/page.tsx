"use client";

import { useState, useEffect } from "react";
import { PageHero, SegmentedTabs } from "@/components/ui/firecrawl";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { EmptyState } from "@/components/ui/empty-state";
import { AsciiField } from "@/components/ui/ascii-field";
import { TableSkeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

/**
 * Analytics — event metrics for each launched project, restyled to the fused
 * system. Keeps the existing /api/projects + /api/analytics contracts.
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
    <div className="space-y-10">
      <PageHero
        title="Analytics"
        description="Performance metrics for your launched projects."
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <div className="animate-fade-up relative overflow-hidden rounded-xl border border-border">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 70%)",
            }}
          >
            <AsciiField className="h-full w-full opacity-40" />
          </div>
          <div className="relative">
            <EmptyState
              icon={BarChart3}
              title="No analytics yet"
              description="Analytics will appear here once you have an active project."
            />
          </div>
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
  );
}
