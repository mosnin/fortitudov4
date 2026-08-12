"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CrmPageHeader,
  FilterSelect,
  RecordList,
  RecordRow,
  RowPill,
  Stat,
  StatCell,
  StatEmpty,
  StatStrip,
  TabStrip,
  Toolbar,
  ToolbarActions,
  ToolbarSearch,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { NewPartnerModal } from "@/components/admin/partner-new-modal";
import {
  PARTNER_KIND_LABELS,
  PARTNER_STATUSES,
  PARTNER_STATUS_LABELS,
  type PartnerKind,
  type PartnerStatus,
} from "@/lib/partners";
import { cn } from "@/lib/utils";
import { PAGE_RHYTHM, PRIMARY_PILL, READING_COL } from "@/lib/typography";

export interface PartnerRow {
  id: string;
  companyName: string;
  contactName: string;
  email: string | null;
  kind: PartnerKind;
  status: PartnerStatus;
  /** Whether a portal login is attached yet — a partner exists before one is. */
  hasLogin: boolean;
  openRequests: number;
  totalRequests: number;
  awaitingQuote: number;
}

/**
 * The agency's list of partners. Reads come from the Server Component above;
 * this half owns the filtering, and hands creation to the API.
 */
export function PartnerRoster({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | PartnerStatus>("all");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | PartnerKind>("all");
  const [newOpen, setNewOpen] = useState(false);

  const active = partners.filter((p) => p.status === "active").length;
  const openRequests = partners.reduce((n, p) => n + p.openRequests, 0);
  const awaiting = partners.reduce((n, p) => n + p.awaitingQuote, 0);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return partners.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (kind !== "all" && p.kind !== kind) return false;
      if (!needle) return true;
      return [p.companyName, p.contactName, p.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [partners, tab, kind, query]);

  const subtitle =
    partners.length === 0
      ? "No partners yet."
      : `${active} active, ${openRequests} open ${
          openRequests === 1 ? "request" : "requests"
        }.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Operations."
          title="Partners"
          subtitle={subtitle}
          action={
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className={PRIMARY_PILL}
            >
              New Partner
            </button>
          }
        />

        <StatStrip columns={3} ariaLabel="Partner summary">
          <StatCell label="Active partners">
            {active === 0 ? (
              <StatEmpty>No active partners.</StatEmpty>
            ) : (
              <Stat>{active}</Stat>
            )}
          </StatCell>
          <StatCell label="Open requests">
            {openRequests === 0 ? (
              <StatEmpty>Nothing open.</StatEmpty>
            ) : (
              <Stat>{openRequests}</Stat>
            )}
          </StatCell>
          <StatCell label="Waiting on our quote">
            {awaiting === 0 ? (
              <StatEmpty>Nothing waiting on us.</StatEmpty>
            ) : (
              <Stat>{awaiting}</Stat>
            )}
          </StatCell>
        </StatStrip>

        <TabStrip
          ariaLabel="Partner status"
          active={tab}
          onChange={(key) => setTab(key as "all" | PartnerStatus)}
          tabs={[
            { key: "all", label: "All", count: partners.length },
            ...PARTNER_STATUSES.map((status) => ({
              key: status,
              label: PARTNER_STATUS_LABELS[status],
              count: partners.filter((p) => p.status === status).length,
            })),
          ]}
        />

        <Toolbar>
          <ToolbarSearch
            value={query}
            onChange={setQuery}
            placeholder="Search partners…"
          />
          <ToolbarActions>
            <FilterSelect
              label="Kind"
              value={kind}
              onChange={(value) => setKind(value as "all" | PartnerKind)}
              options={[
                { value: "all", label: "All" },
                { value: "agency", label: PARTNER_KIND_LABELS.agency },
                { value: "affiliate", label: PARTNER_KIND_LABELS.affiliate },
              ]}
            />
          </ToolbarActions>
        </Toolbar>

        {partners.length === 0 ? (
          <EmptyState
            title="No partners yet"
            description="Add the agency or affiliate who brings you work. The record comes first — their login can follow later."
            action={
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className={PRIMARY_PILL}
              >
                New Partner
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No partners match"
            description="Clear the search or change the filters to see the rest of the roster."
          />
        ) : (
          <RecordList>
            {visible.map((partner, i) => (
              <RecordRow
                key={partner.id}
                index={i}
                href={`/admin/partners/${partner.id}`}
                primary={partner.companyName}
                status={
                  <>
                    <RowPill>{PARTNER_KIND_LABELS[partner.kind]}</RowPill>
                    {partner.status !== "active" && (
                      <RowPill>{PARTNER_STATUS_LABELS[partner.status]}</RowPill>
                    )}
                  </>
                }
                secondary={[
                  partner.contactName,
                  partner.email,
                  partner.hasLogin ? "Portal login" : "No login yet",
                ]
                  .filter(Boolean)
                  .join(" · ")}
                meta={
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {partner.totalRequests === 0
                      ? "No requests"
                      : `${partner.openRequests} open of ${partner.totalRequests}`}
                  </span>
                }
              />
            ))}
          </RecordList>
        )}
      </div>

      <NewPartnerModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => router.push(`/admin/partners/${id}`)}
      />
    </div>
  );
}
