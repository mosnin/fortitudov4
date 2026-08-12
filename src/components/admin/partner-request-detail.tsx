"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CrmPageHeader,
  RowPill,
  SectionHead,
  Stat,
  StatCell,
  StatEmpty,
  StatMeta,
  StatStrip,
} from "@/components/crm";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  centsToDollars,
  dollarsToCents,
  formatDay,
  quoteGap,
} from "@/components/admin/partner-status";
import {
  PARTNER_REQUEST_STATUSES,
  PARTNER_REQUEST_STATUS_LABELS,
  type PartnerRequestStatus,
} from "@/lib/partners";
import { formatUsd } from "@/lib/pricing";
import { SERVICE_LABELS, type ServiceType } from "@/lib/services";
import { cn } from "@/lib/utils";
import {
  BODY,
  BODY_MUTED,
  CAPTION,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  QUIET_LINK,
  READING_COL,
  SECTION_RHYTHM,
} from "@/lib/typography";

export interface PartnerRequestDetailData {
  id: string;
  title: string;
  scope: string | null;
  serviceType: ServiceType;
  status: PartnerRequestStatus;
  budgetCents: number | null;
  quotedCents: number | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectName: string | null;
  openedBy: "partner" | "agency" | null;
  openedByName: string | null;
}

/** Statuses that still read as "we have not answered yet". */
const BEFORE_QUOTING: readonly PartnerRequestStatus[] = [
  "draft",
  "submitted",
  "reviewing",
];

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <span className={CAPTION}>{label}</span>
      <span className={cn(BODY, "text-right")}>{value}</span>
    </div>
  );
}

export function PartnerRequestDetail({
  partnerId,
  partnerName,
  request,
}: {
  partnerId: string;
  partnerName: string;
  request: PartnerRequestDetailData;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState(centsToDollars(request.quotedCents));
  const [status, setStatus] = useState<PartnerRequestStatus>(request.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Re-seed from the server row after a save + refresh.
  useEffect(() => {
    setQuote(centsToDollars(request.quotedCents));
    setStatus(request.status);
  }, [request.quotedCents, request.status]);

  const gap = quoteGap(request.budgetCents, request.quotedCents);
  const dirty =
    quote !== centsToDollars(request.quotedCents) || status !== request.status;

  /**
   * Typing a price is the moment a request becomes quoted, so the status moves
   * with it — still visible in the select, and still yours to override.
   */
  function onQuoteChange(value: string) {
    setQuote(value);
    setSaved(false);
    if (value.trim() && BEFORE_QUOTING.includes(status)) setStatus("quoted");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const cents = dollarsToCents(quote);
    if (quote.trim() && cents === null) {
      setError("That quote is not a number.");
      return;
    }
    if (cents !== null && cents < 0) {
      setError("A quote cannot be negative.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/partner-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Money is integer cents on the wire, as it is in the column.
        body: JSON.stringify({ quotedCents: cents, status }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        // Surface what the server said — it knows why it refused.
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "We could not save that quote."
        );
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <div className={SECTION_RHYTHM}>
          <Link href={`/admin/partners/${partnerId}`} className={QUIET_LINK}>
            {partnerName}
          </Link>
          <CrmPageHeader
            section="Request."
            title={request.title}
            subtitle={
              <span className="inline-flex items-center gap-2">
                <RowPill emphasis>
                  {PARTNER_REQUEST_STATUS_LABELS[request.status]}
                </RowPill>
                <span>
                  {SERVICE_LABELS[request.serviceType]} · opened{" "}
                  {formatDay(request.createdAt)}
                </span>
              </span>
            }
          />
        </div>

        {/* Their number and ours, side by side. The gap between them is the
            negotiation — two columns on purpose (plans/partners.md). */}
        <StatStrip columns={3} ariaLabel="Budget and quote">
          <StatCell label="Their budget">
            {request.budgetCents === null ? (
              <StatEmpty>Not stated yet.</StatEmpty>
            ) : (
              <>
                <Stat>{formatUsd(request.budgetCents)}</Stat>
                <StatMeta>what {partnerName} says they have</StatMeta>
              </>
            )}
          </StatCell>
          <StatCell label="Our quote">
            {request.quotedCents === null ? (
              <StatEmpty>Not quoted yet.</StatEmpty>
            ) : (
              <>
                <Stat>{formatUsd(request.quotedCents)}</Stat>
                <StatMeta>what we say it costs</StatMeta>
              </>
            )}
          </StatCell>
          <StatCell label="Gap">
            {gap === null ? (
              <StatEmpty>
                {request.budgetCents === null
                  ? "No budget to compare against."
                  : "Quote it to see the gap."}
              </StatEmpty>
            ) : (
              <p className={BODY}>{gap}</p>
            )}
          </StatCell>
        </StatStrip>

        <section className={SECTION_RHYTHM}>
          <SectionHead title="Scope" />
          {request.scope ? (
            <p className={cn(BODY, "whitespace-pre-wrap")}>{request.scope}</p>
          ) : (
            <p className={BODY_MUTED}>
              They have not written a scope yet. Only they can — it is their
              request to describe.
            </p>
          )}
        </section>

        <section className={SECTION_RHYTHM}>
          <SectionHead title="Details" />
          <div>
            <Fact
              label="Offering"
              value={SERVICE_LABELS[request.serviceType]}
            />
            <Fact
              label="Needed by"
              value={formatDay(request.targetDate) ?? "Not set"}
            />
            <Fact
              label="Opened by"
              value={
                request.openedBy === "agency"
                  ? `${request.openedByName ?? "Us"} · on their behalf`
                  : request.openedBy === "partner"
                    ? partnerName
                    : "Unknown"
              }
            />
            <Fact label="Last updated" value={formatDay(request.updatedAt)} />
            {request.projectName && (
              <Fact label="Project" value={request.projectName} />
            )}
          </div>
        </section>

        <section className={SECTION_RHYTHM}>
          <SectionHead title="Quote" />
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="partner-quote"
                  className="mb-1.5 block text-[13px] font-medium"
                >
                  Our price ($)
                </label>
                <Input
                  id="partner-quote"
                  inputMode="decimal"
                  placeholder="Leave blank to un-quote"
                  value={quote}
                  onChange={(e) => onQuoteChange(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="partner-request-status"
                  className="mb-1.5 block text-[13px] font-medium"
                >
                  Status
                </label>
                <Select
                  id="partner-request-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as PartnerRequestStatus);
                    setSaved(false);
                  }}
                >
                  {PARTNER_REQUEST_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {PARTNER_REQUEST_STATUS_LABELS[option]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <p className={CAPTION}>
              The quote is ours to set — a partner can never write it. Once you
              are quoting against a request, their side of it stops moving.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {saved && !dirty && !error && (
              <p className={BODY_MUTED}>Saved.</p>
            )}

            <button
              type="submit"
              className={cn(PRIMARY_PILL, "disabled:opacity-50")}
              disabled={saving || !dirty}
            >
              {saving ? "Saving…" : "Save Quote"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
