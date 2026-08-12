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
      "A site people can find, and buy from. We design it, build it, and put it live.",
    icon: Globe,
    features: [
      "Designed and built for you",
      "A shop and a checkout",
      "Built so Google can find it",
      "See who visits",
      "We put it online",
    ],
    startingPrice: "Starting at $1,500",
  },
  {
    id: "software_solutions",
    name: "Software Solutions",
    description:
      "An app your team will actually use. Portals, internal tools, and software that keeps working as you grow.",
    icon: Code2,
    features: [
      "Planned before it is built",
      "Screens made for your team",
      "Logins and data, handled",
      "Works with your other tools",
      "Launched and supported",
    ],
    startingPrice: "Starting at $3,500",
  },
  {
    id: "ai_solutions",
    name: "AI Solutions",
    description:
      "Hand the repetitive work to a computer. Your team stops doing it by hand and gets the time back.",
    icon: Bot,
    features: [
      "AI that does a job for you",
      "The repeat steps, automatic",
      "A chatbot that answers",
      "Your data moved for you",
      "Runs on the tools you already use",
    ],
    startingPrice: "Starting at $3,000",
  },
  {
    id: "consultation",
    name: "Consultation",
    description:
      "Know what to build before you spend money on it. Sit down with a senior builder and leave with a plan.",
    icon: Compass,
    features: [
      "What to build, in order",
      "A look at what you have now",
      "Where AI would help you",
      "Which tools to pick",
      "A written plan you keep",
    ],
    startingPrice: "Starting at $500",
  },
  {
    id: "digital_marketing",
    name: "Digital Marketing",
    description:
      "More of the people who find you turn into customers. We run the pages, the ads, and the follow-ups.",
    icon: Megaphone,
    features: [
      "Pages built to sell",
      "Emails and texts that follow up",
      "We test what works",
      "You see the numbers",
      "We keep improving it",
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
