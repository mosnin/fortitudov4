import type { ServiceType } from "@/lib/services";

/**
 * Single source of truth for what each service costs at checkout.
 *
 * Amounts are derived from the `startingPrice` strings in `services.ts` and are
 * always expressed in CENTS. Services whose starting price ends in "/mo" are
 * recurring retainers (`billing: "monthly"`); the rest are one-time projects.
 *
 * `lineItems` always sum to `amountCents` so an invoice built from them stays
 * internally consistent.
 */

export type BillingKind = "monthly" | "one_time";

export interface PricingLineItem {
  name: string;
  amountCents: number;
}

export interface ServicePricing {
  label: string;
  amountCents: number;
  billing: BillingKind;
  lineItems: PricingLineItem[];
}

const PRICING: Record<ServiceType, ServicePricing> = {
  websites: {
    label: "Websites",
    amountCents: 150000,
    billing: "one_time",
    lineItems: [
      { name: "Design & build", amountCents: 110000 },
      { name: "SEO, analytics & deployment", amountCents: 40000 },
    ],
  },
  software_solutions: {
    label: "Software Solutions",
    amountCents: 350000,
    billing: "one_time",
    lineItems: [
      { name: "Architecture, design & development", amountCents: 280000 },
      { name: "Auth, database & deployment", amountCents: 70000 },
    ],
  },
  ai_solutions: {
    label: "AI Solutions",
    amountCents: 300000,
    billing: "one_time",
    lineItems: [
      { name: "Agent & workflow design", amountCents: 240000 },
      { name: "Integration & deployment", amountCents: 60000 },
    ],
  },
  consultation: {
    label: "Consultation",
    amountCents: 50000,
    billing: "one_time",
    lineItems: [
      { name: "Strategy sessions & audit", amountCents: 35000 },
      { name: "Written action plan", amountCents: 15000 },
    ],
  },
  digital_marketing: {
    label: "Digital Marketing",
    amountCents: 120000,
    billing: "monthly",
    lineItems: [
      { name: "Funnel & campaign management", amountCents: 90000 },
      { name: "Testing, analytics & CRO", amountCents: 30000 },
    ],
  },
};

/**
 * Look up pricing for a service type. Returns `undefined` for an unknown
 * service so callers can fail defensively.
 */
export function getPricing(serviceType: string): ServicePricing | undefined {
  return PRICING[serviceType as ServiceType];
}

/**
 * Format a cents amount as whole US dollars, e.g. 150000 -> "$1,500".
 */
export function formatUsd(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}
