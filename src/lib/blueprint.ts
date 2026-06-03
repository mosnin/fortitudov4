import type { ServiceType } from "./services";
import type { BlueprintLineItem, BlueprintScopeItem } from "@/db/schema";
import { catalog, getCatalogItem, type CatalogItem } from "./catalog";

// The Brief — what the client (or their agent) tells us they want built.
export interface BriefInput {
  discipline: ServiceType;
  catalogSlug?: string;
  businessName: string;
  description: string;
  features?: string[];
  targetAudience?: string;
  timeline?: string;
  budget?: string;
  brandColors?: string;
  additionalNotes?: string;
}

export interface GeneratedBlueprint {
  title: string;
  summary: string;
  scope: BlueprintScopeItem[];
  architectureNotes: string;
  lineItems: BlueprintLineItem[];
  subtotal: number;
  total: number;
  currency: string;
  estimatedTimeline: string;
}

// Optional add-on modules per discipline. Keyword triggers are matched against
// the brief's free text + selected features to tailor scope and price.
interface AddOn {
  triggers: string[];
  label: string;
  description: string;
  amount: number; // cents
}

const addOns: Record<ServiceType, AddOn[]> = {
  software: [
    { triggers: ["billing", "subscription", "stripe", "payment", "pricing"], label: "Billing & subscriptions", description: "Subscription plans, metered billing, and a customer billing portal.", amount: 80000 },
    { triggers: ["admin", "back office", "moderation"], label: "Admin console", description: "An internal admin surface for support and operations.", amount: 60000 },
    { triggers: ["integration", "api", "webhook", "zapier", "third party", "third-party"], label: "Third-party integrations", description: "Integrations with external services and a webhook layer.", amount: 50000 },
    { triggers: ["mobile", "pwa", "ios", "android", "app store"], label: "Mobile / PWA", description: "An installable mobile experience.", amount: 70000 },
    { triggers: ["realtime", "real-time", "chat", "live", "collaboration", "websocket"], label: "Realtime layer", description: "Live updates, presence, and realtime collaboration.", amount: 60000 },
    { triggers: ["analytics", "reporting", "dashboard", "metrics", "charts"], label: "Analytics & reporting", description: "Reporting dashboards and exportable metrics.", amount: 40000 },
  ],
  commerce: [
    { triggers: ["subscription", "recurring", "membership"], label: "Subscriptions", description: "Recurring orders and membership billing.", amount: 60000 },
    { triggers: ["inventory", "stock", "warehouse", "fulfillment"], label: "Inventory & fulfillment", description: "Inventory tracking and fulfillment workflows.", amount: 40000 },
    { triggers: ["international", "multi-currency", "currency", "global"], label: "Multi-currency & tax", description: "Multi-currency pricing and tax handling.", amount: 40000 },
    { triggers: ["marketplace", "multi-vendor", "sellers", "vendors"], label: "Marketplace / multi-vendor", description: "Multiple sellers, payouts, and vendor dashboards.", amount: 120000 },
    { triggers: ["subscription box", "loyalty", "rewards", "points"], label: "Loyalty & rewards", description: "A loyalty program with points and rewards.", amount: 45000 },
  ],
  ai: [
    { triggers: ["rag", "knowledge", "documents", "retrieval", "search", "embeddings"], label: "Knowledge base (RAG)", description: "Retrieval over your documents with grounded answers.", amount: 80000 },
    { triggers: ["agent", "autonomous", "multi-step", "orchestration", "workflow"], label: "Agent orchestration", description: "Multi-step agents with tool use and orchestration.", amount: 120000 },
    { triggers: ["chatbot", "chat", "support", "conversational", "assistant"], label: "Conversational interface", description: "A conversational UI with handoff to humans.", amount: 50000 },
    { triggers: ["voice", "speech", "phone", "call"], label: "Voice interface", description: "Speech in/out for voice interactions.", amount: 70000 },
    { triggers: ["evaluation", "eval", "guardrail", "safety", "accuracy"], label: "Evaluation & guardrails", description: "Automated evals and safety guardrails.", amount: 45000 },
  ],
  infrastructure: [
    { triggers: ["kubernetes", "k8s", "container", "orchestration"], label: "Kubernetes", description: "Containerized workloads on Kubernetes.", amount: 80000 },
    { triggers: ["data pipeline", "pipeline", "warehouse", "etl", "elt", "analytics"], label: "Data pipeline", description: "Ingestion, transformation, and a warehouse.", amount: 90000 },
    { triggers: ["migration", "migrate", "move", "replatform"], label: "Migration", description: "Migration from existing infrastructure with zero-downtime cutover.", amount: 70000 },
    { triggers: ["compliance", "soc2", "soc 2", "hipaa", "gdpr", "audit", "security"], label: "Compliance hardening", description: "Controls and hardening for compliance requirements.", amount: 100000 },
    { triggers: ["scale", "scaling", "high availability", "ha", "load"], label: "Scaling & HA", description: "Autoscaling and high-availability architecture.", amount: 60000 },
  ],
};

