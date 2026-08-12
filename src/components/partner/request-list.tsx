"use client";

/**
 * The list IS the page (plans/partners.md): a partner sees a queue of jobs at
 * different stages, most of them for their own clients. Tabs across the top,
 * one filter row, `RecordRow` beneath — the same vocabulary as every other
 * record list in the product.
 *
 * Every row here came from a query already scoped to this partner. Nothing in
 * this component re-derives ownership, and nothing about it should ever be
 * asked to: scope is settled on the server, before the props exist.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FilterSelect,
  RecordList,
  RecordRow,
  RowPill,
  TabStrip,
  Toolbar,
  ToolbarActions,
  ToolbarSearch,
  type TabItem,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import type { PartnerRequestStatus } from "@/lib/partners";
import { SERVICE_LABELS, type ServiceType } from "@/lib/services";
import { META, PRIMARY_PILL, SECTION_RHYTHM } from "@/lib/typography";
import { cn } from "@/lib/utils";
import {
  formatDay,
  formatMoney,
  hasQuote,
  statusLabel,
  type PartnerRequestView,
} from "./request-view";

/**
 * The coarse split a partner actually thinks in: mine, yours, priced, done.
 * Every status appears in exactly one group, so "All" and the four tabs
 * together are the whole list.
 */
const GROUPS: { key: string; label: string; statuses: PartnerRequestStatus[] }[] =
  [
    { key: "drafts", label: "Drafts", statuses: ["draft"] },
    { key: "with_us", label: "With us", statuses: ["submitted", "reviewing"] },
    { key: "quoted", label: "Quoted", statuses: ["quoted"] },
    {
      key: "decided",
      label: "Decided",
      statuses: ["accepted", "declined", "delivered"],
    },
  ];

const SERVICE_OPTIONS = [
  { value: "all", label: "All" },
  ...(Object.keys(SERVICE_LABELS) as ServiceType[]).map((key) => ({
    value: key,
    label: SERVICE_LABELS[key],
  })),
];

export function RequestList({ requests }: { requests: PartnerRequestView[] }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [service, setService] = useState("all");

  const tabs: TabItem[] = useMemo(
    () => [
      { key: "all", label: "All", count: requests.length },
      ...GROUPS.map((group) => ({
        key: group.key,
        label: group.label,
        count: requests.filter((r) => group.statuses.includes(r.status)).length,
      })),
    ],
    [requests]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const group = GROUPS.find((g) => g.key === tab);
    return requests.filter((request) => {
      if (group && !group.statuses.includes(request.status)) return false;
      if (service !== "all" && request.serviceType !== service) return false;
      if (!needle) return true;
      return (
        request.title.toLowerCase().includes(needle) ||
        (request.scope ?? "").toLowerCase().includes(needle)
      );
    });
  }, [requests, tab, query, service]);

  if (requests.length === 0) {
    return (
      <EmptyState
        className="border-t border-border/60"
        title="No requests yet"
        description="Tell us what you want built and we'll come back with a price."
        action={
          <Link href="/partner/requests/new" className={PRIMARY_PILL}>
            New request
          </Link>
        }
      />
    );
  }

  return (
    <div className={SECTION_RHYTHM}>
      <TabStrip
        tabs={tabs}
        active={tab}
        onChange={setTab}
        ariaLabel="Filter requests"
      />

      <Toolbar>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search requests…"
        />
        <ToolbarActions>
          <FilterSelect
            label="Service"
            value={service}
            onChange={setService}
            options={SERVICE_OPTIONS}
          />
        </ToolbarActions>
      </Toolbar>

      {visible.length === 0 ? (
        <EmptyState
          className="border-t border-border/60"
          title="Nothing in this view"
          description="Try another tab, or clear the search and the service filter."
        />
      ) : (
        <RecordList>
          {visible.map((request, index) => (
            <RecordRow
              key={request.id}
              index={index}
              href={`/partner/requests/${request.id}`}
              primary={request.title}
              status={
                <RowPill emphasis={request.status === "quoted"}>
                  {statusLabel(request.status)}
                </RowPill>
              }
              secondary={secondaryLine(request)}
              meta={
                hasQuote(request) ? (
                  <span className="text-xs tabular-nums text-foreground">
                    Quoted {formatMoney(request.quotedCents)}
                  </span>
                ) : (
                  <span className={cn(META, "hidden sm:inline")}>
                    {formatDay(request.updatedAt)}
                  </span>
                )
              }
            />
          ))}
        </RecordList>
      )}
    </div>
  );
}

/** One truncating line of context, facts separated by ` · `. */
function secondaryLine(request: PartnerRequestView): string {
  const parts = [SERVICE_LABELS[request.serviceType]];
  const budget = formatMoney(request.budgetCents);
  parts.push(budget ? `Your budget ${budget}` : "No budget set");
  const due = formatDay(request.targetDate);
  if (due) parts.push(`Needed by ${due}`);
  return parts.join(" · ");
}
