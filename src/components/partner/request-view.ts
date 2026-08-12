/**
 * The partner request as the /partner surface sees it: a plain, serializable
 * shape plus the handful of questions every screen asks of it.
 *
 * Shared by the server pages (which build it) and the client components (which
 * render it), so "may I still edit this?" and "is there a quote yet?" are
 * answered once, from `lib/partners.ts`, rather than re-derived per screen.
 *
 * `quotedCents` is carried but there is no setter for it anywhere in this
 * folder and there must not be. A partner reads our price; they do not write
 * it. See the comment on partnerRequests in db/schema.ts.
 */

import type { PartnerRequest } from "@/db/schema";
import {
  PARTNER_EDITABLE_STATUSES,
  PARTNER_REQUEST_STATUSES,
  PARTNER_REQUEST_STATUS_LABELS,
  type PartnerRequestStatus,
} from "@/lib/partners";
import { formatUsd } from "@/lib/pricing";
import type { ServiceType } from "@/lib/services";

export interface PartnerRequestView {
  id: string;
  title: string;
  scope: string | null;
  serviceType: ServiceType;
  /** What the partner says they have. Theirs to set. */
  budgetCents: number | null;
  /** What we say it costs. Never theirs to set. */
  quotedCents: number | null;
  status: PartnerRequestStatus;
  /** `yyyy-mm-dd`, the value a native date input wants. */
  targetDate: string | null;
  /** ISO instant — formatted for display with an explicit UTC zone. */
  updatedAt: string;
}

/** Rows come out of the database with Date objects; the client needs strings. */
export function toRequestView(row: PartnerRequest): PartnerRequestView {
  return {
    id: row.id,
    title: row.title,
    scope: row.scope,
    serviceType: row.serviceType,
    budgetCents: row.budgetCents,
    quotedCents: row.quotedCents,
    status: row.status,
    targetDate: row.targetDate
      ? row.targetDate.toISOString().slice(0, 10)
      : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Still the partner's to change — `draft` or `submitted`, nothing else. */
export function isEditable(status: PartnerRequestStatus): boolean {
  return (PARTNER_EDITABLE_STATUSES as readonly string[]).includes(status);
}

/**
 * Has the request reached the point where a quote exists to show?
 *
 * Derived from the position of `quoted` in the status list rather than a second
 * hand-written list, so `accepted` / `declined` / `delivered` cannot fall out
 * of it when the pipeline gains a stage.
 */
const QUOTE_VISIBLE_FROM = PARTNER_REQUEST_STATUSES.indexOf("quoted");

export function quoteIsVisible(status: PartnerRequestStatus): boolean {
  return PARTNER_REQUEST_STATUSES.indexOf(status) >= QUOTE_VISIBLE_FROM;
}

/** True only when there is a real number to render. */
export function hasQuote(request: PartnerRequestView): boolean {
  return quoteIsVisible(request.status) && request.quotedCents !== null;
}

export function statusLabel(status: PartnerRequestStatus): string {
  return PARTNER_REQUEST_STATUS_LABELS[status];
}

/** Integer cents → "$5,000", or null when there is no number to show. */
export function formatMoney(cents: number | null): string | null {
  return cents === null ? null : formatUsd(cents);
}

/**
 * A date, formatted the same on the server and in the browser.
 *
 * The zone is pinned to UTC on purpose: these render inside client components
 * that are also rendered on the server, and a locale-default zone gives the two
 * passes different strings and a hydration mismatch.
 */
export function formatDay(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** One plain sentence: what is happening to this request right now. */
export function nextStep(status: PartnerRequestStatus): string {
  switch (status) {
    case "draft":
      return "Still a draft. Send it when you're ready and we'll pick it up.";
    case "submitted":
      return "We have it. We'll come back to you with a price.";
    case "reviewing":
      return "We're working out what this takes. A price comes next.";
    case "quoted":
      return "Our price is below. Tell us if you want to go ahead.";
    case "accepted":
      return "Agreed. This one is going ahead.";
    case "declined":
      return "This one isn't going ahead.";
    case "delivered":
      return "Done and delivered.";
  }
}

/**
 * Why the form stopped accepting edits. Shown instead of silently greying
 * controls out — a locked field with no reason reads as a bug.
 */
export function lockedReason(status: PartnerRequestStatus): string {
  switch (status) {
    case "reviewing":
      return "You can't change this while we're pricing it — the thing being quoted has to hold still. Tell us what needs to change and we'll update it.";
    case "quoted":
      return "This is locked because we've quoted against it. If the job has changed, tell us and we'll requote.";
    case "accepted":
      return "This is agreed, so it's locked. Anything new goes in a new request.";
    case "declined":
      return "This one is closed. Start a new request if you want to try again.";
    case "delivered":
      return "This is delivered, so it's locked.";
    default:
      return "This request is locked.";
  }
}
