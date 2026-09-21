# Fortitudo website design

Revision: 21 September 2026. Mode: product refinement and full public website replacement. Design authority: the user's purchased Imageworks theme, not the former yellow marketing site.

## Sources and boundaries

- Purchased source: `/Users/preston/Downloads/imageworks.zip`; untouched extracted reference: `../fortitudo-theme-reference/imageworks`.
- Brand: Fortitudo name and ribbon-globe identity. Preserve the established user overrides: upright Geist Sans and dark default. Imageworks owns all other visual decisions.
- Content: Notion **Fortitudo — Offer Library**, edited 21 September 2026, plus its 14 complete offer documents. Snapshot: `docs/imageworks/notion-offers-2026-09-21.json`. These are owner-specified offers, not independently proven customer results.
- Deployment: Vercel `mosnins-projects/fortitudov4`, project `prj_SP1Ar0bDBfyj7o9F4I0dBrmitGar`; GitHub `mosnin/fortitudov4`, production branch `main`.
- The public website is replaced. Authenticated client, partner and admin systems, data, billing and their permissions are separate operational surfaces, not disposable theme content.
- A complete pre-change file checkpoint exists outside the repository in `../fortitudo-checkpoints/`. It is not shipped.
- The user's specific instruction to preserve the paid theme overrides Component OS substitutions, generic menu recipes, mandatory logo walls and new graphic generation. No alternate design system may replace Imageworks components.

## Product architecture and UX

The visitor needs to understand what Fortitudo can build, choose a relevant engagement, understand deliverables and ownership, and send a project brief. Existing clients can reach sign-in directly.

| Surface | Purpose | Primary next step |
| --- | --- | --- |
| `/` | Imageworks visual introduction and overview | Explore services or discuss a project |
| `/services` | Full offer directory | Select a service |
| `/services/[slug]` | Outcome, deliverables, scope, process, review, handover | Service-specific enquiry |
| `/resources` and `/resources/[slug]` | Read and download complete service pitches | Download or discuss the offer |
| `/work` and `/work/[slug]` | Inspect real published projects | Open the actual product or enquire |
| `/about` | Understand the agency's working approach | Discuss a project |
| `/pricing` | Explain project quotes, consultation and optional support | Request a scoped quote |
| `/faq` | Resolve practical buying questions | Contact |
| `/contact` | Collect the brief, preserve selected service | Submit or use direct email fallback |
| `/privacy`, `/terms` | Existing business policies in the new shell | Return to the site |

Services cover websites, ecommerce, complete software, brand, Unslop, consultation, custom agents, agent teams, harnesses, Jev, context/memory, MCP/APIs, creative workflows and AI setup. Consultation crosses all offers. Provider access is scoped; no universal availability, fabricated pricing, invented endorsements or performance figures.

Journey: home → service directory → detail → pitch or enquiry → acknowledged submission. Alternate entry: resource → service → enquiry. Recovery: browser Back, clear navigation, retained enquiry fields, actionable error and direct email. Auth retains safe return destinations.

## Frozen visual plan before implementation

### Hierarchy

Home: the concise Fortitudo headline first, the original animated photography arc second, the supporting sentence and primary action third. Keep navigation quiet. Subsequent sections alternate deliberate immersive image sequences with readable explanations. Service pages lead with the outcome, then the engagement and deliverables, then detailed scope. Do not turn the homepage into a dense offer table.

### Composition

Restore the Imageworks order: Hero, Brief, Variations, capability content in the Benchmarks slot, Formats, service selector using the Testimonials composition, Pricing, FAQ, Final CTA, Footer. Keep original section widths, scroll distances, aspect ratios, spacing, sticky scenes, image arc/helix and footer reveal. Adapt template data to agency services. Benchmark performance graphs and invented testimonials cannot become Fortitudo claims; their positions receive truthful service content using the theme's section and surface primitives.

Navigation retains Imageworks' floating, condensing desktop shell and full mobile disclosure. Links are Services, Work, Resources, About, Pricing, sign-in and Contact. No new mega-menu is imposed on the purchased design. All 14 services remain reachable from the directory, footer and related content.

### Material and color

Use the original theme tokens. Dark: background `#0a0a0a`, foreground `#fafafa`, muted `#171717`, border `#262626`, muted text `#a3a3a3`. Light: background `#ffffff`, foreground `#0a0a0a`, muted `#f5f5f5`, border `#e5e5e5`, muted text `#737373`. Preserve the template navigation blur, shadows and spectrum accent only in their original roles. Scope marketing tokens to `[data-imageworks-site]`. Remove the old racing-yellow website composition.

### Details

