"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
  RowSelect,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";

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
    return <RecordListSkeleton rows={3} />;
  }

  if (revisions.length === 0) {
    return (
      <EmptyState
        title="No revision requests"
        description="When the client requests changes, they’ll show up here to triage."
      />
    );
  }

  return (
    <div>
      {error && <p className="pb-3 text-sm text-destructive">{error}</p>}
      <RecordList>
        {revisions.map((rev, i) => (
          <RecordRow
            key={rev.id}
            index={i}
            primary={<span title={rev.description}>{rev.description}</span>}
            status={
              <RowPill emphasis={rev.status === "in_progress"}>
                {statusLabels[rev.status]}
              </RowPill>
            }
            secondary={[
              new Date(rev.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              rev.adminNotes ? `Notes: ${rev.adminNotes}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            meta={
              readOnly ? undefined : (
                <RowSelect
                  aria-label={`Status for revision ${i + 1}`}
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
                </RowSelect>
              )
            }
          />
        ))}
      </RecordList>
    </div>
  );
}
