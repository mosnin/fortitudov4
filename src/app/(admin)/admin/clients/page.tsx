"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Sparkles, Trash2 } from "lucide-react";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowAction,
  RowPill,
  RowSelect,
  TabStrip,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { NewClientModal } from "@/components/admin/crm-new-client-modal";
import { ClientDetailModal } from "@/components/admin/crm-client-detail-modal";
import { useAskHelix } from "@/components/admin/ask-helix";
import {
  CRM_STAGES,
  STAGE_LABELS,
  OFFERING_LABELS,
  type ClientOffering,
  type CrmStage,
} from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_LABEL,
} from "@/lib/typography";

interface Client {
  id: string;
  contactName: string;
  companyName: string;
  businessType: string | null;
  industry: string | null;
  package: ClientOffering;
  packageLabel: string | null;
  status: string;
  stage: CrmStage;
  startDate: string;
  portalEmail: string | null;
  projectId: string | null;
  tasksTotal: number;
  tasksDone: number;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  churned: "Churned",
};

/** The offering this client bought — a bespoke engagement shows its own name. */
const packageLabel = (c: Client) =>
  c.package === "custom" && c.packageLabel
    ? c.packageLabel
    : OFFERING_LABELS[c.package] ?? "—";

const dateStarted = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** No realtime channel here — a calm 10s poll keeps the board in sync when
 * teammates move cards. */
const POLL_MS = 10_000;

export default function ClientCrmPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const { open: askHelix, busy: askingHelix } = useAskHelix();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");
  const [newOpen, setNewOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/clients")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.clients)) setClients(data.clients);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);
  useEffect(() => {
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function patchClient(id: string, body: Record<string, unknown>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...body } : c)));
    await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function remove(c: Client) {
    if (
      !window.confirm(
        `Delete ${c.companyName}? Their tasks and payment history are removed too.`
      )
    )
      return;
    setClients((prev) => prev.filter((x) => x.id !== c.id));
    await fetch(`/api/admin/clients/${c.id}`, { method: "DELETE" });
    load();
  }

  /** The portal preview mirrors their pipeline and reports whether or not a
   * portal login has been accepted yet, so it is always available. */
  const portalTitle = (c: Client) =>
    c.portalEmail
      ? `View the portal as ${c.portalEmail}`
      : "View the portal this client will see";

  const onBoard = clients.filter((c) => c.status !== "churned");
  const inOnboarding = clients.filter((c) => c.stage === "onboarding").length;

  const subtitle = loading
    ? "Loading the roster."
    : clients.length === 0
      ? "No clients on the roster yet."
      : `${onBoard.length} on the board, ${inOnboarding} still in onboarding.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      {/* Header and tabs sit in the reading column like every other page —
          only the board below spans the full frame (design.md, Page frame). */}
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Operations."
          title="Clients"
          subtitle={subtitle}
          action={
            <button onClick={() => setNewOpen(true)} className={PRIMARY_PILL}>
              New Client
            </button>
          }
        />

        <TabStrip
          ariaLabel="Client view"
          active={view}
          onChange={(key) => setView(key as "board" | "list")}
          tabs={[
            { key: "board", label: "Board", count: onBoard.length },
            { key: "list", label: "List", count: clients.length },
          ]}
        />
      </div>

      {loading ? (
        <div className={READING_COL}>
          <RecordListSkeleton rows={5} />
        </div>
      ) : clients.length === 0 ? (
        <div className={READING_COL}>
          <EmptyState
            title="No clients yet"
            description="Create your first client to seed their onboarding pipeline and send a portal invite."
          />
        </div>
      ) : view === "board" ? (
        /* ---- Board view — a wide working surface, spans the full frame ---- */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {CRM_STAGES.map((stage) => {
            const inStage = onBoard.filter((c) => c.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) {
                    patchClient(dragId, { stage });
                    setDragId(null);
                  }
                }}
                className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <h3 className={SECTION_LABEL}>{STAGE_LABELS[stage]}</h3>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {inStage.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {inStage.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab rounded-lg border border-border bg-background p-3 transition-colors hover:border-foreground/25 active:cursor-grabbing"
                    >
                      <button
                        type="button"
                        onClick={() => setEditId(c.id)}
                        className="block w-full cursor-pointer text-left"
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {c.companyName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {c.contactName} ·{" "}
                          <span className="tabular-nums">
                            {c.tasksDone}/{c.tasksTotal}
                          </span>{" "}
                          tasks
                        </p>
                      </button>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <RowPill>{packageLabel(c)}</RowPill>
                        <Link
                          href={`/admin/clients/${c.id}/portal`}
                          className={cn(QUIET_LINK, "text-xs")}
                          title={portalTitle(c)}
                        >
                          Portal
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- List view ---- */
        <RecordList className={READING_COL}>
          {clients.map((c, i) => (
            <RecordRow
              key={c.id}
              index={i}
              primary={c.companyName}
              status={<RowPill>{packageLabel(c)}</RowPill>}
              secondary={[
                c.contactName,
                c.portalEmail,
                c.industry,
                `Started ${dateStarted(c.startDate)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
              meta={
                <>
                  <RowSelect
                    aria-label={`Stage for ${c.companyName}`}
                    value={c.stage}
                    onChange={(e) => patchClient(c.id, { stage: e.target.value })}
                  >
                    {CRM_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </RowSelect>
                  <RowSelect
                    aria-label={`Status for ${c.companyName}`}
                    value={c.status}
                    onChange={(e) =>
                      patchClient(c.id, { status: e.target.value })
                    }
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </RowSelect>
                </>
              }
              actions={
                <>
                  <RowAction
                    label={`Ask Helix about ${c.companyName}`}
                    disabled={askingHelix}
                    onClick={() =>
                      void askHelix("client", c.id, c.companyName)
                    }
                  >
                    <Sparkles size={13} />
                  </RowAction>
                  <RowAction
                    label={`Edit ${c.companyName}`}
                    onClick={() => setEditId(c.id)}
                  >
                    <Pencil size={13} />
                  </RowAction>
                  <RowAction
                    label={portalTitle(c)}
                    href={`/admin/clients/${c.id}/portal`}
                  >
                    <ExternalLink size={13} />
                  </RowAction>
                  <RowAction
                    label={`Delete ${c.companyName}`}
                    destructive
                    onClick={() => remove(c)}
                  >
                    <Trash2 size={13} />
                  </RowAction>
                </>
              }
            />
          ))}
        </RecordList>
      )}

      <NewClientModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={load}
      />
      <ClientDetailModal
        clientId={editId}
        onClose={() => setEditId(null)}
        onSaved={load}
      />
    </div>
  );
}
