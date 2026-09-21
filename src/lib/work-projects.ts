/**
 * Public case-study copy is deliberately limited to facts visible on each
 * client's own website. The project pages make no performance or outcome
 * claims that the client has not published.
 */

export interface WorkProject {
  slug: string;
  name: string;
  service: 'Websites' | 'Software Solutions' | 'AI Solutions';
  serviceLabel?: string;
  url: string;
  domain: string;
  blurb: string;
  details: readonly string[];
  /** Back-compat for the retired ring view, which still compiles with the app. */
  art: string;
  image: string;
  imageAlt: string;
  imageLabel: string;
  imageNote?: string;
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    slug: 'plat-bio-labs', name: 'Plat Bio Labs', service: 'Websites',
    serviceLabel: 'Websites + Ecommerce',
    url: 'https://platbiolabs.com/', domain: 'platbiolabs.com',
    blurb: 'An ecommerce storefront for laboratory research products, with product collections, a searchable certificate-of-analysis library and a clear purchasing journey.',
    details: ['Research product catalog and collections', 'Product and batch documentation in a COA library', 'An ecommerce experience with clear research-use information'],
    art: '/work/case-studies/plat-bio-labs.png', image: '/work/case-studies/plat-bio-labs.png',
    imageAlt: 'Chrome molecular sculpture behind optical glass from the Plat Bio Labs storefront',
    imageLabel: 'Brand imagery', imageNote: 'Editorial imagery from platbiolabs.com.',
  },
  {
    slug: 'stored',
    name: 'Stored',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.stored.to/',
    domain: 'stored.to',
    blurb:
      'A shared memory layer for AI agents, built so context can follow a team across tools instead of living in one isolated conversation.',
    details: [
      'One memory layer shared across AI agents',
      'Connects through MCP or API',
    ],
    art: '/work/case-studies/stored.png',
    image: '/work/case-studies/stored.png',
    imageAlt: 'Stored homepage showing its shared-memory product introduction',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'chippi',
    name: 'Chippi',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.usechippi.com/',
    domain: 'usechippi.com',
    blurb:
      'A real-estate inquiry workspace that reads and ranks leads, drafts responses in the agent’s voice, books tours and keeps the CRM current.',
    details: [
      'Turns real-estate inquiries into ranked leads',
      'Supports drafted follow-up and tour booking',
    ],
    art: '/work/case-studies/chippi.png',
    image: '/work/case-studies/chippi.png',
    imageAlt: 'Chippi homepage introducing its lead-to-tour workflow',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'never-age',
    name: 'NeverAge',
    service: 'Websites',
    url: 'https://neverage.co/',
    domain: 'neverage.co',
    blurb:
      'A longevity brand whose public storefront is currently marked as opening soon.',
    details: [
      'Longevity-focused brand',
      'Public storefront currently opening soon',
    ],
    art: '/work/never-age.webp',
    image: '/work/never-age.webp',
    imageAlt:
      'Typographic project artwork for NeverAge; its live storefront is currently password protected',
    imageLabel: 'Project artwork',
    imageNote:
      'The live storefront is currently password protected, so the supplied project artwork is shown instead of a homepage capture.',
  },
  {
    slug: 'two-cookies',
    name: 'Two Cookies NYC',
    service: 'Websites',
    url: 'https://twocookies.vercel.app/',
    domain: 'twocookies.vercel.app',
    blurb:
      'A New York City cookie shop with a digital storefront for discovering the cookies, the brand and ordering options.',
    details: [
      'Fresh-baked cookies',
      'Based in New York City',
    ],
    art: '/work/case-studies/two-cookies.png',
    image: '/work/case-studies/two-cookies.png',
    imageAlt:
      'Two Cookies NYC homepage with its cookie menu and ordering links',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'nourish-reserve',
    name: 'Nourish Reserve',
    service: 'Websites',
    url: 'https://www.shopnourishreserve.com/',
    domain: 'shopnourishreserve.com',
    blurb:
      'A wellness storefront bringing supplement collections, product information and a guided shopping journey into one branded experience.',
    details: [
      'Product collections and supplement information',
      'A branded ecommerce shopping journey',
    ],
    art: '/work/case-studies/nourish-reserve.png',
    image: '/work/case-studies/nourish-reserve.png',
    imageAlt: 'Nourish Reserve homepage presenting its wellness products',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'nourish-lagree',
    name: 'Nourish Lagree & Wellness',
    service: 'Websites',
    url: 'https://www.nourishandlagree.com/',
    domain: 'nourishandlagree.com',
    blurb:
      'A boutique wellness studio site bringing Lagree classes, Pilates, yoga and recovery services into one clear booking journey.',
    details: [
      'Lagree, Pilates and yoga class information',
      'Wellness services and session booking',
    ],
    art: '/work/case-studies/nourish-lagree.png',
    image: '/work/case-studies/nourish-lagree.png',
    imageAlt: 'Nourish Lagree and Wellness homepage introducing its studio and services',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'hannah-joy',
    name: 'Hannah Joy',
    service: 'Websites',
    url: 'https://www.hannahjoyy.com/',
    domain: 'hannahjoyy.com',
    blurb:
      'A makeup academy led by a working artist, with practical courses, certificates and on-set breakdowns.',
    details: [
      'Makeup education from a working artist',
      'Courses include certificates',
    ],
    art: '/work/case-studies/hannah-joy.png',
    image: '/work/case-studies/hannah-joy.png',
    imageAlt: 'Painted by Hannah Joy homepage introducing its makeup academy',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'govern',
    name: 'Govern',
    service: 'Software Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.govern.sh/',
    domain: 'govern.sh',
    blurb:
      'A trust layer for autonomous software, giving AI agents verified identities, scoped permissions, spending limits and signed action receipts.',
    details: [
      'Identity and scoped permissions for AI agents',
      'Signed action receipts and spending limits',
    ],
    art: '/work/case-studies/govern.png',
    image: '/work/case-studies/govern.png',
    imageAlt: 'Govern homepage presenting identity and permissions for AI agents',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'tellme',
    name: 'Tellme',
    service: 'Software Solutions',
    url: 'https://www.tellme.sh/',
    domain: 'tellme.sh',
    blurb:
      'An alternative to static forms that interviews people and turns their answers into a complete, structured record.',
    details: [
      'Conversational interviews instead of static forms',
      'Answers become structured records',
    ],
    art: '/work/case-studies/tellme.png',
    image: '/work/case-studies/tellme.png',
    imageAlt: 'Tellme homepage introducing its conversational form product',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'company-os',
    name: 'Company OS',
    service: 'Software Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.companyos.sh/',
    domain: 'companyos.sh',
    blurb:
      'A shared workspace for business plans, customer knowledge, processes and daily work, keeping teams and AI tools on current company context.',
    details: [
      'Shared company context for people and AI tools',
      'Plans, customer knowledge, processes and daily work in one workspace',
    ],
    art: '/work/case-studies/company-os.png',
    image: '/work/case-studies/company-os.png',
    imageAlt: 'Company OS homepage showing its shared workspace for teams and AI',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'preston-wilms',
    name: 'Preston Wilms',
    service: 'Websites',
    url: 'https://pwilms.com/',
    domain: 'pwilms.com',
    blurb:
      'A personal site bringing together Preston Wilms’s story, ventures and writing at the agentic AI frontier.',
    details: [
      'Founder story and venture portfolio',
      'Writing and work across agentic AI',
    ],
    art: '/work/case-studies/preston-wilms.png',
    image: '/work/case-studies/preston-wilms.png',
    imageAlt: 'Preston Wilms homepage introducing his work at the agentic AI frontier',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'cadre',
    name: 'Cadre',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.cadre.to/',
    domain: 'cadre.to',
    blurb:
      'An on-demand cloud workforce where teams run AI workers, choose models through OpenRouter and connect completed work to Company OS.',
    details: [
      'On-demand AI workers running in the cloud',
      'Model choice through OpenRouter and Company OS integration',
    ],
    art: '/work/case-studies/cadre.png',
    image: '/work/case-studies/cadre.png',
    imageAlt: 'Cadre homepage introducing its cloud workforce',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'marketer',
    name: 'Marketer',
    service: 'AI Solutions',
    url: 'https://www.marketer.sh/',
    domain: 'marketer.sh',
    blurb:
      'An agentic marketing platform that creates short videos, search-focused articles and ad drafts from a product brief for review and publishing.',
    details: [
      'Content, SEO and ad creation from one product brief',
      'Human review and publishing to connected channels',
    ],
    art: '/work/case-studies/marketer.png',
    image: '/work/case-studies/marketer.png',
    imageAlt: 'Marketer pricing page presenting prepaid marketing creation plans',
    imageLabel: 'Live pricing page capture',
  },
  {
    slug: 'bids',
    name: 'Bids',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.bids.sh/',
    domain: 'bids.sh',
    blurb:
      'A programmable marketplace for discovering, hiring, paying and verifying specialized AI agents.',
    details: [
      'Discovery and hiring for specialized AI agents',
      'Payments and verified work in one marketplace',
    ],
    art: '/work/case-studies/bids.png',
    image: '/work/case-studies/bids.png',
    imageAlt: 'Bids homepage presenting its marketplace for people and AI agents',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'clusters',
    name: 'Clusters',
    service: 'AI Solutions',
    url: 'https://www.clusters.to/',
    domain: 'clusters.to',
    blurb:
      'A platform-agnostic marketplace for publishing, discovering and installing skills, agents, prompts, tools and loops.',
    details: [
      'A marketplace for reusable agent capabilities',
      'Installation through npx, MCP or direct download',
    ],
    art: '/work/case-studies/clusters.png',
    image: '/work/case-studies/clusters.png',
    imageAlt: 'Clusters homepage showing its marketplace for agent skills and tools',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'swarms',
    name: 'Swarms',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.swarms.to/',
    domain: 'swarms.to',
    blurb:
      'An agent capability cloud that gives autonomous agents a paid execution layer through one API.',
    details: [
      'Paid execution for autonomous agents',
      'Agent capabilities available through one API',
    ],
    art: '/work/case-studies/swarms.png',
    image: '/work/case-studies/swarms.png',
    imageAlt: 'Swarms homepage presenting one API for agent capabilities',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'shopper',
    name: 'Shopper',
    service: 'AI Solutions',
    serviceLabel: 'Software Builds + AI Solutions',
    url: 'https://www.shopper.sh/',
    domain: 'shopper.sh',
    blurb:
      'A shopping engine for AI agents, with MCP tools for product searches, standing scans, shared lists and purchasing workflows.',
    details: [
      'Web-wide product discovery and standing scans',
      'Shared lists, memory and agent payment support',
    ],
    art: '/work/case-studies/shopper.png',
    image: '/work/case-studies/shopper.png',
    imageAlt: 'Shopper homepage introducing shopping tools for AI agents',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'quant-calculators',
    name: 'Quant Calculators',
    service: 'Software Solutions',
    url: 'https://quantcalculators.org/',
    domain: 'quantcalculators.org',
    blurb:
      'A browser-based quantitative calculator project whose public domain is currently unavailable.',
    details: [
      'Interactive quantitative calculators',
      'Public domain currently unavailable',
    ],
    art: '/work/case-studies/quant-calculators.svg',
    image: '/work/case-studies/quant-calculators.svg',
    imageAlt: 'Typographic project artwork for Quant Calculators',
    imageLabel: 'Project artwork',
    imageNote:
      'The public domain was unavailable when this case study was refreshed, so project artwork is shown instead of a live-site capture.',
  },
  {
    slug: 'convertfilez',
    name: 'ConvertFilez',
    service: 'Software Solutions',
    url: 'https://www.convertfilez.org/',
    domain: 'convertfilez.org',
    blurb:
      'A library of more than 250 browser-based tools for converting images, PDFs, code, data and media without uploading files.',
    details: [
      'More than 250 browser-based conversion tools',
      'No uploads, signup or file-size limits',
    ],
    art: '/work/case-studies/convertfilez.png',
    image: '/work/case-studies/convertfilez.png',
    imageAlt: 'ConvertFilez homepage introducing its browser-based file conversion tools',
    imageLabel: 'Live homepage capture',
  },
  {
    slug: 'ovia',
    name: 'Ovia',
    service: 'Websites',
    serviceLabel: 'Websites + Ecommerce',
    url: 'https://oviayoga.com/',
    domain: 'oviayoga.com',
    blurb:
      'A performance apparel storefront built around technical comfort for studio practice, training, running and everyday movement.',
    details: [
      'Women’s, men’s and accessory collections',
      'Shopping by activity, including studio, training and running',
    ],
    art: '/work/case-studies/ovia.png',
    image: '/work/case-studies/ovia.png',
    imageAlt: 'Ovia homepage presenting technical apparel for movement and everyday wear',
    imageLabel: 'Live homepage capture',
  },
];

export const workProject = (slug: string) =>
  WORK_PROJECTS.find((project) => project.slug === slug);
