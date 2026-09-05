import type { ServiceType } from "@/lib/services";
import type { FaqItem } from "@/components/shader/lib/faq-data";

export type ServiceSlug =
  | "websites"
  | "software-solutions"
  | "ai-solutions"
  | "consultation"
  | "digital-marketing";

export interface ServicePage {
  slug: ServiceSlug;
  serviceId: ServiceType;
  name: string;
  description: string;
  title: string;
  lead: string;
  directoryLead: string;
  image: string;
  imageAlt: string;
  artworkVariant: "software" | "ai" | "creative" | "strategy" | "websites";
  delivery: { image: string; title: string; body: string };
  narrative: { eyebrow: string; title: string; body: string; costOfWaiting: string };
  outcomesHeading: string;
  outcomesLead: string;
  outcomes: readonly { tag: string; title: string; body: string }[];
  scope: { title: string; body: string; deliverables: readonly string[] };
  approach: { title: string; body: string; steps: readonly string[] };
  proof: { title: string; body: string; slugs: readonly string[] };
  faq: FaqItem[];
}

export const SERVICE_PAGES: readonly ServicePage[] = [
  {
    slug: "websites",
    serviceId: "websites",
    name: "Websites",
    description: "Websites and online stores that help people understand your business, trust what you offer, and take the next step.",
    title: "Give people a reason to choose you.",
    lead: "Your product deserves more than a place to sit online. We build websites and stores that make it easy to understand what you sell, feel good about choosing it, and buy.",
    directoryLead: "Turn a good first impression into an enquiry, a booking, or a sale.",
    image: "/brand-stories/creative-presence.webp",
    imageAlt: "Original Fortitudo editorial: a fisheye camera portrait with yellow digital folders, connecting a business's visual identity to its online presence.",
    artworkVariant: "websites",
    delivery: {
      image: "/brand-stories/storefront-to-sale.webp",
      title: "A brand people can actually shop.",
      body: "The campaign earns attention. The store carries that same identity into product discovery and checkout. This fictional LUMA concept shows the connection; your build is shaped around your own products and customers.",
    },
    narrative: {
      eyebrow: "Your business, brought to life",
      title: "You have worked hard on the business. Your website should show it.",
      body: "When the product is good but the website is hard to use, customers have to fill in the gaps. We connect your story, your offer, and the next step in a site that feels like you and works beautifully on a phone.",
      costOfWaiting: "Every campaign, referral, and search sends people somewhere. If that experience is confusing, the attention you earned can end without a conversation.",
    },
    outcomesHeading: "Make the next step feel obvious.",
    outcomesLead: "A useful website answers the questions that stand between a visitor and becoming your customer.",
    outcomes: [
      { tag: "01 — Be understood", title: "Show why your business matters.", body: "Clear words, considered imagery, and a page structure that helps people see what you offer and why it is right for them." },
      { tag: "02 — Make it easy", title: "Take the friction out of buying.", body: "Product discovery, enquiries, bookings, and checkout built around the person using them. The important details work on small screens, too." },
      { tag: "03 — Keep growing", title: "Own a site you can keep improving.", body: "Manage your content, see where visitors go, and make informed changes. Your team gets the tools and handover it needs to keep the site useful." },
    ],
    scope: {
      title: "A website built around the way you sell.",
      body: "We agree on the pages, content, and functionality your business needs. A brand website and a complex store need different scopes; you see yours before work begins.",
      deliverables: ["Customer journey and page planning", "Responsive design and development", "Content structure and on-page search foundations", "Store, booking, or enquiry integrations as agreed", "Analytics setup, testing, and launch", "Content access and a complete handover"],
    },
    approach: {
      title: "A clear route from brief to live site.",
      body: "We work through the offer and the customer journey first, then bring the design and build together. You review the work while it is taking shape.",
      steps: ["Agree on the audience, offer, and next step", "Review the design before development moves ahead", "Test real journeys on desktop and mobile", "Launch with your team ready to run it"],
    },
    proof: { title: "Businesses with something worth showing.", body: "Explore our published website work for a wellness storefront and a makeup education business.", slugs: ["nourish-reserve", "hannah-joy"] },
    faq: [
      { q: "Can you improve the website we already have?", a: "Yes. We look at the current site, the platform, and what you need to change. If focused improvements will solve the problem, we scope those. If a rebuild makes more sense, we explain why before you decide." },
      { q: "Can you help with an online store?", a: "Yes. We can scope product pages, collections, checkout, and the tools that support the store. We work through your catalog, shipping, payments, and existing systems before choosing the approach." },
      { q: "Do we need all the copy and imagery ready?", a: "You do not need a finished content package to start the conversation. We identify what already exists and what needs to be created, then make content responsibilities and costs clear in the scope." },
      { q: "Will our team be able to update it?", a: "We agree on what your team needs to manage, build around that, and include a handover. You own the finished work and receive the access needed to run it." },
    ],
  },
  {
    slug: "software-solutions",
    serviceId: "software_solutions",
    name: "Software Solutions",
    description: "Custom software, customer portals, and internal tools built around your business, with a clear scope and experienced engineering.",
    title: "Build the way your business should work.",
    lead: "Give your customers a better experience and your team a system they can rely on. We turn the workarounds, spreadsheets, and product ideas into software built for the job.",
    directoryLead: "Replace daily workarounds with an app, portal, or platform that fits.",
    image: "/brand-stories/too-many-tools.webp",
    imageAlt: "Original Fortitudo editorial: an operator dwarfed by a wall of yellow-and-black campaign screens, illustrating the work of managing disconnected tools.",
    artworkVariant: "software",
    delivery: {
      image: "/brand-stories/connected-workspace.webp",
      title: "The project, its files, and its people. Together.",
      body: "A customer portal or internal workspace brings the next action into one place. This fictional ORBIT concept makes the handoff visible: scattered files become organized work with a clear owner.",
    },
    narrative: {
      eyebrow: "From workaround to working product",
      title: "Your team should not have to hold the system together.",
      body: "The spreadsheet has become a database. Customers keep asking for updates. The same information gets entered in different places. We build software around the people using it, with the connections and details that make the whole workflow work.",
      costOfWaiting: "As the business grows, the handoffs grow with it. More people chasing answers means less time doing the work customers are paying for.",
    },
    outcomesHeading: "Make the everyday work run better.",
    outcomesLead: "The right software puts the next action, the right information, and the right person in the same place.",
    outcomes: [
      { tag: "01 — One clear workflow", title: "Bring the moving parts together.", body: "Give your team a dependable way to see what is happening, who owns the next step, and what needs their attention." },
      { tag: "02 — A better experience", title: "Make it easy to work with you.", body: "Customer portals and product experiences that let people complete the job, find an answer, and move forward without chasing your team." },
      { tag: "03 — Room to grow", title: "Build a foundation you can extend.", body: "Thoughtful data structures, access rules, integrations, and documentation make the next improvement easier to plan and deliver." },
    ],
    scope: {
      title: "The product your workflow calls for.",
      body: "An internal tool, a customer portal, or a software product each brings different requirements. We define the users, key journeys, and technical boundaries before quoting the build.",
      deliverables: ["Workflow mapping and product requirements", "User experience and interface design", "Application and database development", "Authentication and role-based access as scoped", "Integrations, testing, and deployment", "Code, documentation, and team handover"],
    },
    approach: {
      title: "Resolve the difficult decisions early.",
      body: "With 10+ years of experience and hundreds of complex builds behind us, we know that the details between the screens matter as much as the screens themselves.",
      steps: ["Map the people, data, and decisions involved", "Prioritize the workflows the first release needs", "Review working software throughout the build", "Test the real journey and plan the handover"],
    },
    proof: { title: "Software with a job to do.", body: "Explore our published work on agent permissions and conversational information collection.", slugs: ["govern", "tellme"] },
    faq: [
      { q: "Can you take over an existing application?", a: "We can review the code, infrastructure, and current problems before recommending a plan. The first step is understanding what is safe to build on and what needs attention." },
      { q: "Can it work with the tools we already use?", a: "Where your tools provide a suitable integration, yes. We review their APIs, permissions, and data requirements during scoping so the integration work is understood before development." },
      { q: "How do we avoid building too much at once?", a: "We agree on the smallest release that does a useful job for your business. Additional ideas go into a clear list of later priorities rather than quietly expanding the first build." },
      { q: "Who owns the code?", a: "You own the project code and receive the agreed assets, documentation, and access at handover. We also make any third-party tools, licenses, and ongoing running costs clear." },
    ],
  },
  {
    slug: "ai-solutions",
    serviceId: "ai_solutions",
    name: "AI Solutions",
    description: "Practical AI tools and automations that handle repetitive work, connect to your business systems, and keep people in control.",
    title: "Give your people their time back.",
    lead: "The copying, sorting, chasing, and rewriting adds up. We find the repetitive work AI can handle, connect it to your business, and keep your team in charge of the decisions that matter.",
    directoryLead: "Make the repetitive work lighter, with useful AI and clear human control.",
    image: "/brand-stories/customer-conversations.webp",
    imageAlt: "Original Fortitudo editorial: a headset-wearing woman beside a giant yellow phone showing a fictional RELAY communication campaign.",
    artworkVariant: "ai",
    delivery: {
      image: "/brand-stories/enquiry-to-booking.webp",
      title: "From an incoming enquiry to a reviewed next step.",
      body: "An AI workflow can organize an enquiry and prepare the next action. Your team checks it before anything important happens. The inbox, review button, and calendar illustrate that sequence—not an unattended promise to handle every customer.",
    },
    narrative: {
      eyebrow: "A useful job for AI",
      title: "Start with the work you wish your team did less of.",
      body: "Reading every enquiry. Moving information between tools. Finding an answer buried in documents. We start with a real workflow and decide where AI is useful, where ordinary automation is enough, and where a person needs to make the call.",
      costOfWaiting: "A repetitive task keeps taking time every time someone does it. Finding the right place to start can free your team to focus on customers and the work that needs their judgment.",
    },
    outcomesHeading: "Make AI useful in the everyday.",
    outcomesLead: "A working solution needs more than a convincing reply. It needs the right information, clear limits, and a place in your existing process.",
    outcomes: [
      { tag: "01 — Less repetition", title: "Let the routine work move itself.", body: "Sort requests, prepare drafts, extract information, and connect repeat steps so your team spends less time moving the same work along." },
      { tag: "02 — Better context", title: "Put useful answers within reach.", body: "Bring the right business information into the workflow, so people can find what they need without digging through disconnected tools." },
      { tag: "03 — People in control", title: "Know when a person needs to step in.", body: "Build in review, permissions, and a clear fallback. Your team can check important outputs and make the decisions that should stay with them." },
    ],
    scope: {
      title: "AI shaped around a real workflow.",
      body: "We agree on the task, the information it can use, and the actions it can take. The scope reflects the integrations, review steps, and reliability the job needs.",
      deliverables: ["Workflow review and opportunity selection", "Data sources and integration planning", "AI assistants or automation as agreed", "Human review and permission boundaries", "Evaluation with representative business tasks", "Launch, monitoring plan, and handover"],
    },
    approach: {
      title: "Prove the useful part before widening it.",
      body: "We work through actual examples, including the awkward ones, so you can see what the system handles and where it needs help before it becomes part of daily work.",
      steps: ["Choose a repeat task with a clear useful outcome", "Agree on the data and the limits", "Review outputs against real examples", "Roll out with clear oversight and fallback steps"],
    },
    proof: { title: "AI built into working products.", body: "Explore our published work on shared agent memory and a real-estate enquiry workflow.", slugs: ["stored", "chippi"] },
    faq: [
      { q: "How do we know whether AI is the right answer?", a: "We start by looking at the task, its volume, and the cost of getting it wrong. Some work suits AI, some needs a simple integration, and some should stay with a person. The recommendation comes from that review." },
      { q: "Will it replace our existing tools?", a: "It does not have to. We can often connect a workflow to the tools your team already uses. We confirm what those platforms support before agreeing on the build." },
      { q: "What happens when the AI gets something wrong?", a: "We plan for that. Depending on the task, the solution can include review steps, restricted actions, clear escalation, and a fallback to your team. We test the important edge cases as part of the agreed scope." },
      { q: "What about our business data?", a: "We agree on which information the system needs, who can access it, and which services process it. Those decisions happen during planning, before your data becomes part of the workflow." },
    ],
  },
  {
    slug: "consultation",
    serviceId: "consultation",
    name: "Consultation",
    description: "An experienced second opinion on your technology, product, or build plans, with practical priorities and a written way forward.",
    title: "Make the next big decision with a clear head.",
    lead: "Before you commit to a platform, a rebuild, or a new product, get an experienced view of the options. We help you decide what is worth doing, what comes first, and what can wait.",
    directoryLead: "Get a practical plan before a big technology decision or investment.",
    image: "/brand-stories/next-chapter.webp",
    imageAlt: "Original Fortitudo editorial: a woman working among floating yellow desktop folders, illustrating the choice of what to build next.",
    artworkVariant: "strategy",
    delivery: {
      image: "/brand-stories/idea-to-roadmap.webp",
      title: "A plan that says what happens now, next, and later.",
      body: "The output is something your team can use: priorities, dependencies, and a written recommendation. This roadmap concept shows how we turn a pile of possible projects into an order of work you can make decisions around.",
    },
    narrative: {
      eyebrow: "Clarity before commitment",
      title: "Too many options can keep a good business standing still.",
      body: "You have had the demos, heard the promises, and collected the opinions. What you need now is someone who understands the business and the technical work well enough to explain the tradeoffs and recommend a practical route.",
      costOfWaiting: "An unresolved decision can hold up a launch or keep a broken process in place. A rushed one can commit the business to work it does not need. A focused review helps you move with a reason.",
    },
    outcomesHeading: "Leave with something you can act on.",
    outcomesLead: "Our advice comes from 10+ years of experience and hundreds of complex builds, with the detail your next decision deserves.",
    outcomes: [
      { tag: "01 — Understand it", title: "Get a clear view of where you are.", body: "Review the tools, product, or process you have today. Understand what is working, what is getting in the way, and what deserves closer attention." },
      { tag: "02 — Weigh it up", title: "See the tradeoffs before you commit.", body: "Compare realistic options in plain language, including the effort, dependencies, and ongoing responsibilities that come with each." },
      { tag: "03 — Move forward", title: "Know what to do next.", body: "Leave with written priorities and a plan you can use with your own team, with Fortitudo, or with another partner." },
    ],
    scope: {
      title: "A focused review of the decision in front of you.",
      body: "We agree on the questions to answer and the information needed before the engagement begins. The output is a practical recommendation, not an open-ended meeting series.",
      deliverables: ["Business goals and constraints review", "Existing product, tools, or workflow assessment", "Options and tradeoffs explained clearly", "Technology or AI opportunity recommendations", "Prioritized next steps and dependencies", "A written plan your team keeps"],
    },
    approach: {
      title: "Bring the problem. We will help you untangle it.",
      body: "You do not need a polished technical brief. A decision you are facing, the information you have, and an honest view of the business are a useful starting point.",
      steps: ["Agree on the decision the review needs to support", "Look at the evidence and ask the missing questions", "Discuss the options with the people involved", "Document a recommendation and practical next steps"],
    },
    proof: { title: "Advice informed by the work itself.", body: "These published software builds show the kinds of product and engineering work behind our recommendations.", slugs: ["govern", "tellme"] },
    faq: [
      { q: "Do we have to hire you for the build afterward?", a: "No. The written plan is yours. You can act on it with your existing team, ask us to quote the work, or take it to another partner." },
      { q: "Can you review another team’s proposal?", a: "Yes. We can assess the scope, technical approach, assumptions, and open questions. We focus on helping you understand the proposal and make an informed decision." },
      { q: "Is this useful if we are not technical?", a: "Yes. We explain the choices in terms of what they mean for your business, including cost, effort, risk, and who needs to do what next." },
      { q: "What should we bring to the conversation?", a: "Bring the problem or decision, any relevant links or documents, and the constraints you already know. We will tell you what else we need after understanding the brief." },
    ],
  },
  {
    slug: "digital-marketing",
    serviceId: "digital_marketing",
    name: "Digital Marketing",
    description: "Connected campaigns, landing pages, and follow-up that help turn attention into a clear next step for your customers.",
    title: "Give attention somewhere worth going.",
    lead: "The ad earns a click. The page makes the case. The follow-up keeps the conversation moving. We bring them together around what you sell and the customers you want to reach.",
    directoryLead: "Connect the campaign, the page, and the follow-up into one customer journey.",
    image: "/brand-stories/creative-presence.webp",
    imageAlt: "Original Fortitudo editorial: an expressive creator photographed from above with a camera, illustrating distinctive creative work that earns attention.",
    artworkVariant: "creative",
    delivery: {
      image: "/brand-stories/campaign-in-the-world.webp",
      title: "One campaign. Recognizable wherever it appears.",
      body: "The same fictional LUMA identity carries across mobile, print, and an outdoor placement here. For your engagement, we select the relevant channels, create the agreed assets, and connect the campaign to a landing page and a way to measure response.",
    },
    narrative: {
      eyebrow: "From first impression to next step",
      title: "Good attention is expensive to waste.",
      body: "A strong ad cannot explain a confusing offer or rescue a difficult landing page. We look at the whole journey: who you are trying to reach, what makes them care, and what happens after they respond.",
      costOfWaiting: "When the message, page, and follow-up do not connect, you can keep paying to send people into the same dead end. Improving the journey gives the attention you already earn a better chance to turn into business.",
    },
    outcomesHeading: "Make every part of the journey do its job.",
    outcomesLead: "The goal is a useful customer action: an enquiry, a booking, or a purchase. We work backward from there.",
    outcomes: [
      { tag: "01 — Make it relevant", title: "Give the right people a reason to care.", body: "Shape the message and creative around the audience, their problem, and the value of your offer. Make the first impression feel connected to the business." },
      { tag: "02 — Follow it through", title: "Carry the conversation past the click.", body: "Build landing pages and follow-up that answer the next question, handle the hesitation, and make the next step easy to take." },
      { tag: "03 — Learn and improve", title: "See what deserves more attention.", body: "Agree on meaningful measurements, review how the journey performs, and use what you learn to choose the next improvement." },
    ],
    scope: {
      title: "A connected plan for the offer you are selling.",
      body: "We agree on the channels, creative, pages, and follow-up your campaign needs. Any media spend and ongoing platform costs are discussed separately from the project scope.",
      deliverables: ["Audience, offer, and customer journey planning", "Campaign message and creative direction", "Landing page design and development as agreed", "Email or other agreed follow-up flows", "Measurement and reporting setup", "Testing and improvement priorities"],
    },
    approach: {
      title: "Start with the customer. Keep learning from the response.",
      body: "We bring the creative and technical work together, so the promise people see in a campaign carries through to the experience they land on.",
      steps: ["Agree on the audience, offer, and intended action", "Build the campaign and destination together", "Check the tracking and follow-up before launch", "Review the response and prioritize improvements"],
    },
    proof: { title: "The experience after the first impression.", body: "Explore the storefront and education website work our team has built for consumer businesses.", slugs: ["nourish-reserve", "hannah-joy"] },
    faq: [
      { q: "Do you guarantee a particular number of leads or sales?", a: "No. Results depend on the offer, the market, the audience, and other parts of the business. We agree on the work, the measurements, and how we will review and improve it without promising a result we cannot control." },
      { q: "Can you work with our existing website or campaigns?", a: "Yes. We review what you have, identify where the customer journey is breaking down, and recommend the changes worth making first." },
      { q: "Is advertising spend included in the quote?", a: "We make that distinction clear in the proposal. The agreed project or ongoing scope covers our work; media spend and third-party platform costs are identified separately." },
      { q: "Can you help with the page as well as the creative?", a: "Yes. We can bring the message, creative direction, landing page, and follow-up into the same scope, so the experience feels connected from first impression onward." },
    ],
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((service) => service.slug === slug);
}

export function getServicePageById(id: ServiceType): ServicePage | undefined {
  return SERVICE_PAGES.find((service) => service.serviceId === id);
}

export const SERVICE_PAGE_HREFS: Record<ServiceType, `/services/${ServiceSlug}`> = {
  websites: "/services/websites",
  software_solutions: "/services/software-solutions",
  ai_solutions: "/services/ai-solutions",
  consultation: "/services/consultation",
  digital_marketing: "/services/digital-marketing",
};
