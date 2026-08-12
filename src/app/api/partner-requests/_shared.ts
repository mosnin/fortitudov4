/**
 * The shapes a partner request may be written in.
 *
 * Two callers, two schemas, on purpose. The partner schema simply does not
 * contain `quotedCents`, `projectId` or `partnerId` — a column that is not in
 * the schema cannot be smuggled through it, whatever the body says. The staff
 * schema does, because quoting is what staff are for.
 *
 * Not a route: only `route.ts` is routable, and a route file may export only
 * HTTP handlers, so shared schemas live beside it rather than inside it.
 */

import { z } from "zod";
import { partnerRequestStatusEnum, serviceTypeEnum } from "@/db/schema";
import {
  centsSchema,
  dateSchema,
} from "@/app/api/partners/_shared";

/**
 * The five columns a partner may write — the same list as
 * PARTNER_EDITABLE_REQUEST_FIELDS in lib/partners.ts, which the handlers check
 * every field against through canPartnerEditRequest. This schema is the cap
 * and the trim; that predicate is the authority.
 */
const requestBaseSchema = z.object({
  title: z.string().trim().min(1).max(255),
  scope: z.string().trim().max(5000).nullable().optional(),
  // The five offerings, from the enum the rest of the system uses — never a
  // free-text category.
  serviceType: z.enum(serviceTypeEnum.enumValues),
  // What the partner says they have. Integer cents.
  budgetCents: centsSchema.nullable().optional(),
  targetDate: dateSchema.nullable().optional(),
});

const statusSchema = z.enum(partnerRequestStatusEnum.enumValues);

/**
 * A partner opening a request. `status` is accepted but not honoured blindly:
 * the handler puts it through canPartnerSubmitRequest, so the only values that
 * survive are `draft` and the one transition a partner owns, `submitted`.
 */
export const partnerCreateSchema = requestBaseSchema.extend({
  status: statusSchema.optional(),
});

export const partnerUpdateSchema = requestBaseSchema
  .partial()
  .extend({ status: statusSchema.optional() })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Nothing to update",
  });

/** Ours: the quote, the project link and every status are staff-side. */
export const staffCreateSchema = requestBaseSchema.extend({
  partnerId: z.string().uuid(),
  quotedCents: centsSchema.nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  status: statusSchema.optional(),
});

/**
 * `partnerId` is deliberately absent: moving a request between partners is not
 * an edit, it would hand one partner's commercial document to another.
 */
export const staffUpdateSchema = requestBaseSchema
  .partial()
  .extend({
    quotedCents: centsSchema.nullable().optional(),
    projectId: z.string().uuid().nullable().optional(),
    status: statusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Nothing to update",
  });