Geist Sans, upright throughout (existing owner override). Preserve original optical sizes: hero 40/56/68px by breakpoint, leading 1.02, tracking -.02em; section headings clamp 32–56px; body 15–16px with 24–28px leading. Content max width 1440px; horizontal inset 16px mobile / 24px larger. Original rounded-xl controls and rounded-2xl imagery remain. Preserve functional arrows, theme toggle, focus rings and active navigation; no added badge-icon grid.

Restore original theme photography and crops in the arc, brief, variations, formats and helix. Those images express the purchased visual direction, not client proof. Project screenshots belong only on actual work surfaces. Image alt text describes the actual image, without fictional brand attribution.

### Responsive and motion

Preserve original `sm`, `md`, `lg` behavior and `--u` arc sizing. Mobile navigation owns its open state, Escape dismissal, focus return and scroll lock. Formats retain the intentional horizontal strip with visible content continuation. Long service text stacks in reading order. Check at 390px, 768px and 1440px, with a 320px reflow check.

Preserve the original intro, spring, scroll-reveal, brief expansion, variations convergence, image helix and footer behavior. Reduced motion uses the theme's static alternatives. Hero copy must still appear if the image arc fails. No new animation language is introduced. Hover cannot be required for navigation or content.

## Comparison and review

Baseline observed live: yellow shader hero, oversized left-aligned headline and old marketing sections. Local intermediate: paid arc retained but its photos replaced with repeated product screenshots, several original storytelling sections omitted. Selected: source theme with Fortitudo branding and complete offer content. The source-based version follows the explicit purchased-theme requirement; the tradeoff is preserving long cinematic scroll sections rather than maximizing content density.

Self-review only. Design OS governs composition and UX; Frontend OS governs routing, behavior and engineering; Details reviews final type, alignment, image crops and interaction states. No numerical beauty score or representative-user validation is asserted. Company OS/Symbolic provider context is not retrieved in this run; Notion and direct owner requirements ground the content.

## Acceptance inventory

Review hero/nav, brief, variations, capabilities, formats, service tabs, pricing, FAQ, final CTA and footer; then service directory and every detail variant, resources/downloads, work, about, contact, legal and sign-in navigation. Capture desktop/mobile, expanded menus, focus states and reduced motion. Check HTTP routes, links, assets, typecheck, build and relevant regression tests. Any missing checks remain explicit in the final receipt.

Stages 0–12: direction and scope resolved from source theme and owner content; audience assumptions not user-research verified. Stages 13–17: accessibility, trust, runtime resilience, implementation fidelity and final refinement require current execution evidence, recorded in the restoration receipt. No skill checklist alone grants release acceptance.


## Founder and glass brand extension — 21 September 2026

Owner-supplied art direction adds a smoked-glass rendition of the existing circular wave mark to the footer without replacing the purchased footer composition. About uses the supplied hand/glass-card composition with the Fortitudo mark, followed by an editorial founder section with Preston Wilms’s original portrait clipped to a square, fully circular frame. LinkedIn opens in a new tab with an accessible announcement. Biography claims (over a decade, nearly one billion impressions, dozens of projects and brands) are supplied directly by Preston; agency scope is grounded in the current Notion Offer Library. Preserve Imageworks typography, spacing, dark default, rounded imagery and responsive stacking.


## Service pathways and journal — 21 September 2026

Six primary pathways: Software, Ecommerce, Websites, AI agents, Other tech solutions, Consultation. Preserve the existing 14 detailed offers; the technology overview routes visitors to relevant specialist implementations. Use the existing Imageworks headings, rounded imagery, neutral tokens, page widths and motion. The covers are original generated editorial artwork. The owner’s references guide the whole scene: lighting, camera distance, negative space, grain, material weight, emotion and implied motion. Each cover uses a distinct subject treatment and composition; never publish the supplied references or reproduce them directly. Preserve complete compositions with proportional sizing and no hover crop. Artwork is conceptual, not client evidence.

Blog: six original practical guides, one per primary service area. Listing uses a three-column desktop/two-column tablet/one-column mobile editorial grid, topic links and a clear reading affordance. Articles use an unboxed headline, proportionally displayed editorial cover, author/date, reading time, a desktop contents column and a readable 740px body with a checklist, FAQs, source links and service CTA. Mobile contents stack above text; anchors clear the floating navigation. Blog occupies the former Resources slot in the unchanged five-link primary navigation; Resources remains linked in the footer and services.

SEO: distinct question-led titles, descriptions, absolute canonical URLs, Article/Breadcrumb JSON-LD, OG/Twitter artwork, sitemap and ordinary internal links. Articles are original editorial guidance with primary-source links for platform-specific claims. No unverified keyword volumes, ranking guarantees, invented case results or attributed founder authorship. Search traffic and indexation require post-publication observation; metadata alone is not SEO performance evidence.
