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
  web_application: {
    label: "Web Application",
    amountCents: 250000,
    billing: "one_time",
    lineItems: [
      { name: "Design, architecture & development", amountCents: 200000 },
      { name: "Auth, database & deployment", amountCents: 50000 },
    ],
  },
  ecommerce_store: {
    label: "Ecommerce Store",
    amountCents: 180000,
    billing: "one_time",
    lineItems: [
      { name: "Storefront design & build", amountCents: 140000 },
      { name: "Payments, inventory & SEO setup", amountCents: 40000 },
    ],
  },
  funnels: {
    label: "Funnels",
    amountCents: 120000,
    billing: "one_time",
    lineItems: [
      { name: "Funnel design & build", amountCents: 90000 },
      { name: "Email capture & analytics setup", amountCents: 30000 },
    ],
  },
  ai_automation: {
    label: "AI Automation",
    amountCents: 300000,
    billing: "one_time",
    lineItems: [
      { name: "Workflow design & AI integration", amountCents: 240000 },
      { name: "Data pipelines & API wiring", amountCents: 60000 },
    ],
  },
  open_claw_deployment: {
    label: "Open Claw Deployment",
    amountCents: 200000,
    billing: "one_time",
    lineItems: [
      { name: "Instance setup & deployment pipeline", amountCents: 150000 },
      { name: "Monitoring, scaling & support setup", amountCents: 50000 },
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
