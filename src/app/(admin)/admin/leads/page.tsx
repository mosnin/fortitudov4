"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CountUp, PageHero } from "@/components/ui/firecrawl";
import { TableSkeleton } from "@/components/ui/skeleton";
import { cascade, cascadeItem, rowCascade, rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  BODY_MUTED,
  H3,
  PAGE_RHYTHM,
  SECTION_LABEL,
  STATUS_PILL,
} from "@/lib/typography";
import { services } from "@/lib/services";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceInterest: string | null;
  monthlyBudget: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

const statusOptions: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

const sourceLabels: Record<string, string> = {
  contact_form: "Contact Form",
  get_started_funnel: "Get Started Funnel",
};

/** Fortitudo's five services → display names for the "Interested In" column. */
const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

/** Hairline-divided 4-up grid cell borders (2-up on small screens). */
const statCell = (i: number) =>
  cn(
    "px-5 py-6",
    i % 2 === 1 && "border-l border-border",
    i >= 2 && "max-lg:border-t max-lg:border-border",
    i > 0 && "lg:border-l lg:border-border"
  );

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    setUpdating(leadId);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update lead");
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  const stats = [
    { label: "Total Leads", value: leads.length },
    { label: "New", value: leads.filter((l) => l.status === "new").length },
    {
      label: "Qualified",
      value: leads.filter((l) => l.status === "qualified").length,
    },
    {
      label: "Converted",
      value: leads.filter((l) => l.status === "converted").length,
    },
  ];

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <PageHero
        section="Operations"
        title="Leads"
        description="Leads captured from the website — contact form and get-started funnel — triaged through the pipeline."
      />

      {/* Stats — hairline-divided 4-up */}
      <motion.div
        variants={cascade}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 border-y border-border lg:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cascadeItem}
            className={statCell(i)}
          >
            <p className={SECTION_LABEL}>{stat.label}</p>
            <p className="mt-2 text-3xl tracking-tight tabular-nums text-foreground">
              <CountUp value={stat.value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="space-y-4">
        {/* Toolbar — status filters left, count right */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
          {(["all", ...statusOptions] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors active:scale-[0.98]",
                statusFilter === status
                  ? "border-foreground bg-foreground font-medium text-background"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {status === "all" ? "All" : statusLabels[status]}
            </button>
          ))}
          <p className={cn(SECTION_LABEL, "ml-auto")}>
            {filtered.length} of {leads.length} leads
          </p>
        </div>

        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <h2 className={H3}>
              {statusFilter === "all"
                ? "No leads yet"
                : "No leads with this status"}
            </h2>
            <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
              {statusFilter === "all"
                ? "Leads from the contact form and get-started funnel will land here."
                : "Try a different status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Name</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Contact</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>
                    Interested In
                  </th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Budget</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Source</th>
                  <th className={cn(SECTION_LABEL, "py-3 pr-4")}>Status</th>
                  <th className={cn(SECTION_LABEL, "py-3")}>Date</th>
                </tr>
              </thead>
              <motion.tbody
                variants={rowCascade}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border/60"
              >
                {filtered.map((lead) => (
                  <motion.tr
                    key={lead.id}
                    variants={rowItem}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.company && (
                        <p className="text-xs text-muted-foreground">
                          {lead.company}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-muted-foreground">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {lead.phone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {lead.serviceInterest
                        ? serviceLabels[lead.serviceInterest] ??
                          lead.serviceInterest
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 text-xs tabular-nums text-muted-foreground">
                      {lead.monthlyBudget || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn(STATUS_PILL, "whitespace-nowrap")}>
                        {sourceLabels[lead.source] ??
                          lead.source.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        aria-label={`Status for ${lead.name}`}
                        className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={lead.status}
                        disabled={updating === lead.id}
                        onChange={(e) =>
                          updateStatus(lead.id, e.target.value as LeadStatus)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
