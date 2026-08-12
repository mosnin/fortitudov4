"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CrmPageHeader,
  RecordList,
  RecordRow,
  RowPill,
  SectionHead,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
  TabStrip,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { EditPartnerModal } from "@/components/admin/partner-edit-modal";
import { NewPartnerRequestModal } from "@/components/admin/partner-request-new-modal";
import {
  formatDay,
  isOpenRequestStatus,
} from "@/components/admin/partner-status";
import {
  PARTNER_KIND_LABELS,
  PARTNER_REQUEST_STATUS_LABELS,
  PARTNER_STATUS_LABELS,
  type PartnerKind,
  type PartnerRequestStatus,
  type PartnerStatus,
} from "@/lib/partners";
import { formatUsd } from "@/lib/pricing";
import { SERVICE_LABELS, type ServiceType } from "@/lib/services";
import { cn } from "@/lib/utils";
import {
  BODY,
  GHOST_PILL,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_RHYTHM,
} from "@/lib/typography";

export interface PartnerSummary {
  id: string;
  companyName: string;
  contactName: string;
  email: string | null;
  kind: PartnerKind;
  status: PartnerStatus;
  notes: string | null;
  /** The address on their portal login, when one exists. */
  loginEmail: string | null;
}

export interface PartnerRequestRow {
  id: string;
  title: string;
  serviceType: ServiceType;
  status: PartnerRequestStatus;
  /** What they say they have. */
  budgetCents: number | null;
  /** What we say it costs. */
  quotedCents: number | null;
  targetDate: string | null;
  createdAt: string;
  openedBy: "partner" | "agency" | null;
  openedByName: string | null;
}

const sumCents = (rows: PartnerRequestRow[], key: "budgetCents" | "quotedCents") =>
  rows.reduce((total, row) => total + (row[key] ?? 0), 0);

export function PartnerDetail({
  partner,
  requests,
}: {
  partner: PartnerSummary;
  requests: PartnerRequestRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"open" | "settled" | "all">("open");
  const [editOpen, setEditOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const open = useMemo(
    () => requests.filter((r) => isOpenRequestStatus(r.status)),
    [requests]
  );
  const settled = useMemo(
    () => requests.filter((r) => !isOpenRequestStatus(r.status)),
    [requests]
  );
  const visible = tab === "open" ? open : tab === "settled" ? settled : requests;

  const budgetTotal = sumCents(open, "budgetCents");
  const quotedTotal = sumCents(open, "quotedCents");
  const quotedCount = open.filter((r) => r.quotedCents !== null).length;

  const subtitle = [
    PARTNER_KIND_LABELS[partner.kind],
    PARTNER_STATUS_LABELS[partner.status],
    requests.length === 0
      ? "no requests yet"
      : `${open.length} open of ${requests.length}`,
  ].join(" · ");

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className={SECTION_RHYTHM}>
          <Link href="/admin/partners" className={QUIET_LINK}>
            Partners
          </Link>
          <CrmPageHeader
            section="Partner."
            title={partner.companyName}
            subtitle={subtitle}
            action={
              <>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className={GHOST_PILL}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className={PRIMARY_PILL}
                >
                  Open a Request
                </button>
              </>
            }
          />
        </div>

        <p className={cn(BODY, "text-muted-foreground")}>
          {[
            partner.contactName,
            partner.email,
            partner.loginEmail
              ? `Signs in as ${partner.loginEmail}`
              : "No portal login yet",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {/* The two money columns at partner level: what they have asked for
            across their open work, and what we have answered. */}
        <StatStrip columns={3} ariaLabel="Open request totals">
          <StatCell label="Open requests">
            {open.length === 0 ? (
              <StatEmpty>Nothing open.</StatEmpty>
            ) : (
              <Stat>{open.length}</Stat>
            )}
          </StatCell>
          <StatCell label="Their budget">
            {budgetTotal === 0 ? (
              <StatEmpty>No budget stated.</StatEmpty>
            ) : (
              <>
                <Stat>{formatUsd(budgetTotal)}</Stat>
                <StatMeta>across open requests</StatMeta>
              </>
            )}
          </StatCell>
          <StatCell label="Our quote">
            {quotedCount === 0 ? (
              <StatEmpty>Nothing quoted yet.</StatEmpty>
            ) : (
              <>
                <Stat>{formatUsd(quotedTotal)}</Stat>
                <StatMeta>
                  {quotedCount} of {open.length} quoted
                </StatMeta>
              </>
            )}
          </StatCell>
        </StatStrip>

        {partner.notes && (
          <section className={SECTION_RHYTHM}>
            <SectionHead title="Notes" />
            <p className={cn(BODY, "whitespace-pre-wrap text-muted-foreground")}>
              {partner.notes}
            </p>
          </section>
        )}

        <section className={SECTION_RHYTHM}>
          <SectionHead title="Requests" />
          <TabStrip
            ariaLabel="Request state"
            active={tab}
            onChange={(key) => setTab(key as "open" | "settled" | "all")}
            tabs={[
              { key: "open", label: "Open", count: open.length },
              { key: "settled", label: "Settled", count: settled.length },
              { key: "all", label: "All", count: requests.length },
            ]}
          />

          {visible.length === 0 ? (
            <EmptyState
              title={
                requests.length === 0 ? "No requests yet" : "Nothing here"
              }
              description={
                requests.length === 0
                  ? "Open one on their behalf. It starts as a draft with the scope and budget blank, for them to fill in."
                  : "Switch tabs to see the rest of their requests."
              }
              action={
                requests.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setRequestOpen(true)}
                    className={PRIMARY_PILL}
                  >
                    Open a Request
                  </button>
                ) : undefined
              }
            />
          ) : (
            <RecordList>
              {visible.map((request, i) => (
                <RecordRow
                  key={request.id}
                  index={i}
                  href={`/admin/partners/${partner.id}/requests/${request.id}`}
                  primary={request.title}
                  status={
                    <>
                      <RowPill emphasis>
                        {PARTNER_REQUEST_STATUS_LABELS[request.status]}
                      </RowPill>
                      <RowPill>{SERVICE_LABELS[request.serviceType]}</RowPill>
                    </>
                  }
                  secondary={[
                    request.openedBy === "agency"
                      ? `Opened by ${request.openedByName ?? "us"}`
                      : request.openedBy === "partner"
                        ? "From the partner"
                        : null,
                    request.targetDate
                      ? `Needed ${formatDay(request.targetDate)}`
                      : null,
                    `Opened ${formatDay(request.createdAt)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  meta={
                    <span className="flex items-baseline gap-3 text-xs tabular-nums text-muted-foreground">
                      <span>
                        Budget{" "}
                        {request.budgetCents === null
                          ? "—"
                          : formatUsd(request.budgetCents)}
                      </span>
                      <span className="text-foreground">
                        Quote{" "}
                        {request.quotedCents === null
                          ? "—"
                          : formatUsd(request.quotedCents)}
                      </span>
                    </span>
                  }
                />
              ))}
            </RecordList>
          )}
        </section>
      </div>

      <EditPartnerModal
        open={editOpen}
        partner={partner}
        onClose={() => setEditOpen(false)}
        onSaved={() => router.refresh()}
      />
      <NewPartnerRequestModal
        open={requestOpen}
        partnerId={partner.id}
        partnerName={partner.companyName}
        onClose={() => setRequestOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
