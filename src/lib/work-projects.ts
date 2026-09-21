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
];

export const workProject = (slug: string) =>
  WORK_PROJECTS.find((project) => project.slug === slug);
