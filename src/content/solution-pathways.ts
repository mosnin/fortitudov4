export const SOLUTIONS = [
  {
    slug: "launch-a-product",
    label: "Launch a product",
    title: "From an idea to a product people can use.",
    lead: "Bring the problem you want to solve. We define the first release, design the experience and build the website, application and tools behind it.",
    fit: "For founders and teams commissioning a new software product.",
    services: ["software-solutions", "websites", "brand"],
    steps: [
      {
        title: "Define the first release",
        body: "Agree the audience, core journey and boundaries before the build. Separate what the first version needs from what can follow.",
        items: [
          "User journeys and page inventory",
          "Feature priorities and dependencies",
          "Written scope and review milestones",
        ],
      },
      {
        title: "Build the complete experience",
        body: "Connect the public website, signed-in product and administration tools around the same purpose.",
        items: [
          "Responsive interface and brand implementation",
          "Accounts, onboarding and core workflows",
          "Backend, integrations and owner tools",
        ],
      },
      {
        title: "Launch with a clear handover",
        body: "Review the agreed journeys, deploy the product and put the access and documentation in your team's hands.",
        items: [
          "Agreed acceptance checks",
          "Deployment and account access",
          "Repository and operational documentation",
        ],
      },
    ],
    inputs:
      "A description of the problem, the people you expect to use the product, existing research and any launch constraints.",
    boundary:
      "The proposal defines the first release. Third-party services, data licensing and ongoing support are identified separately.",
  },
  {
    slug: "improve-your-website",
    label: "Improve your website",
    title: "Make the website match the business.",
    lead: "A clearer story, better presentation and a more useful path to enquiry. We can repair a sound foundation or scope a complete rebuild.",
    fit: "For businesses whose current website feels dated, confusing or unfinished.",
    services: ["websites", "unslop", "brand"],
    steps: [
      {
        title: "Find what is getting in the way",
        body: "Review the existing pages and the journeys that matter. Decide what to keep, what to repair and what needs a different approach.",
        items: [
          "Content and navigation review",
          "Responsive and interaction review",
          "Repair or rebuild recommendation",
        ],
      },
      {
        title: "Make the story clear",
        body: "Give each page a job. Explain the offer, present relevant work and help visitors choose a useful next step.",
        items: [
          "Page structure and concise copy",
          "Brand and visual consistency",
          "Forms, booking and enquiry paths",
        ],
      },
      {
        title: "Put the improved site to work",
        body: "Build and review the agreed pages, connect the required tools and prepare the site for your team to maintain.",
        items: [
          "Responsive implementation",
          "Technical SEO foundations",
          "Launch checks and handover",
        ],
      },
    ],
    inputs:
      "Your current URL, brand files, content access and the parts of the experience you want to change.",
    boundary:
      "A redesign does not guarantee traffic or sales. Analytics, content production and ongoing marketing are scoped when required.",
  },
  {
    slug: "sell-online",
    label: "Sell online",
    title: "A store built around the way people buy.",
    lead: "Bring your brand, products and operations together in a considered ecommerce experience. From the first product page to the systems behind each order.",
    fit: "For brands launching a store or improving an existing Shopify business.",
    services: ["ecommerce", "brand", "mcp-and-api"],
    steps: [
      {
        title: "Organize the buying journey",
        body: "Make the catalog understandable and the product information useful. Shape the store around your brand and customers.",
        items: [
          "Collections and product structure",
          "Storefront and product-page design",
          "Brand, labels and content as scoped",
        ],
      },
      {
        title: "Connect commerce and operations",
        body: "Configure the practical pieces that support purchasing, communication and fulfillment.",
        items: [
          "Products, inventory and domain setup",
          "Email, SMS and tracking integrations",
          "Subscriptions, upsells or quizzes where needed",
        ],
      },
      {
        title: "Review before opening",
        body: "Check the agreed shopping journeys and integrations, then hand over the store and its operating guidance.",
        items: [
          "Cart and checkout journey review",
          "Mobile and storefront checks",
          "Team access and launch documentation",
        ],
      },
    ],
    inputs:
      "Your catalog, product photography, brand materials, policies and access to the store and required services.",
    boundary:
      "App subscriptions, platform fees and provider eligibility are separate. Legal policies and product claims require your supplied or approved content.",
  },
  {
    slug: "connect-operations",
    label: "Connect operations",
    title: "Less work between the tools you use.",
    lead: "Connect the systems behind your business so information moves through a defined workflow, with clear handling when something fails.",
    fit: "For teams repeating manual steps across forms, inboxes, CRMs and internal systems.",
    services: ["mcp-and-api", "software-solutions", "consultation"],
    steps: [
      {
        title: "Map the work as it happens",
        body: "Start with the trigger, the data and the person responsible for the next action.",
        items: [
          "Current workflow and repeated steps",
          "System access and API review",
          "Success, exception and recovery paths",
        ],
      },
      {
        title: "Connect the right pieces",
        body: "Build the integration or internal tool the workflow needs. Keep permissions and data ownership explicit.",
        items: [
          "APIs and custom connectors",
          "Internal tools and workflow automation",
          "Human review where decisions require it",
        ],
      },
      {
        title: "Test the whole journey",
        body: "Review the flow with realistic inputs and make its operation understandable to the people maintaining it.",
        items: [
          "End-to-end workflow checks",
          "Error visibility and recovery guidance",
          "Ownership and support boundaries",
        ],
      },
    ],
    inputs:
      "An example of the workflow, the tools involved, available API documentation and a person who can approve access.",
    boundary:
      "Provider permissions, API limits and data quality shape the implementation. Integration availability is verified during scoping.",
  },
  {
    slug: "apply-ai",
    label: "Apply AI",
    title: "Start with the work. Then choose the AI.",
    lead: "Agents, shared context and connected tools, designed around a defined business task. Build something your team can inspect, use and take over.",
    fit: "For teams with a specific workflow or product capability to improve using AI.",
    services: [
      "ai-solutions",
      "context-and-memory",
      "agent-infrastructure",
      "mcp-and-api",
    ],
    steps: [
      {
        title: "Choose a useful task",
        body: "Define the inputs, expected output and point where a person needs to review the result.",
        items: [
          "Task and acceptance criteria",
          "Data and permission boundaries",
          "Model and provider selection",
        ],
      },
      {
        title: "Give it context and tools",
        body: "Connect the information and capabilities the task actually needs, with scoped access.",
        items: [
          "Context retrieval and shared memory",
          "Custom tools, MCP and APIs",
          "Agent workflows and orchestration",
        ],
      },
      {
        title: "Evaluate it in use",
        body: "Test agreed scenarios and make the system's behavior visible before putting it into the team's workflow.",
        items: [
          "Evaluation scenarios and failure cases",
          "Human approval and recovery paths",
          "Deployment, documentation and handover",
        ],
      },
    ],
    inputs:
      "A real task, representative examples, permitted data sources and the team's review requirements.",
    boundary:
      "AI output needs evaluation. Model usage, provider access, data permissions and optional monitoring are agreed in the proposal.",
  },
];
