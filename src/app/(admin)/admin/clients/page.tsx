"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/firecrawl";
import { TableSkeleton } from "@/components/ui/skeleton";
import { NewClientModal } from "@/components/admin/crm-new-client-modal";
import { ClientDetailModal } from "@/components/admin/crm-client-detail-modal";
import {
  CRM_STAGES,
  STAGE_LABELS,
  PACKAGE_LABELS,
  type ClientPackage,
  type CrmStage,
} from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  H3,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  SECTION_LABEL,
  STATUS_PILL,
} from "@/lib/typography";
import { LayoutGrid, List as ListIcon } from "lucide-react";

interface Client {
  id: string;
  contactName: string;
  companyName: string;
  businessType: string | null;
  industry: string | null;
  package: ClientPackage;
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
  churned: "Canceled",
};

/** The offering this client bought — a bespoke engagement shows its own name. */
const packageLabel = (c: Client) =>
  c.package === "custom" && c.packageLabel
    ? c.packageLabel
    : PACKAGE_LABELS[c.package] ?? "—";

const dateStarted = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none transition-colors focus:border-foreground/40";

/** No realtime channel here — a calm 10s poll keeps the board in sync when
 * teammates move cards. */
const POLL_MS = 10_000;

export default function ClientCrmPage() {
  const [clients, setClients] = useState<Client[]>([]);
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

  function ViewPortalLink({ c }: { c: Client }) {
    // Always available — the portal preview mirrors their pipeline and
    // reports whether or not a portal login has been accepted yet.
    return (
      <Link
        href={`/admin/clients/${c.id}/portal`}
        className={QUIET_LINK}
        title={
          c.portalEmail
            ? `View the portal as ${c.portalEmail}`
            : "View the portal this client will see"
        }
      >
        Portal
      </Link>
    );
  }

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <PageHero
        section="Operations"
        title="Clients"
        description="Manage clients, track onboarding, and access portals."
        action={
          <button onClick={() => setNewOpen(true)} className={PRIMARY_PILL}>
            New Client
          </button>
        }
      />

      {/* View toggle — a functional segmented control */}
      <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
        {(
          [
            { key: "board", label: "Board", icon: LayoutGrid },
            { key: "list", label: "List", icon: ListIcon },
          ] as const
        ).map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
                view === v.key
                  ? "border border-border bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {v.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : clients.length === 0 ? (
        <div className="py-14 text-center">
          <h2 className={H3}>No clients yet</h2>
          <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
            Create your first client to seed their onboarding pipeline and send
            a portal invite.
          </p>
        </div>
      ) : view === "board" ? (
        /* ---- Board view — a wide working surface, spans the full frame ---- */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {CRM_STAGES.map((stage) => {
            const inStage = clients.filter(
              (c) => c.stage === stage && c.status !== "churned"
            );
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
                <div className="flex flex-col gap-3">
                  {inStage.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab rounded-lg border border-border bg-background p-4 transition-colors hover:border-foreground/25 active:cursor-grabbing"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {c.companyName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.contactName}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tasks</span>
                        <span className="tabular-nums">
                          {c.tasksDone}/{c.tasksTotal}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground transition-all"
                          style={{
                            width: `${
                              c.tasksTotal
                                ? (c.tasksDone / c.tasksTotal) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <span className={STATUS_PILL}>{packageLabel(c)}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditId(c.id)}
                            className={cn(QUIET_LINK, "cursor-pointer")}
                          >
                            Edit
                          </button>
                          <ViewPortalLink c={c} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- List view — a wide table, spans the full frame ---- */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left align-top">
                <th className={cn(SECTION_LABEL, "py-3 pr-4")}>
                  Business / Client
                </th>
                <th className={cn(SECTION_LABEL, "py-3 pr-3")}>Stage</th>
                <th className={cn(SECTION_LABEL, "py-3 pr-3")}>Status</th>
                <th className={cn(SECTION_LABEL, "py-3 pr-3")}>Industry</th>
                <th className={cn(SECTION_LABEL, "py-3 pr-3")}>Package</th>
                <th className={cn(SECTION_LABEL, "py-3 pr-3")}>Date Started</th>
                <th className={cn(SECTION_LABEL, "py-3 text-right")}>Actions</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-border/60">
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-muted/30">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-foreground">
                      {c.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.contactName}
                      {c.portalEmail ? ` · ${c.portalEmail}` : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className={selectClass}
                      aria-label={`Stage for ${c.companyName}`}
                      value={c.stage}
                      onChange={(e) =>
                        patchClient(c.id, { stage: e.target.value })
                      }
                    >
                      {CRM_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {STAGE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className={selectClass}
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
                    </select>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {c.industry || "—"}
                  </td>
                  <td className="py-3 pr-3">
                    <span className={STATUS_PILL}>{packageLabel(c)}</span>
                  </td>
                  <td className="py-3 pr-3 text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                    {dateStarted(c.startDate)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditId(c.id)}
                        className={cn(QUIET_LINK, "cursor-pointer")}
                      >
                        Edit
                      </button>
                      <ViewPortalLink c={c} />
                      <button
                        onClick={() => remove(c)}
                        className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Delete ${c.companyName}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </motion.tbody>
          </table>
        </div>
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
