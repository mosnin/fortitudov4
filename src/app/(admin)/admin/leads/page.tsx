"use client";

import { useEffect, useState } from "react";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatStrip,
  TabStrip,
  Toolbar,
  ToolbarSearch,
} from "@/components/crm";
import { AnimatedNumber } from "@/components/motion";
import { cn } from "@/lib/utils";
import { BODY_MUTED, H3, PAGE_RHYTHM, READING_COL } from "@/lib/typography";
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

/** Fortitudo's five services → display names for the row's interest line. */
const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

const rowSelectClass =
  "h-8 cursor-pointer rounded-md border border-border/70 bg-background px-2 text-xs " +
  "text-muted-foreground outline-none transition-colors hover:border-foreground/25 " +
  "focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
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

  const count = (status: LeadStatus) =>
    leads.filter((l) => l.status === status).length;

  const q = query.trim().toLowerCase();
  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (
      q &&
      !l.name.toLowerCase().includes(q) &&
      !l.email.toLowerCase().includes(q) &&
      !(l.company ?? "").toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const newCount = count("new");
  const subtitle = loading
    ? "Loading the capture log."
    : leads.length === 0
      ? "Nothing captured from the site yet."
      : `${leads.length} captured, ${newCount} awaiting first contact.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader section="Operations." title="Leads" subtitle={subtitle} />

        <StatStrip columns={4} ariaLabel="Lead pipeline">
          <StatCell label="Total Leads">
            {leads.length > 0 ? (
              <Stat>
                <AnimatedNumber value={leads.length} />
              </Stat>
            ) : (
              <StatEmpty>Nothing captured yet.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="New">
            {newCount > 0 ? (
              <Stat>
                <AnimatedNumber value={newCount} />
              </Stat>
            ) : (
              <StatEmpty>Everyone has been contacted.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="Qualified">
            {count("qualified") > 0 ? (
              <Stat>
                <AnimatedNumber value={count("qualified")} />
              </Stat>
            ) : (
              <StatEmpty>None qualified yet.</StatEmpty>
            )}
          </StatCell>
          <StatCell label="Converted">
            {count("converted") > 0 ? (
              <Stat>
                <AnimatedNumber value={count("converted")} />
              </Stat>
            ) : (
              <StatEmpty>No conversions on the books.</StatEmpty>
            )}
          </StatCell>
        </StatStrip>

        <TabStrip
          ariaLabel="Lead status"
          active={statusFilter}
          onChange={(key) => setStatusFilter(key as LeadStatus | "all")}
          tabs={[
            { key: "all", label: "All", count: leads.length },
            ...statusOptions.map((s) => ({
              key: s,
              label: statusLabels[s],
              count: count(s),
            })),
          ]}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="space-y-4">
          <Toolbar>
            <ToolbarSearch
              value={query}
              onChange={setQuery}
              placeholder="Search leads, emails or companies…"
            />
          </Toolbar>

          {loading ? (
            <RecordListSkeleton rows={6} />
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <h2 className={H3}>
                {leads.length === 0 ? "No leads yet" : "No matching leads"}
              </h2>
              <p className={cn(BODY_MUTED, "mx-auto mt-1 max-w-sm")}>
                {leads.length === 0
                  ? "Leads from the contact form and get-started funnel will land here."
                  : "Try a different status or search term."}
              </p>
            </div>
          ) : (
            <RecordList>
              {filtered.map((lead, i) => {
                const interest = lead.serviceInterest
                  ? serviceLabels[lead.serviceInterest] ?? lead.serviceInterest
                  : null;
                const secondary = [
                  lead.company,
                  lead.email,
                  lead.phone,
                  interest,
                  lead.monthlyBudget,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <RecordRow
                    key={lead.id}
                    index={i}
                    primary={lead.name}
                    status={
                      <RowPill>
                        {sourceLabels[lead.source] ??
                          lead.source.replace(/_/g, " ")}
                      </RowPill>
                    }
                    secondary={secondary}
                    meta={
                      <>
                        <span className="hidden text-[11px] tabular-nums whitespace-nowrap text-muted-foreground sm:inline">
                          {fmtDate(lead.createdAt)}
                        </span>
                        <select
                          aria-label={`Status for ${lead.name}`}
                          className={rowSelectClass}
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
                      </>
                    }
                  />
                );
              })}
            </RecordList>
          )}
        </section>
      </div>
    </div>
  );
}