const disciplineBasePrice: Record<ServiceType, number> = {
  software: 250000,
  commerce: 180000,
  ai: 300000,
  infrastructure: 200000,
};

const architectureNotesByDiscipline: Record<ServiceType, string> = {
  software:
    "We build on a modern, typed stack (Next.js, a Postgres data layer, and typed APIs) deployed on serverless infrastructure. Auth, data, and the UI shell form the foundation; modules below extend it. You own the codebase and the architecture.",
  commerce:
    "A commerce architecture you own — a custom storefront over a flexible backend for catalog, cart, checkout, and orders. Payments and inventory are first-class, and the system is built to add channels later.",
  ai:
    "An AI-native architecture: the model and its tools are part of the product, not bolted on. We pair generation with retrieval, human-in-the-loop controls, and observability so the system is reliable and accountable.",
  infrastructure:
    "Infrastructure-as-code from day one — reproducible environments, CI/CD, and monitoring. The foundation is designed to scale and to be operated calmly, with runbooks and a clean handover.",
};

function matchAddOns(input: BriefInput): AddOn[] {
  const haystack = [
    input.description,
    input.additionalNotes ?? "",
    ...(input.features ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const matched: AddOn[] = [];
  for (const addOn of addOns[input.discipline]) {
    if (addOn.triggers.some((t) => haystack.includes(t))) {
      matched.push(addOn);
    }
  }
  return matched;
}

// Generate a tailored Blueprint from a Brief. Deterministic and rule-based —
// the structure is ready for an AI-assisted draft later, but this works today
// with no model in the loop.
export function generateBlueprint(input: BriefInput): GeneratedBlueprint {
  const base: CatalogItem | undefined = input.catalogSlug
    ? getCatalogItem(input.catalogSlug)
    : catalog.find((c) => c.discipline === input.discipline);

  const basePrice = base?.fromPrice ?? disciplineBasePrice[input.discipline];
  const baseLabel = base?.name ?? "Custom build";
  const baseFeatures = base?.features ?? [];

  const lineItems: BlueprintLineItem[] = [
    {
      label: baseLabel,
      description: base?.summary ?? `Foundational ${input.discipline} build for ${input.businessName}.`,
      amount: basePrice,
    },
  ];

  const scope: BlueprintScopeItem[] = baseFeatures.map((f) => ({ title: f }));

  for (const addOn of matchAddOns(input)) {
    lineItems.push({ label: addOn.label, description: addOn.description, amount: addOn.amount });
    scope.push({ title: addOn.label, detail: addOn.description });
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  // No tax computed at blueprint stage; total == subtotal for now.
  const total = subtotal;

  return {
    title: `${baseLabel} — ${input.businessName}`,
    summary:
      input.description.length > 280
        ? input.description.slice(0, 277) + "…"
        : input.description,
    scope,
    architectureNotes: architectureNotesByDiscipline[input.discipline],
    lineItems,
    subtotal,
    total,
    currency: "usd",
    estimatedTimeline: base?.estimatedTimeline ?? input.timeline ?? "3–6 weeks",
  };
}
