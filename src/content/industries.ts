export interface Industry {
  slug: string;
  label: string;
  title: string;
  lead: string;
  fit: string;
  priorities: Array<{ title: string; body: string }>;
  steps: Array<{ title: string; body: string; items: string[] }>;
  inputs: string;
  boundary: string;
  services: string[];
  work: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "fintech",
    label: "Fintech",
    title: "Digital products built around trust, access and accountable operations.",
    lead:
      "We design and build customer experiences, internal software and AI workflows for financial products where permissions, data handling and review paths need to be clear from the start.",
    fit:
      "For fintech teams launching a product, replacing a fragile workflow or connecting systems used by customers and operators.",
    priorities: [
      {
        title: "Explain the product clearly",
        body: "Give customers a direct account of what the product does, what information it needs and what happens next.",
      },
      {
        title: "Design for permissions and review",
        body: "Map roles, approval points, records and exception handling before implementation decisions become expensive.",
      },
      {
        title: "Keep provider boundaries visible",
        body: "Identify the identity, payment, banking, data and model providers involved, including their eligibility and operating constraints.",
      },
    ],
    steps: [
      {
        title: "Define the operating journey",
        body: "Map the customer and operator journeys, the information they use and the decisions that require human or system approval.",
        items: [
          "Customer, operator and administrator journeys",
          "Data, permissions and approval requirements",
          "Provider and regulatory dependencies",
        ],
      },
      {
        title: "Build the connected product",
        body: "Create the interface, software and integrations around the agreed roles and workflows.",
        items: [
          "Responsive product and marketing experience",
          "Identity, data and provider integrations",
          "Administrative tools and operational visibility",
        ],
      },
      {
        title: "Review the complete flow",
        body: "Exercise the agreed scenarios, including access failures and exceptions, then document ownership and handover.",
        items: [
          "End-to-end acceptance scenarios",
          "Failure, recovery and escalation paths",
          "Deployment, access and operating documentation",
        ],
      },
    ],
    inputs:
      "Your product model, customer and operator roles, required providers, representative data, risk requirements and the people responsible for legal and compliance decisions.",
    boundary:
      "Fortitudo can implement agreed controls and technical requirements. Regulatory interpretation, legal approval, licensing and formal compliance certification remain with your qualified advisers and accountable team.",
    services: ["software-solutions", "mcp-and-api", "ai-solutions", "websites"],
    work: ["bids", "quant-calculators", "govern"],
  },
  {
    slug: "ecommerce-and-retail",
    label: "Ecommerce and retail",
    title: "Commerce experiences connected to the operation behind every order.",
    lead:
      "We bring storefront, catalog, content and operational systems into one considered buying journey, from product discovery through fulfillment and customer care.",
    fit:
      "For retail teams launching a store, improving a Shopify business or connecting commerce with inventory, communication and internal workflows.",
    priorities: [
      {
        title: "Make the catalog understandable",
        body: "Organize products, collections and supporting information around how customers compare and choose.",
      },
      {
        title: "Connect the buying journey",
        body: "Treat storefront, cart, checkout, order communication and service as one operating flow.",
      },
      {
        title: "Give the team practical ownership",
        body: "Build within the platform and content model the team can operate after launch, with access and guidance handed over.",
      },
    ],
    steps: [
      {
        title: "Shape the customer journey",
        body: "Review the audience, catalog and current experience, then define the pages and product information needed to buy with confidence.",
        items: [
          "Storefront and catalog structure",
          "Product, collection and content requirements",
          "Mobile shopping and conversion paths",
        ],
      },
      {
        title: "Connect commerce and operations",
        body: "Configure the store and the practical systems that support payment, inventory, communication and fulfillment.",
        items: [
          "Shopify theme and store implementation",
          "Inventory, email, SMS and analytics integrations",
          "Subscriptions, quizzes or custom workflows where required",
        ],
      },
      {
        title: "Open with an operating plan",
        body: "Review the agreed purchase journeys, provider configuration and team access before handover.",
        items: [
          "Cart, checkout and order journey checks",
          "Content and storefront review across devices",
          "Team access, guidance and launch responsibilities",
        ],
      },
    ],
    inputs:
      "Your product catalog, photography, brand files, policies, store access and the people responsible for merchandising and fulfillment.",
    boundary:
      "Platform fees, apps, payment eligibility, shipping services, tax configuration and product claims depend on third parties or client approval. The proposal identifies which are included.",
    services: ["ecommerce", "websites", "brand", "mcp-and-api"],
    work: ["plat-bio-labs", "nourish-reserve", "shopper"],
  },
  {
    slug: "hospitality-and-food",
    label: "Hospitality and food",
    title: "Digital journeys that move guests from discovery to a confident visit or order.",
    lead:
      "We design websites, ordering experiences and connected workflows for restaurants, food brands and hospitality businesses where current information and a simple next step matter.",
    fit:
      "For hospitality and food teams improving discovery, reservations, ordering, locations, menus or the systems supporting guest communication.",
    priorities: [
      {
        title: "Help guests decide quickly",
        body: "Make location, hours, menu, availability and the next action easy to understand on a phone.",
      },
      {
        title: "Keep changing information manageable",
        body: "Choose a content and platform structure that lets the team update practical details without rebuilding the experience.",
      },
      {
        title: "Connect each handoff",
        body: "Clarify what happens between an enquiry, reservation or order and the people and providers responsible for fulfilling it.",
      },
    ],
    steps: [
      {
        title: "Map the guest journey",
        body: "Start with the decision a guest is making and the information, location and action needed to complete it.",
        items: [
          "Audience, location and service journeys",
          "Menu, product and availability content",
          "Reservation, ordering or enquiry requirements",
        ],
      },
      {
        title: "Build the public experience",
        body: "Create a responsive brand experience and connect the selected booking, ordering, commerce or communication tools.",
        items: [
          "Website and content implementation",
          "Booking, ordering and commerce integrations",
          "Location, email and analytics setup",
        ],
      },
      {
        title: "Check it in operating conditions",
        body: "Review the important journeys across devices and make responsibilities clear for launch and ongoing updates.",
        items: [
          "Mobile, location and action checks",
          "Provider handoff and failure paths",
          "Content ownership and launch guidance",
        ],
      },
    ],
    inputs:
      "Your locations, services or menu, photography, brand files, hours and policies, plus access to the booking, ordering or commerce providers involved.",
    boundary:
      "Availability, reservations, delivery and payment depend on the selected providers and the information maintained by your team. Provider fees and operational staffing are separate from the build.",
    services: ["websites", "ecommerce", "brand", "mcp-and-api"],
    work: ["two-cookies", "nourish-lagree", "ovia"],
  },
  {
    slug: "logistics-and-supply-chain",
    label: "Logistics and supply chain",
    title: "Operational software built around handoffs, exceptions and current information.",
    lead:
      "We connect workflows, data and internal tools so teams can see what needs attention, move information between systems and recover when the expected path breaks.",
    fit:
      "For logistics, fulfillment and supply chain teams replacing spreadsheets, repeated data entry or disconnected status updates with a defined workflow.",
    priorities: [
      {
        title: "Model the real handoffs",
        body: "Start with the trigger, owner, status and next action at each point in the operation.",
      },
      {
        title: "Design for exceptions",
        body: "Make delayed, incomplete or conflicting information visible and give the responsible person a recovery path.",
      },
      {
        title: "Respect system ownership",
        body: "Define which system owns each record and how updates, permissions and audit needs move across integrations.",
      },
    ],
    steps: [
      {
        title: "Document the operating flow",
        body: "Walk through representative jobs from trigger to completion, including the people, systems and exceptions involved.",
        items: [
          "Workflow, status and ownership map",
          "System and data inventory",
          "Exception and escalation scenarios",
        ],
      },
      {
        title: "Build the useful layer",
        body: "Create the integration, internal tool or customer view needed to make the operation easier to run.",
        items: [
          "APIs, connectors and data movement",
          "Internal dashboards and operational tools",
          "Notifications and human review points",
        ],
      },
      {
        title: "Prove the full workflow",
        body: "Test realistic successful and failed scenarios, then document how the team operates and supports the system.",
        items: [
          "End-to-end workflow checks",
          "Visibility and recovery for failures",
          "Access, monitoring and support responsibilities",
        ],
      },
    ],
    inputs:
      "Representative workflows, sample records, system owners, API documentation, access constraints and examples of the exceptions that consume the most time.",
    boundary:
      "Integration availability, provider limits and source data quality shape what can be automated. Those dependencies are verified during scoping and recorded in the proposal.",
    services: ["software-solutions", "mcp-and-api", "ai-solutions", "consultation"],
    work: ["company-os", "cadre", "clusters"],
  },
  {
    slug: "real-estate-and-proptech",
    label: "Real estate and PropTech",
    title: "Property experiences connected to the people and systems behind them.",
    lead:
      "We build public websites, lead and tour workflows, portals and internal software for property businesses that need clearer journeys and less manual work between systems.",
    fit:
      "For brokerages, operators and PropTech teams launching a product or improving listing, enquiry, qualification, scheduling and follow-up workflows.",
    priorities: [
      {
        title: "Connect discovery to action",
        body: "Help a buyer, renter or partner understand the property or service and complete the right next step.",
      },
      {
        title: "Keep records and ownership clear",
        body: "Define where listing, contact and activity information comes from and which team or system maintains it.",
      },
      {
        title: "Support people at decision points",
        body: "Use automation for preparation and routing while keeping approvals and customer commitments with the responsible person.",
      },
    ],
    steps: [
      {
        title: "Define the property journey",
        body: "Map the audience, listings or services, enquiry path and the operational follow-up expected from the team.",
        items: [
          "Buyer, renter, owner and operator journeys",
          "Listing, lead and activity data requirements",
          "Qualification, scheduling and approval points",
        ],
      },
      {
        title: "Build the connected experience",
        body: "Create the website, product or internal workflow and connect the systems needed for current information and follow-up.",
        items: [
          "Responsive website or signed-in product",
          "CRM, listing, calendar and communication integrations",
          "Lead routing, drafting and operator tools",
        ],
      },
      {
        title: "Review real scenarios",
        body: "Exercise the agreed journeys with representative records and document access, ownership and operating responsibilities.",
        items: [
          "Enquiry, scheduling and follow-up checks",
          "Permission and data visibility review",
          "Deployment, handover and support boundaries",
        ],
      },
    ],
    inputs:
      "Your audience, property or service model, representative listing and lead data, current systems, communication requirements and responsible decision-makers.",
    boundary:
      "Listing rights, fair housing requirements, brokerage rules, consumer communications and legal approvals remain with your qualified team. Data and provider access are confirmed during scoping.",
    services: ["software-solutions", "websites", "ai-solutions", "mcp-and-api"],
    work: ["chippi", "tellme", "marketer"],
  },
];

export function industry(slug: string): Industry | undefined {
  return INDUSTRIES.find((item) => item.slug === slug);
}
