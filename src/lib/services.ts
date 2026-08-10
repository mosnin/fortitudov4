import {
  Globe,
  Code2,
  Bot,
  Compass,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type ServiceType =
  | "websites"
  | "software_solutions"
  | "ai_solutions"
  | "consultation"
  | "digital_marketing";

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  startingPrice: string;
}

export const services: Service[] = [
  {
    id: "websites",
    name: "Websites",
    description:
      "Marketing sites, landing pages, and ecommerce storefronts — designed, built, and launched fast.",
    icon: Globe,
    features: [
      "Custom design & build",
      "Ecommerce & checkout",
      "SEO fundamentals",
      "Analytics wired in",
      "Hosting & deployment",
    ],
    startingPrice: "Starting at $1,500",
  },
  {
    id: "software_solutions",
    name: "Software Solutions",
    description:
      "Custom web applications, client portals, and internal tools — architected to scale with your business.",
    icon: Code2,
    features: [
      "Product architecture",
      "Custom UI/UX",
      "Auth, database & APIs",
      "Integrations",
      "Deployment & support",
    ],
    startingPrice: "Starting at $3,500",
  },
  {
    id: "ai_solutions",
    name: "AI Solutions",
    description:
      "AI agents, automations, and content pipelines that hand hours back to your team every week.",
    icon: Bot,
    features: [
      "Custom AI agents",
      "Workflow automation",
      "Chatbot integration",
      "Data pipelines",
      "Deployed on your stack",
    ],
    startingPrice: "Starting at $3,000",
  },
  {
    id: "consultation",
    name: "Consultation",
    description:
      "Senior product and engineering guidance — roadmap, architecture, and AI strategy sessions.",
    icon: Compass,
    features: [
      "Product roadmap",
      "Architecture review",
      "AI-readiness audit",
      "Vendor & stack advice",
      "Written action plan",
    ],
    startingPrice: "Starting at $500",
  },
  {
    id: "digital_marketing",
    name: "Digital Marketing",
    description:
      "Funnels, campaigns, and conversion work that turn traffic into revenue — measured end to end.",
    icon: Megaphone,
    features: [
      "Funnels & landing pages",
      "Email & SMS sequences",
      "A/B testing",
      "Campaign analytics",
      "CRO iterations",
    ],
    startingPrice: "Starting at $1,200/mo",
  },
];

export const projectPhaseNames = [
  "Discovery",
  "Design",
  "Development",
  "Testing",
  "Review",
  "Launch",
];

/**
 * Plain label map for the five offerings — for server code and agent-facing
 * strings that want the name without pulling in a service's icon or copy.
 */
export const SERVICE_LABELS: Record<ServiceType, string> = {
  websites: "Websites",
  software_solutions: "Software Solutions",
  ai_solutions: "AI Solutions",
  consultation: "Consultation",
  digital_marketing: "Digital Marketing",
};
