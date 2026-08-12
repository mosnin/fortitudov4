import type { UserRole } from "@/db/schema";
import {
  PARTNER_EDITABLE_REQUEST_FIELDS,
  PARTNER_EDITABLE_STATUSES,
} from "@/lib/partners";

/**
 * Tiered access control for the agency's internal team.
 *
 * admin           — full control: billing, integrations, team roles, everything.
 * project_manager — runs client projects day-to-day: tasks, phases, messaging, files.
 * va              — execution-level access: update tasks assigned to them, message clients.
 * client          — their own projects only (enforced separately via verifyProjectAccess).
 * partner         — a third party who brings work in. NOT staff and not a client:
 *                   they see only their own partner requests, at /partner.
 */

// Deliberately does not contain "partner". A partner is a third party, not a
// member of the agency; if they pass isStaff they land in /admin, which is the
// worst outcome this file can produce.
const STAFF_ROLES: UserRole[] = ["admin", "project_manager", "va"];

export function isStaff(role: string): boolean {
  return (STAFF_ROLES as string[]).includes(role);
}

export function isAdmin(role: string): boolean {
  return role === "admin";
}

/** Billing, invoices and payments, team roles. Admin only. */
export function canManageAgency(role: string): boolean {
  return role === "admin";
}

/** Create/reassign tasks, advance phases, manage client-facing project data. */
export function canManageProjects(role: string): boolean {
  return role === "admin" || role === "project_manager";
}

/**
 * See every project/client/lead in the agency. Admins and project managers do;
 * VAs are scoped to only the projects they're assigned work on (enforced in
 * verifyProjectAccess), and clients see only their own.
 */
export function canViewAllProjects(role: string): boolean {
  return role === "admin" || role === "project_manager";
}

/** Read lead PII (name/email/phone/budget) and triage the pipeline. */
export function canManageLeads(role: string): boolean {
  return role === "admin" || role === "project_manager";
}

/** Update the status/notes of tasks — any staff member, scoped to their own assignments for VAs. */
export function canUpdateTask(
  role: string,
  userId: string,
  task: { assigneeId: string | null }
): boolean {
  if (role === "admin" || role === "project_manager") return true;
  // `task.assigneeId === userId` alone matches null to null, so a caller with
  // no id would pass on every UNASSIGNED task. Not reachable today — users.id
  // is a non-null uuid and every caller passes a row straight from the
  // database — but an ownership check that can be satisfied by two absent
  // values is the wrong shape to leave in an access-control function.
  if (role === "va") return Boolean(userId) && task.assigneeId === userId;
  return false;
}

/** A third party who brings work in — the /partner surface, and nothing else. */
export function isPartner(role: string): boolean {
  return role === "partner";
}

/**
 * Create partners, read their requests, quote them, move them through the
 * pipeline. Admin and project_manager only.
 *
 * A VA is scoped to the tasks they hold; a partner request is a commercial
 * document with someone else's budget in it, so it is not theirs to read.
 */
export function canManagePartners(role: string): boolean {
  return role === "admin" || role === "project_manager";
}

/**
 * May THIS partner write THIS column of THIS request?
 *
 * Three conditions, all required:
 *   1. the caller is a partner (staff manage requests through
 *      canManagePartners — this predicate answers only the partner side),
 *   2. the request belongs to them — `partnerId` is theirs,
 *   3. the request is still `draft` or `submitted`, and the column is one of
 *      title / scope / serviceType / budgetCents / targetDate.
 *
 * Everything else is denied, `quotedCents`, `projectId` and `status` loudest of
 * all: our price is not theirs to set, and once we are quoting against a
 * request the thing being quoted stops moving. The field list is matched with
 * Array.includes rather than an object lookup so `__proto__` and `constructor`
 * are ordinary misses instead of inherited truthy members.
 */
export function canPartnerEditRequest(
  role: string,
  partnerId: string,
  request: { partnerId: string; status: string },
  field: string
): boolean {
  if (!isPartner(role)) return false;
  // As in canUpdateTask: an ownership check two absent values can satisfy is
  // the wrong shape to leave in an access-control function.
  if (!partnerId || !request?.partnerId) return false;
  if (request.partnerId !== partnerId) return false;
  if (!(PARTNER_EDITABLE_STATUSES as readonly string[]).includes(request.status)) {
    return false;
  }
  return (PARTNER_EDITABLE_REQUEST_FIELDS as readonly string[]).includes(field);
}

/**
 * The one status change a partner may make: submitting their own draft.
 * Every other transition — reviewing, quoted, accepted, declined, delivered,
 * and any reopening of a submitted request — is ours.
 */
export function canPartnerSubmitRequest(
  role: string,
  partnerId: string,
  request: { partnerId: string; status: string },
  nextStatus: string
): boolean {
  if (!isPartner(role)) return false;
  if (!partnerId || !request?.partnerId) return false;
  if (request.partnerId !== partnerId) return false;
  return request.status === "draft" && nextStatus === "submitted";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  admin: "Admin",
  project_manager: "Project Manager",
  va: "VA",
  partner: "Partner",
};
