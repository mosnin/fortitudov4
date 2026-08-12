/**
 * The partner domain vocabulary — kinds, statuses, labels, and the exact set of
 * columns a partner may write on their own request. Shared by the permission
 * predicates (lib/permissions.ts), the /partner surface and /admin/partners, so
 * there is one list of statuses rather than three that drift.
 *
 * There is no commission, payout, split or ledger in here, and none is coming:
 * AGENTS.md bans that machinery and plans/partners.md explains why this feature
 * is a different thing. `kind` is a label describing who someone is.
 */

export const PARTNER_KINDS = ["affiliate", "agency"] as const;
export type PartnerKind = (typeof PARTNER_KINDS)[number];

export const PARTNER_KIND_LABELS: Record<PartnerKind, string> = {
  affiliate: "Affiliate",
  agency: "Agency",
};

export const PARTNER_STATUSES = ["active", "paused", "archived"] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

/**
 * draft → submitted → reviewing → quoted → accepted | declined → delivered
 *
 * `draft` covers both directions of the same door: a partner saving before they
 * are ready, and the shell we open when we want a partner to fill in scope and
 * budget for something already discussed. `createdBy` records which.
 */
export const PARTNER_REQUEST_STATUSES = [
  "draft",
  "submitted",
  "reviewing",
  "quoted",
  "accepted",
  "declined",
  "delivered",
] as const;
export type PartnerRequestStatus = (typeof PARTNER_REQUEST_STATUSES)[number];

export const PARTNER_REQUEST_STATUS_LABELS: Record<PartnerRequestStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewing: "Reviewing",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  delivered: "Delivered",
};

/**
 * The only statuses in which a request is still the partner's to change. Once
 * we are quoting against it, the thing being quoted stops moving.
 */
export const PARTNER_EDITABLE_STATUSES = ["draft", "submitted"] as const;

/**
 * The only columns a partner may ever write.
 *
 * `quotedCents` is deliberately absent — it is our price, not theirs — as are
 * `projectId` and `status`. See the comment on partnerRequests in db/schema.ts:
 * a partner has no authority over their own quote, the same way a client has
 * none over their own delivery stage or fees.
 */
export const PARTNER_EDITABLE_REQUEST_FIELDS = [
  "title",
  "scope",
  "serviceType",
  "budgetCents",
  "targetDate",
] as const;
export type PartnerEditableRequestField =
  (typeof PARTNER_EDITABLE_REQUEST_FIELDS)[number];

/** Columns a partner must never write, named so the deny is testable directly. */
export const PARTNER_PROTECTED_REQUEST_FIELDS = [
  "quotedCents",
  "projectId",
  "status",
  "partnerId",
  "id",
  "createdBy",
  "createdAt",
  "updatedAt",
] as const;

export function isPartnerRequestStatus(value: string): value is PartnerRequestStatus {
  return (PARTNER_REQUEST_STATUSES as readonly string[]).includes(value);
}
