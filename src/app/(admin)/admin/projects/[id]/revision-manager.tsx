"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  CAPTION,
  H3,
  STATUS_PILL,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

type RevisionStatus = "pending" | "in_progress" | "completed" | "rejected";

interface Revision {
  id: string;
  description: string;
  status: RevisionStatus;
  adminNotes: string | null;
  createdAt: string;
}

const statusOptions: RevisionStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "rejected",
];
const statusLabels: Record<RevisionStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export function RevisionManager({
  projectId,
  readOnly = false,
}: {
  projectId: string;
  /** VAs can view revision requests but not triage them. */
  readOnly?: boolean;
}) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = useCallback(() => {
    fetch(`/api/revisions?projectId=${projectId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setRevisions(data))
      .catch(() => setRevisions([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const updateStatus = async (id: string, status: RevisionStatus) => {
    setUpdating(id);
    setError(null);
    const previous = revisions.find((r) => r.id === id)?.status;
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const res = await fetch("/api/revisions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert the optimistic update on failure.
      if (previous) {
        setRevisions((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: previous } : r))
        );
      }
      setError("Could not update that revision. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <p className={BODY_MUTED}>Loading revisions…</p>;
  }

  if (revisions.length === 0) {
    return (
      <div className="py-10 text-center">
        <h3 className={H3}>No revision requests</h3>
        <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
          When the client requests changes, they&apos;ll show up here to triage.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60 border-y border-border">
      {error && <p className="py-3 text-sm text-destructive">{error}</p>}
      {revisions.map((rev) => (
        <div
          key={rev.id}
          className="space-y-2 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-foreground">{rev.description}</p>
            <span
              className={cn(
                "shrink-0",
                rev.status === "rejected" ? STATUS_PILL : STATUS_PILL_ACTIVE
              )}
            >
              {statusLabels[rev.status]}
            </span>
          </div>
          {rev.adminNotes && (
            <p className={CAPTION}>Notes: {rev.adminNotes}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className={cn(CAPTION, "tabular-nums")}>
              {new Date(rev.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {!readOnly && (
              <select
                aria-label="Revision status"
                className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2.5 text-[11px] uppercase tracking-wide text-muted-foreground outline-none transition-colors hover:border-foreground/30 focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
                value={rev.status}
                disabled={updating === rev.id}
                onChange={(e) =>
                  updateStatus(rev.id, e.target.value as RevisionStatus)
                }
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {statusLabels[opt]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
