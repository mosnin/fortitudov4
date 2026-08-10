"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Textarea } from "@/components/ui/textarea";
import {
  CrmPageHeader,
  RecordList,
  RecordRow,
  RowPill,
} from "@/components/crm";
import { PhaseTracker, type Phase } from "@/components/dashboard/phase-tracker";
import { RevisionManager } from "./revision-manager";
import { AskHelix } from "@/components/admin/ask-helix";
import { cascade, cascadeItem } from "@/lib/motion";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  GHOST_PILL,
  H3,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
} from "@/lib/typography";

const phaseStatusOptions: Phase["status"][] = [
  "pending",
  "in_progress",
  "completed",
];

const phaseStatusLabels: Record<Phase["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

interface OnboardingData {
  businessName: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  targetAudience: string | null;
  budget: string | null;
  timeline: string | null;
  additionalNotes: string | null;
}

interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number | null;
  createdAt: string;
}

interface ManageClientProps {
  /** admin/PM: full management controls. VA: read + own-task updates only. */
  canManage: boolean;
  projectId: string;
  projectName: string;
  status: string;
  statusLabel: string;
  serviceLabel: string;
  clientName: string;
  clientEmail: string;
  phases: Phase[];
  latestPayment: { amount: number; status: string } | null;
  files: ProjectFile[];
  onboarding: OnboardingData | null;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ManageClient({
  canManage,
  projectId,
  projectName,
  statusLabel,
  serviceLabel,
  clientName,
  clientEmail,
  phases: initialPhases,
  latestPayment,
  files,
  onboarding,
}: ManageClientProps) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [advancing, setAdvancing] = useState(false);
  const [phaseError, setPhaseError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msgStatus, setMsgStatus] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const allDone =
    phases.length > 0 && phases.every((p) => p.status === "completed");
  const completedCount = phases.filter((p) => p.status === "completed").length;

