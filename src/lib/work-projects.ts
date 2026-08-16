/**
 * The client projects behind /work — the ring carousel's deal AND the
 * `/work/[slug]` pages read from this one list, so the ring, the meta lockups,
 * the column and the case pages can never disagree.
 *
 * HONESTY RULES (same contract as the rest of the logged-out site):
 *  - Every project here was named by the owner, with its live domain where
 *    one exists. Nothing is a portfolio filler.
 *  - `blurb` describes what the client's own site says it is (pulled from
 *    their live meta descriptions) — never our claims about outcomes, and
 *    never a number they haven't agreed to.
 *  - `service` is which of the five offerings the engagement was, supplied as
 *    placeholders to be confirmed by the owner; they are labels from
 *    src/lib/services.ts vocabulary, not invented scope.
 *  - `art` is a typographic placeholder tile (public/work/*.webp) until the
 *    owner supplies real project imagery — the tiles carry only the name and
 *    domain, so nothing in them can be mistaken for product fact. Live-site
 *    screenshots were not possible from this environment (browser egress is
 *    blocked at the proxy); swap these files 1:1 when imagery arrives.
 *
 * Ring order matters: art is dealt straight down this list (see
 * `components/work/ring/projects.js`), so entry n sits one slot along from
 * n−1 and the column counts 01..10 as the carousel turns.
 */

export interface WorkProject {
  slug: string;
  name: string;
  /** One of the five offerings (label form). Placeholder until confirmed. */
  service: string;
  /** The live site, when there is one. */
  url?: string;
  /** Short host shown in the meta lockup and on the case page. */
  domain?: string;
  /** Where there is no domain: the line the lockup shows instead. */
  locale?: string;
  /** What the client is, in their own site's words (or the owner's). */
  blurb: string;
  /** Atlas cell / case-page art. Placeholder tiles for now. */
  art: string;
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    slug: 'chippi',
    name: 'Chippi',
    service: 'AI Solutions',
    url: 'https://usechippi.com',
    domain: 'usechippi.com',
    blurb:
      'An agentic OS for real-estate agents and brokerages — an AI agent that runs the agent workspace: qualifying leads, drafting follow-ups, scheduling tours and keeping the pipeline current.',
    art: '/work/chippi.webp',
  },
  {
    slug: 'hannah-joy',
    name: 'Hannah Joy',
    service: 'Websites',
    url: 'https://hannahjoyy.com',
    domain: 'hannahjoyy.com',
    blurb:
      'Painted by Hannah Joy — the makeup academy taught by a working artist with major brand campaigns, offering structured courses with certificates and real on-set breakdowns.',
    art: '/work/hannah-joy.webp',
  },
  {
    slug: 'stored',
    name: 'Stored',
    service: 'AI Solutions',
    url: 'https://stored.to',
    domain: 'stored.to',
    blurb:
      'Shared memory for AI agents: teach it once and every agent draws from the same context, across every tool and the whole team, over MCP or API.',
    art: '/work/stored.webp',
  },
  {
    slug: 'platinum-bio-labs',
    name: 'Platinum Bio Labs',
    service: 'Websites',
    url: 'https://platbiolabs.com',
    domain: 'platbiolabs.com',
    blurb: 'Platinum Bio Labs — a laboratory brand with its storefront on the web.',
    art: '/work/platinum-bio-labs.webp',
  },
  {
    slug: 'nourish-reserve',
    name: 'Nourish Reserve',
    service: 'Websites',
    url: 'https://shopnourishreserve.com',
    domain: 'shopnourishreserve.com',
    blurb:
      'Science-backed wellness for modern living: clinically aligned supplements made in the USA under FDA-compliant, GMP-certified standards.',
    art: '/work/nourish-reserve.webp',
  },
  {
    slug: 'never-age',
    name: 'Never Age',
    service: 'Websites',
    url: 'https://neverage.co',
    domain: 'neverage.co',
    blurb: 'NeverAge — a longevity brand, online at neverage.co.',
    art: '/work/never-age.webp',
  },
  {
    slug: 'glove',
    name: 'Glove',
    service: 'AI Solutions',
    url: 'https://glove.so',
    domain: 'glove.so',
    blurb:
      'AI agents that run live product demos: answering buyer questions, driving a safe browser through the real product, recording every session and sending tailored follow-ups.',
    art: '/work/glove.webp',
  },
  {
    slug: 'two-cookies',
    name: 'Two Cookies',
    service: 'Websites',
    locale: 'New York',
    blurb: 'A New York City cookie shop.',
    art: '/work/two-cookies.webp',
  },
  {
    slug: 'michael-berg',
    name: 'Michael Berg',
    service: 'Websites',
    blurb: 'A personal brand engagement.',
    art: '/work/michael-berg.webp',
  },
  {
    slug: 'govern',
    name: 'Govern',
    service: 'Software Solutions',
    url: 'https://govern.sh',
    domain: 'govern.sh',
    blurb:
      'Identity, permissions and audit logs for AI agents: verified identity, scoped permissions, spending limits and signed action receipts — the trust layer for autonomous software.',
    art: '/work/govern.webp',
  },
];

export const workProject = (slug: string) =>
  WORK_PROJECTS.find((p) => p.slug === slug);
