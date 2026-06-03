import type { ServiceType } from "./services";

// Productized starting points — the hybrid model's on-ramp. Each is a real,
// purchasable package (by humans and, where allowed, by agents). Anything
// beyond a starting point flows into a bespoke Blueprint.
//
// Prices are in cents. fixedPrice=false means the number is a "from" price and
// the true total is set in the Blueprint after the Brief.
export interface CatalogItem {
  slug: string;
  discipline: ServiceType;
  name: string;
  summary: string;
  description: string;
  fromPrice: number;
  fixedPrice: boolean;
  agentPurchasable: boolean;
  features: string[];
  estimatedTimeline: string;
}

export const catalog: CatalogItem[] = [
  // --- Software ---
  {
    slug: "web-app-foundation",
    discipline: "software",
    name: "Web App · Foundation",
    summary: "A production-ready web app foundation: auth, database, dashboard.",
    description:
      "A clean, deployable foundation for a custom web application — authentication, a database layer, a dashboard shell, and CI/CD. The fastest way to go from idea to a real, extendable product.",
    fromPrice: 250000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Authentication & user accounts",
      "Database schema & API layer",
      "Responsive dashboard shell",
      "Deploy pipeline & hosting",
      "Architecture handover",
    ],
    estimatedTimeline: "2–4 weeks",
  },
  {
    slug: "saas-platform",
    discipline: "software",
    name: "SaaS Platform",
    summary: "Multi-tenant SaaS with billing, roles, and admin.",
    description:
      "A multi-tenant SaaS platform with subscription billing, role-based access, an admin console, and the dashboards your users live in.",
    fromPrice: 450000,
    fixedPrice: false,
    agentPurchasable: false,
    features: [
      "Multi-tenancy",
      "Subscription billing",
      "Role-based access control",
      "Admin console",
      "Usage analytics",
    ],
    estimatedTimeline: "5–8 weeks",
  },
  {
    slug: "internal-tool",
    discipline: "software",
    name: "Internal Tool",
    summary: "A focused internal tool or dashboard for your team.",
    description:
      "A purpose-built internal tool — operations dashboards, admin panels, or workflow tools — connected to your existing data.",
    fromPrice: 180000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Connects to your data sources",
      "Role-aware access",
      "Custom workflows",
      "Audit logging",
    ],
    estimatedTimeline: "2–3 weeks",
  },

  // --- Commerce ---
  {
    slug: "storefront-launch",
    discipline: "commerce",
    name: "Storefront · Launch",
    summary: "A custom storefront with checkout and order management.",
    description:
      "A high-converting custom storefront with product catalog, cart, secure checkout, and order management — built on a commerce architecture you own.",
    fromPrice: 180000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Custom storefront",
      "Cart & checkout",
      "Payment processing",
      "Order management",
      "Inventory tracking",
    ],
    estimatedTimeline: "3–5 weeks",
  },
  {
    slug: "headless-commerce",
    discipline: "commerce",
    name: "Headless Commerce",
    summary: "A headless commerce backend with a custom frontend.",
    description:
      "A headless commerce architecture — a flexible backend (payments, inventory, fulfillment) with a bespoke frontend that can live anywhere.",
    fromPrice: 350000,
    fixedPrice: false,
    agentPurchasable: false,
    features: [
      "Headless architecture",
      "Custom frontend",
      "Inventory & fulfillment",
      "Multi-channel ready",
      "Webhooks & integrations",
    ],
    estimatedTimeline: "5–7 weeks",
  },

  // --- AI ---
  {
    slug: "ai-automation-pilot",
    discipline: "ai",
    name: "AI Automation · Pilot",
    summary: "An AI workflow that automates one real process, end to end.",
    description:
      "A focused AI automation that takes one real workflow — support triage, content drafting, data processing — and runs it reliably, with human-in-the-loop where it matters.",
    fromPrice: 300000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Custom AI workflow",
      "Tool & API integration",
      "Human-in-the-loop controls",
      "Evaluation & guardrails",
      "Monitoring",
    ],
    estimatedTimeline: "3–5 weeks",
  },
  {
    slug: "ai-agent-system",
    discipline: "ai",
    name: "AI Agent System",
    summary: "An autonomous agent system with tools, memory, and oversight.",
    description:
      "A production agent system — tool use, memory, orchestration, and the oversight surfaces that keep it accountable.",
    fromPrice: 550000,
    fixedPrice: false,
    agentPurchasable: false,
    features: [
      "Multi-step agents",
      "Tool & function calling",
      "Memory & retrieval",
      "Orchestration",
      "Observability & guardrails",
    ],
    estimatedTimeline: "6–10 weeks",
  },

  // --- Infrastructure ---
  {
    slug: "cloud-architecture-setup",
    discipline: "infrastructure",
    name: "Cloud · Architecture Setup",
    summary: "Cloud architecture, deploy pipelines, and monitoring.",
    description:
      "A solid cloud foundation — infrastructure-as-code, deployment pipelines, environments, and monitoring — designed to scale and stay reliable.",
    fromPrice: 200000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Infrastructure as code",
      "CI/CD pipelines",
      "Staging & production environments",
      "Monitoring & alerting",
      "Runbooks & handover",
    ],
    estimatedTimeline: "2–4 weeks",
  },
  {
    slug: "open-claw-deployment",
    discipline: "infrastructure",
    name: "Open Claw Deployment",
    summary: "Deploy and operate an Open Claw instance with monitoring.",
    description:
      "A managed Open Claw deployment — configuration, deployment pipeline, monitoring, scaling, and ongoing operability.",
    fromPrice: 200000,
    fixedPrice: false,
    agentPurchasable: true,
    features: [
      "Instance setup & configuration",
      "Deployment pipeline",
      "Monitoring & alerts",
      "Scaling",
      "Documentation",
    ],
    estimatedTimeline: "2–3 weeks",
  },
];

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return catalog.find((c) => c.slug === slug);
}

export function getCatalogForDiscipline(discipline: ServiceType): CatalogItem[] {
  return catalog.filter((c) => c.discipline === discipline);
}

// Format cents as a clean USD string, e.g. 250000 -> "$2,500".
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
