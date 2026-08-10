"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/ui/firecrawl";
import { PhaseTracker, type Phase } from "@/components/dashboard/phase-tracker";
import {
  LaunchPipeline,
  type LaunchPipelineData,
} from "@/components/dashboard/launch-pipeline";
import { FilePreviewCard } from "@/components/dashboard/file-preview";
import { ProjectComments } from "@/components/dashboard/project-comments";
import { NPSSurvey } from "@/components/dashboard/nps-survey";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { UploadDropzone } from "@/lib/uploadthing";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  items: { description: string; amount: string }[];
  subtotal: string;
  tax: string;
  total: string;
  projectName: string;
  clientName: string;
}

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    serviceType: string;
    /** Display label, e.g. "In Progress". */
    status: string;
    /** Raw status key, e.g. "in_progress" — drives the status tone. */
    statusKey: string;
    createdAt: string;
  };
  phases: Phase[];
  files: { name: string; url: string; size: string; type: string }[];
  invoice: InvoiceData | null;
  showSurvey: boolean;
  pipeline: LaunchPipelineData | null;
}

const tabItems = [
  { value: "progress", label: "Progress" },
  { value: "comments", label: "Comments" },
  { value: "analytics", label: "Analytics" },
];

type FileItem = { name: string; url: string; size: string; type: string };

type RevisionStatus = "pending" | "in_progress" | "completed" | "rejected";

interface Revision {
  id: string;
  description: string;
  status: RevisionStatus;
  adminNotes: string | null;
  createdAt: string;
}

