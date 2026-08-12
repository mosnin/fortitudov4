/**
 * Small shared helpers for the agency's side of the partner relationship.
 *
 * Deliberately NOT a "use client" module: the `/admin/partners` server pages
 * count open requests with it and the client components render with it, and one
 * definition of "open" beats two that drift.
 *
 * The vocabulary itself — kinds, statuses, labels — lives in `lib/partners.ts`.
 * Nothing here re-declares it.
 */

import {
  PARTNER_REQUEST_STATUSES,
  type PartnerRequestStatus,
} from "@/lib/partners";
import { formatUsd } from "@/lib/pricing";

/**
 * Still ours to answer. `accepted`, `declined` and `delivered` are settled —
 * the request has left the queue whichever way it went.
 */
export const OPEN_REQUEST_STATUSES = PARTNER_REQUEST_STATUSES.filter(
  (status) => !["accepted", "declined", "delivered"].includes(status)
) as readonly PartnerRequestStatus[];

export function isOpenRequestStatus(status: string): boolean {
  return (OPEN_REQUEST_STATUSES as readonly string[]).includes(status);
}

/** The statuses waiting on us specifically — a partner has said their piece. */
export const AWAITING_QUOTE_STATUSES: readonly PartnerRequestStatus[] = [
  "submitted",
  "reviewing",
];

/** Short date, UTC so a timestamp does not slide a day across time zones. */
export function formatDay(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The gap between what they asked for and what we quoted — the negotiation,
 * stated in words. `budgetCents` is theirs and `quotedCents` is ours; the two
 * are separate columns on purpose (plans/partners.md) and this is where the
 * difference is actually useful.
 */
export function quoteGap(
  budgetCents: number | null,
  quotedCents: number | null
): string | null {
  if (budgetCents === null || quotedCents === null) return null;
  const diff = quotedCents - budgetCents;
  if (diff === 0) return "Matches their budget";
  return diff > 0
    ? `${formatUsd(diff)} over their budget`
    : `${formatUsd(-diff)} under their budget`;
}

/** Dollars typed into a form → integer cents. Money is cents everywhere. */
export function dollarsToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(/[$,]/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

/** Integer cents → the plain dollars string a form field starts life with. */
export function centsToDollars(cents: number | null): string {
  if (cents === null) return "";
  return (cents / 100).toString();
}
