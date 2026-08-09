"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AsciiField } from "@/components/ui/ascii-field";
import { NewClientModal } from "@/components/admin/crm-new-client-modal";
import { ClientDetailModal } from "@/components/admin/crm-client-detail-modal";
import { CRM_STAGES, STAGE_LABELS, type CrmStage } from "@/lib/crm";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  Settings2,
  Trash2,
  Users,
} from "lucide-react";

interface Client {
  id: string;
  contactName: string;
  companyName: string;
  businessType: string | null;
  industry: string | null;
  package: string;
  packageLabel: string | null;
  status: string;
  stage: CrmStage;
  startDate: string;
  portalEmail: string | null;
  projectId: string | null;
  tasksTotal: number;
  tasksDone: number;
}

const PACKAGE_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
  rev_split: "Rev Split",
  mentorship: "Mentorship",
  custom: "Custom",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  churned: "Canceled",
};

const packageLabel = (c: Client) =>
  c.package === "custom" && c.packageLabel
    ? c.packageLabel
    : PACKAGE_LABELS[c.package] ?? c.package;

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

  function ViewPortalButton({ c }: { c: Client }) {
    // Always available — the portal preview mirrors their pipeline and
    // reports whether or not a portal login has been accepted yet.
    return (
      <Link
        href={`/admin/clients/${c.id}/portal`}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.04]"
        title={
          c.portalEmail
            ? `View the portal as ${c.portalEmail}`
            : "View the portal this client will see"
        }
      >
        <ExternalLink className="h-4 w-4" />
        View Portal
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header — serif title over the studio ASCII band */}
      <header className="relative border-b border-border pb-8">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 sm:block"
          style={{
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        >
          <AsciiField />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-mono">Operations · CRM</p>
            <h1 className="font-title mt-1 text-3xl tracking-tight sm:text-4xl">
              Client CRM
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage clients, track onboarding, and access portals.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={() => setNewOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              New Client
            </Button>
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="inline-flex rounded-xl border border-border bg-surface p-1">
        {(
          [
            { key: "board", label: "Board View", icon: LayoutGrid },
            { key: "list", label: "List View", icon: ListIcon },
          ] as const
        ).map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                view === v.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Create your first client to seed their onboarding pipeline and send a portal invite."
        />
      ) : view === "board" ? (
        /* ---- Board view ---- */
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
                className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <h3 className="micro-label">{STAGE_LABELS[stage]}</h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-background px-1.5 font-mono text-[11px] font-semibold text-muted-foreground">
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
                      <p className="font-bold">{c.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.contactName}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tasks</span>
                        <span className="font-mono">
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
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="font-mono text-[11px] uppercase text-muted-foreground">
                          {packageLabel(c) === c.package ? "—" : packageLabel(c)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditId(c.id)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            aria-label="Edit"
                            title="Edit details"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/admin/clients/${c.id}/portal`}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`View ${c.companyName}'s portal`}
                            title="View portal"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
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
        /* ---- List view ---- */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left align-top">
                <th className="micro-label py-3 pr-4">Business / Client</th>
                <th className="micro-label py-3 pr-3">Stage</th>
                <th className="micro-label py-3 pr-3">Status</th>
                <th className="micro-label py-3 pr-3">Industry</th>
                <th className="micro-label py-3 pr-3">Package</th>
                <th className="micro-label py-3 pr-3">Date Started</th>
                <th className="micro-label py-3 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-muted/40">
                  <td className="py-4 pr-4">
                    <p className="font-bold">{c.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.contactName}
                      {c.portalEmail ? ` - ${c.portalEmail}` : ""}
                    </p>
                  </td>
                  <td className="py-4 pr-3">
                    <select
                      className={selectClass}
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
                  <td className="py-4 pr-3">
                    <select
                      className={selectClass}
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
                  <td className="py-4 pr-3 text-muted-foreground">
                    {c.industry || "—"}
                  </td>
                  <td className="py-4 pr-3 text-muted-foreground">
                    {packageLabel(c) === c.package ? "—" : packageLabel(c)}
                  </td>
                  <td className="py-4 pr-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {dateStarted(c.startDate)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditId(c.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-foreground/[0.04]"
                      >
                        <Settings2 className="h-4 w-4" />
                        Edit Details
                      </button>
                      <ViewPortalButton c={c} />
                      <button
                        onClick={() => remove(c)}
                        className="rounded-lg bg-destructive/90 p-2 text-white transition-colors hover:bg-destructive cursor-pointer"
                        aria-label={`Delete ${c.companyName}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
