import type { ServiceType } from "./services";

// The bespoke project configurator: pick a core product, layer on add-ons, get
// a real price. Prices are in cents. Edit here to tune the catalog.

export interface CoreProduct {
  id: string;
  name: string;
  discipline: ServiceType;
  tagline: string;
  description: string;
  price: number; // cents
  timeline: string;
  features: string[];
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  category: string;
  appliesTo: ServiceType[] | "all";
}

export const coreProducts: CoreProduct[] = [
  {
    id: "website",
    name: "Website",
    discipline: "software",
    tagline: "Marketing site or web app",
    description: "A fast, custom website or web app — design, build, and launch.",
    price: 250000,
    timeline: "2–4 weeks",
    features: ["Custom design", "Responsive build", "CMS-ready", "Launch & hosting setup"],
  },
  {
    id: "ecommerce",
    name: "Ecommerce store",
    discipline: "commerce",
    tagline: "Storefront + checkout",
    description: "A conversion-focused storefront with checkout, products, and orders.",
    price: 450000,
    timeline: "3–6 weeks",
    features: ["Custom storefront", "Checkout & payments", "Product & inventory", "Order management"],
  },
  {
    id: "software",
    name: "Custom software",
    discipline: "software",
    tagline: "SaaS / internal tools",
    description: "A bespoke SaaS platform or internal tool — auth, billing, the works.",
    price: 900000,
    timeline: "6–12 weeks",
    features: ["Auth & multi-tenancy", "Core application", "Admin tooling", "APIs & integrations"],
  },
  {
    id: "ai-app",
    name: "AI app / agent",
    discipline: "ai",
    tagline: "AI-native software",
    description: "An AI-native application or autonomous agent built on your data.",
    price: 750000,
    timeline: "5–10 weeks",
    features: ["AI/agent architecture", "RAG / knowledge base", "Tooling & automations", "Guardrails"],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    discipline: "infrastructure",
    tagline: "Cloud & deployment",
    description: "Cloud architecture, deployment pipelines, and reliability.",
    price: 400000,
    timeline: "2–5 weeks",
    features: ["Cloud architecture", "CI/CD pipelines", "Monitoring & alerts", "Scaling & reliability"],
  },
];

export const addonCategories = [
  { id: "integration", label: "Integrations" },
  { id: "growth", label: "Growth" },
  { id: "brand", label: "Brand" },
  { id: "speed", label: "Speed" },
  { id: "extra", label: "Extras" },
] as const;

export const addons: Addon[] = [
  {
    id: "integrations",
    name: "Third-party integrations",
    description: "Connect CRMs, payment, email, or any external API.",
    price: 150000,
    category: "integration",
    appliesTo: "all",
  },
  {
    id: "ai-features",
    name: "AI features",
    description: "Add AI — search, copilots, automations — to your build.",
    price: 300000,
    category: "integration",
    appliesTo: "all",
  },
  {
    id: "analytics",
    name: "Analytics & dashboards",
    description: "Product analytics and reporting dashboards.",
    price: 120000,
    category: "growth",
    appliesTo: "all",
  },
  {
    id: "seo",
    name: "SEO setup",
    description: "Technical SEO, metadata, sitemaps, and performance.",
    price: 90000,
    category: "growth",
    appliesTo: ["software", "commerce"],
  },
  {
    id: "cms",
    name: "CMS / content editing",
    description: "Edit content yourself — no developer needed.",
    price: 100000,
    category: "growth",
    appliesTo: ["software", "commerce"],
  },
  {
    id: "brand-kit",
    name: "Brand kit",
    description: "Logo, palette, type, and a usage system.",
    price: 120000,
    category: "brand",
    appliesTo: "all",
  },
  {
    id: "expedited",
    name: "Expedited timeline",
    description: "Priority scheduling — we compress the timeline.",
    price: 200000,
    category: "speed",
    appliesTo: "all",
  },
  {
    id: "support",
    name: "Extended support",
    description: "Three months of post-launch support & tweaks.",
    price: 150000,
    category: "extra",
    appliesTo: "all",
  },
];

export function applicableAddons(discipline: ServiceType): Addon[] {
  return addons.filter((a) => a.appliesTo === "all" || a.appliesTo.includes(discipline));
}

export function computeTotal(core: CoreProduct, selectedAddonIds: string[]): number {
  const addonTotal = addons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  return core.price + addonTotal;
}
