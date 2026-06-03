import {
  Code2,
  ShoppingCart,
  Bot,
  Server,
  type LucideIcon,
} from "lucide-react";

// The four building disciplines. We are builders — we make digital assets and
// architecture. No marketing, no SEO, no funnels.
export type ServiceType = "software" | "commerce" | "ai" | "infrastructure";

export interface Service {
  id: ServiceType;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];
  startingPrice: string;
}

export const services: Service[] = [
  {
    id: "software",
    name: "Software",
    tagline: "Web apps, SaaS, internal tools",
    description:
      "Custom software built to last — web applications, SaaS platforms, internal tools, and the systems your business runs on.",
    icon: Code2,
    capabilities: [
      "Web & SaaS applications",
      "Internal tools & dashboards",
      "Auth, billing & multi-tenancy",
      "APIs & integrations",
      "Performance & scale",
    ],
    startingPrice: "from $2,500",
  },
  {
    id: "commerce",
    name: "Commerce",
    tagline: "Storefronts & commerce systems",
    description:
      "Commerce architecture that converts — storefronts, checkout, inventory, and the order systems behind them.",
    icon: ShoppingCart,
    capabilities: [
      "Custom storefronts",
      "Checkout & payments",
      "Inventory & fulfillment",
      "Order management",
      "Headless commerce",
    ],
    startingPrice: "from $1,800",
  },
  {
    id: "ai",
    name: "AI",
    tagline: "AI-native software & agents",
    description:
      "AI woven into the product, not bolted on — agents, automation pipelines, and AI-native applications.",
    icon: Bot,
    capabilities: [
      "AI-native applications",
      "Autonomous agents",
      "Automation pipelines",
      "RAG & knowledge systems",
      "Model & tool integration",
    ],
    startingPrice: "from $3,000",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    tagline: "Cloud, deployment & architecture",
    description:
      "The foundation everything stands on — cloud architecture, deployment pipelines, data systems, and Open Claw deployments.",
    icon: Server,
    capabilities: [
      "Cloud architecture",
      "Deployment pipelines",
      "Data pipelines & warehouses",
      "Open Claw deployments",
      "Monitoring & reliability",
    ],
    startingPrice: "from $2,000",
  },
];

export function getService(id: ServiceType): Service | undefined {
  return services.find((s) => s.id === id);
}

// Default build phases. Per-project phases are stored in the DB and can be
// tailored; these are the studio's standard rhythm for a build.
export const projectPhaseNames = [
  "Discovery",
  "Architecture",
  "Build",
  "Integration",
  "Review",
  "Launch",
];