  const patchPhase = async (
    phaseId: string,
    phaseStatus: Phase["status"]
  ): Promise<boolean> => {
    const res = await fetch(`/api/projects/${projectId}/phases`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phaseId, status: phaseStatus }),
    });
    return res.ok;
  };

  const applyLocal = (updates: { id: string; status: Phase["status"] }[]) => {
    setPhases((prev) =>
      prev.map((p) => {
        const u = updates.find((x) => x.id === p.id);
        return u ? { ...p, status: u.status } : p;
      })
    );
  };

  // Advance = complete the current in_progress phase and start the next pending
  // one. If nothing is in progress yet, just start the earliest pending phase.
  const advancePhase = async () => {
    setPhaseError(null);
    setAdvancing(true);
    try {
      const sorted = [...phases].sort((a, b) => a.order - b.order);
      const inProgress = sorted.find((p) => p.status === "in_progress");
      const nextPending = sorted.find((p) => p.status === "pending");

      const updates: { id: string; status: Phase["status"] }[] = [];
      if (inProgress) updates.push({ id: inProgress.id, status: "completed" });
      if (nextPending) updates.push({ id: nextPending.id, status: "in_progress" });
      if (updates.length === 0) return;

      for (const u of updates) {
        const ok = await patchPhase(u.id, u.status);
        if (!ok) throw new Error("Failed to update phase");
      }
      applyLocal(updates);
    } catch {
      setPhaseError("Could not advance the phase. Please try again.");
    } finally {
      setAdvancing(false);
    }
  };

  const setPhaseStatus = async (phaseId: string, next: Phase["status"]) => {
    setPhaseError(null);
    const ok = await patchPhase(phaseId, next);
    if (ok) {
      applyLocal([{ id: phaseId, status: next }]);
    } else {
      setPhaseError("Could not update that phase. Please try again.");
    }
  };

  const sendMessage = async () => {
    const content = message.trim();
    if (!content) return;
    setSending(true);
    setMsgStatus(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }
      setMessage("");
      setMsgStatus({ ok: true, text: "Message sent to the client." });
    } catch (err) {
      setMsgStatus({
        ok: false,
        text: err instanceof Error ? err.message : "Failed to send message",
      });
    } finally {
      setSending(false);
    }
  };

  const selectClass =
    "h-8 cursor-pointer rounded-md border border-border/70 bg-background px-2 text-xs text-muted-foreground outline-none transition-colors hover:border-foreground/25 focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className="space-y-3">
          <Link href="/admin/projects" className={QUIET_LINK}>
            Back to projects
          </Link>
          <CrmPageHeader
            section="Projects."
            title={projectName}
            subtitle={`${clientName} · ${serviceLabel} · ${completedCount} of ${phases.length} phases complete.`}
            action={
              <>
                <AskHelix
                  resourceKind="project"
                  resourceId={projectId}
                  title={projectName}
                />
                <RowPill>{statusLabel}</RowPill>
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left: Phase management, revisions, messaging */}
          <motion.div
            variants={cascade}
            initial="hidden"
            animate="visible"
            className="space-y-10 lg:col-span-2"
          >
            {/* Phases */}
            <motion.section
              variants={cascadeItem}
              className="border-b border-border pb-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className={SECTION_LABEL}>
                    {completedCount} of {phases.length} phases complete
                  </p>
                  <h2 className={H3}>
                    {canManage ? "Phase Management" : "Phases"}
                  </h2>
                </div>
                {canManage && (
                  <button
                    onClick={advancePhase}
                    disabled={advancing || allDone || phases.length === 0}
                    className={cn(
                      PRIMARY_PILL,
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    {advancing ? "Advancing…" : "Advance Phase"}
                  </button>
                )}
              </div>
              <div className="mt-6 space-y-6">
                {phaseError && (
                  <p className="text-sm text-destructive">{phaseError}</p>
                )}
                {phases.length === 0 ? (
                  <p className={BODY_MUTED}>
                    No phases have been set up for this project yet.
                  </p>
                ) : (
                  <>
                    <PhaseTracker phases={phases} />
                    {canManage && (
                      <div
                        className={cn(
                          SECTION_RHYTHM,
                          "border-t border-border pt-4"
                        )}
                      >
                        <p className={SECTION_LABEL}>Set phase status</p>
                        <RecordList>
                          {[...phases]
                            .sort((a, b) => a.order - b.order)
                            .map((phase, i) => (
                              <RecordRow
                                key={phase.id}
                                index={i}
                                primary={phase.name}
                                meta={
                                  <select
                                    aria-label={`Status for ${phase.name}`}
                                    className={selectClass}
                                    value={phase.status}
                                    onChange={(e) =>
                                      setPhaseStatus(
                                        phase.id,
                                        e.target.value as Phase["status"]
                                      )
                                    }
                                  >
                                    {phaseStatusOptions.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {phaseStatusLabels[opt]}
                                      </option>
                                    ))}
                                  </select>
                                }
                              />
                            ))}
                        </RecordList>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.section>

            {/* Revision requests */}
            <motion.section
              variants={cascadeItem}
              className="border-b border-border pb-8"
            >
              <h2 className={cn(H3, "pb-4")}>Revision Requests</h2>
              <RevisionManager projectId={projectId} readOnly={!canManage} />
            </motion.section>

            {/* Admin message to client */}
            <motion.section variants={cascadeItem}>
              <h2 className={cn(H3, "pb-4")}>Message Client</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Send a message to the client…"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {msgStatus && (
                  <p
                    className={
                      msgStatus.ok
                        ? "text-sm text-muted-foreground"
                        : "text-sm text-destructive"
                    }
                  >
                    {msgStatus.text}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  {message.trim() && (
                    <button
                      type="button"
                      className={GHOST_PILL}
                      onClick={() => setMessage("")}
                    >
                      Discard
                    </button>
                  )}
                  <button
                    disabled={!message.trim() || sending}
                    onClick={sendMessage}
                    className={cn(
                      PRIMARY_PILL,
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    {sending ? "Sending…" : "Send Message"}
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>

          {/* Right: Client info, onboarding, files */}
          <motion.div
            variants={cascade}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            <motion.section variants={cascadeItem}>
              <p className={cn(SECTION_LABEL, "border-b border-border pb-3")}>
                Client Details
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-right">{clientName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="break-all text-right">{clientEmail}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Service</span>
                  <span className="text-right">{serviceLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <RowPill>{statusLabel}</RowPill>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Payment</span>
                  {latestPayment ? (
                    <span className="flex items-center gap-2 text-right">
                      <span className="tabular-nums">
                        {formatUsd(latestPayment.amount)}
                      </span>
                      <RowPill>{latestPayment.status}</RowPill>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section variants={cascadeItem}>
              <p className={cn(SECTION_LABEL, "border-b border-border pb-3")}>
                Onboarding Data
              </p>
              <div className="mt-4 space-y-3 text-sm">
                {onboarding ? (
                  <>
                    <div>
                      <span className="mb-1 block text-muted-foreground">
                        Business
                      </span>
                      <span>{onboarding.businessName}</span>
                    </div>
                    {onboarding.industry && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Industry
                        </span>
                        <span>{onboarding.industry}</span>
                      </div>
                    )}
                    {onboarding.website && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Website
                        </span>
                        <span className="break-all">{onboarding.website}</span>
                      </div>
                    )}
                    {onboarding.budget && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Budget
                        </span>
                        <span>{onboarding.budget}</span>
                      </div>
                    )}
                    {onboarding.timeline && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Timeline
                        </span>
                        <span>{onboarding.timeline}</span>
                      </div>
                    )}
                    {onboarding.targetAudience && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Target Audience
                        </span>
                        <p className="text-muted-foreground">
                          {onboarding.targetAudience}
                        </p>
                      </div>
                    )}
                    {onboarding.description && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Description
                        </span>
                        <p className="text-muted-foreground">
                          {onboarding.description}
                        </p>
                      </div>
                    )}
                    {onboarding.additionalNotes && (
                      <div>
                        <span className="mb-1 block text-muted-foreground">
                          Additional Notes
                        </span>
                        <p className="text-muted-foreground">
                          {onboarding.additionalNotes}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className={BODY_MUTED}>
                    No onboarding submission on file yet.
                  </p>
                )}
              </div>
            </motion.section>

            <motion.section variants={cascadeItem}>
              <p className={cn(SECTION_LABEL, "border-b border-border pb-3")}>
                Client Files
              </p>
              {files.length === 0 ? (
                <p className={cn(BODY_MUTED, "mt-4")}>
                  No files uploaded for this project yet.
                </p>
              ) : (
                <RecordList className="mt-2">
                  {files.map((f, i) => (
                    <RecordRow
                      key={f.id}
                      index={i}
                      primary={
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {f.name}
                        </a>
                      }
                      meta={
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {formatSize(f.size)}
                        </span>
                      }
                    />
                  ))}
                </RecordList>
              )}
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