const revisionStatusLabels: Record<RevisionStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectDetailClient({
  project,
  phases,
  files,
  invoice,
  showSurvey: initialShowSurvey,
  pipeline,
}: ProjectDetailClientProps) {
  const [revisionText, setRevisionText] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showSurvey, setShowSurvey] = useState(initialShowSurvey);
  // Files start from the server-rendered prop and grow as uploads complete.
  const [fileList, setFileList] = useState<FileItem[]>(files);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchRevisions = useCallback(() => {
    fetch(`/api/revisions?projectId=${project.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setRevisions(data))
      .catch(() => setRevisions([]));
  }, [project.id]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const handleSubmitRevision = async () => {
    if (!revisionText.trim()) return;
    setSubmittingRevision(true);
    setRevisionError(null);
    try {
      const res = await fetch("/api/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          description: revisionText,
        }),
      });
      if (res.ok) {
        setRevisionText("");
        fetchRevisions();
      } else {
        setRevisionError("Couldn't submit your request. Please try again.");
      }
    } catch {
      setRevisionError("Couldn't submit your request. Please try again.");
    } finally {
      setSubmittingRevision(false);
    }
  };

  const completedPhases = phases.filter((p) => p.status === "completed").length;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className="space-y-4">
          <Link href="/projects" className={QUIET_LINK}>
            Back to projects
          </Link>
          <PageHero
            section="Projects"
            title={project.name}
            description={`${project.serviceType} · Started ${project.createdAt}`}
            action={
              <span className={STATUS_PILL_ACTIVE}>{project.status}</span>
            }
          />
        </div>

        {/* NPS Survey */}
        {showSurvey && (
          <NPSSurvey
            projectId={project.id}
            projectName={project.name}
            onDismiss={() => setShowSurvey(false)}
          />
        )}

        {/* Tabbed content */}
        <Tabs.Root defaultValue="progress">
          <Tabs.List className="mb-6 inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {tabItems.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-[13px] transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Progress tab */}
          <Tabs.Content value="progress">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                {/* Launch pipeline — the same stage journey the team tracks in
                    the Client CRM, mirrored read-only for the client. */}
                <LaunchPipeline data={pipeline} />

                {/* Build progress */}
                <section className={SECTION_RHYTHM}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className={SECTION_LABEL}>Build progress</p>
                    {phases.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="tabular-nums text-foreground/70">
                          {completedPhases} of {phases.length}
                        </span>{" "}
                        phases complete
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border pt-5">
                    {phases.length > 0 ? (
                      <PhaseTracker phases={phases} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Phases will appear here once your project kicks off.
                      </p>
                    )}
                  </div>
                </section>

                {/* Revision request */}
                <section className={SECTION_RHYTHM}>
                  <p className={SECTION_LABEL}>Request a revision</p>
                  <Textarea
                    placeholder="Describe what you'd like changed..."
                    rows={3}
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={!revisionText.trim() || submittingRevision}
                      onClick={handleSubmitRevision}
                      className={cn(
                        PRIMARY_PILL,
                        "disabled:pointer-events-none disabled:opacity-50"
                      )}
                    >
                      {submittingRevision
                        ? "Submitting…"
                        : "Submit revision request"}
                    </button>
                  </div>

                  {revisionError && (
                    <p className="text-sm text-destructive">{revisionError}</p>
                  )}

                  {revisions.length > 0 && (
                    <ul className="divide-y divide-border/60 border-t border-border/60">
                      {revisions.map((rev) => (
                        <li key={rev.id} className="py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 flex-1 text-sm text-foreground">
                              {rev.description}
                            </p>
                            <span
                              className={cn(
                                STATUS_PILL,
                                "shrink-0",
                                rev.status === "rejected" &&
                                  "border-destructive/40 text-destructive"
                              )}
                            >
                              {revisionStatusLabels[rev.status]}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {rev.adminNotes && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Response from the team: {rev.adminNotes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* Files */}
                <section className={SECTION_RHYTHM}>
                  <p className={SECTION_LABEL}>Files</p>
                  <UploadDropzone
                    endpoint="projectFile"
                    input={{ projectId: project.id }}
                    onBeforeUploadBegin={(uploadFiles) => {
                      setUploadError(null);
                      return uploadFiles;
                    }}
                    onClientUploadComplete={async (res) => {
                      // Record each uploaded file in our DB via /api/files,
                      // then reflect it in the list. Recording is the source of
                      // truth; optimistic UI append keeps the view in sync.
                      const recorded: FileItem[] = [];
                      for (const upload of res) {
                        try {
                          const apiRes = await fetch("/api/files", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              projectId: project.id,
                              name: upload.name,
                              url: upload.ufsUrl,
                              size: upload.size,
                              type: upload.type || undefined,
                            }),
                          });
                          if (apiRes.ok) {
                            recorded.push({
                              name: upload.name,
                              url: upload.ufsUrl,
                              size: formatBytes(upload.size),
                              type: upload.type || "application/octet-stream",
                            });
                          }
                        } catch {
                          // Ignore a single failed record; others still apply.
                        }
                      }
                      if (recorded.length > 0) {
                        setFileList((prev) => [...prev, ...recorded]);
                      }
                    }}
                    onUploadError={(error) => {
                      setUploadError(error.message);
                    }}
                    className="ut-button:bg-foreground ut-button:text-background ut-label:text-foreground ut-upload-icon:text-muted-foreground rounded-lg border border-dashed border-border p-6"
                  />

                  {uploadError && (
                    <p className="text-sm text-destructive">{uploadError}</p>
                  )}

                  {fileList.length > 0 ? (
                    <div className="divide-y divide-border/60 border-t border-border/60">
                      {fileList.map((file) => (
                        <FilePreviewCard
                          key={file.url}
                          name={file.name}
                          url={file.url}
                          type={file.type}
                          size={file.size}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No files uploaded yet.
                    </p>
                  )}
                </section>

                {/* Invoice */}
                {invoice && <InvoiceCard invoice={invoice} />}

                {/* Project details */}
                <section className={SECTION_RHYTHM}>
                  <p className={SECTION_LABEL}>Project details</p>
                  <dl className="divide-y divide-border/60 border-t border-border/60">
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-sm text-muted-foreground">Service</dt>
                      <dd className="truncate text-sm text-foreground">
                        {project.serviceType}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-sm text-muted-foreground">Status</dt>
                      <dd>
                        <span className={STATUS_PILL}>{project.status}</span>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-3">
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd className="text-sm tabular-nums text-foreground">
                        {project.createdAt}
                      </dd>
                    </div>
                    {invoice && (
                      <div className="flex items-center justify-between gap-3 py-3">
                        <dt className="text-sm text-muted-foreground">
                          Payment
                        </dt>
                        <dd>
                          <span
                            className={cn(
                              STATUS_PILL,
                              invoice.status === "overdue" &&
                                "border-destructive/40 text-destructive"
                            )}
                          >
                            {invoice.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              </div>
            </div>
          </Tabs.Content>

          {/* Comments tab */}
          <Tabs.Content value="comments">
            <section className={SECTION_RHYTHM}>
              <p className={SECTION_LABEL}>Comments</p>
              <ProjectComments projectId={project.id} />
            </section>
          </Tabs.Content>

          {/* Analytics tab */}
          <Tabs.Content value="analytics">
            <AnalyticsOverview projectId={project.id} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
