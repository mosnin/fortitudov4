<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fortitudo architecture notes

## Surfaces & design systems
**`design.md` is the single canonical design doc.** Both systems in it were adopted wholesale from the `realestatecrm` repository — that codebase, not a paraphrase of it, is the source of truth. When a component is missing, port the real file from there instead of approximating one.

- **Product (dashboard + admin)** (`src/app/(dashboard)`, `src/app/(admin)`): premium, Apple-calm, monochrome and text-first. Compose from the ported kit in `src/components/crm/` (`CrmPageHeader`, `StatStrip`, `TabStrip`, `Toolbar`, `RecordList`, `SectionHead`) plus `src/components/motion/`. No decorative icons (only nav + functional controls), no gradients, no per-category colour, no mono/ASCII voice. Scale in `src/lib/typography.ts`. Shell: `src/components/shell/app-shell.tsx` (floating rounded sidebar, neutral active bar), driven by serializable nav config in the two layouts.
- **Logged-out** (`src/app/(marketing)`, `src/app/(auth)`): racing yellow on charcoal, structural rather than cinematic. Kit is `src/components/marketing/giga/` — `primitives.tsx` is the vocabulary; the homepage hero is `src/components/originkit/` (OriginKit `hero-21`). The whole palette is one `--fx-*` block on `[data-marketing-shell]` in `globals.css` — that selector is the boundary, and the product must never see these tokens. Two rules: **yellow is a surface and text on it is always black; charcoal is the ground and body text on it is always white.** Yellow as text only for accents a few words long. Squared corners (`rounded-[4px]`), hairline structure, one display sans at semibold — **no serif on this surface** (`<Serif>` keeps its name but renders the sans). `--fx-muted` is the contrast floor for meaningful text; `--fx-faint` fails WCAG body text and is decorative only. Onboarding sits behind sign-in and deliberately stays on the **product** palette.
- **Nothing on the logged-out site is invented.** The real-estate template it was ported from filled itself with named clients, quantified outcomes, star ratings, logo walls and staff rosters. All of it is gone. A case study names a real client and a number they agreed to, or it does not ship; `/portfolio` renders an empty state instead. Mock product screenshots carry a visible "illustrative interface" caption and are `aria-hidden` so invented numbers are not read aloud as fact.
- The two systems never mix. Light theme is the default in the product; `.dark` tokens exist and the toggle lives in the shell.
- Onboarding is the source repo's conversational flow, ported: its stages (`StageWhoYouServe`, `StageVoice`, `StageSources`) keep their markup and timings; only the questions and the submit binding are ours.

## Helix OS
The agentic layer (`src/lib/helix/`, `plans/helix-os.md`). Architecture adopted from **cloudflare-os** — its Workers runtime is not portable to this stack, its four primitives are:

- **Thread** — a durable agent session. Starts able to touch nothing.
- **Introduction** — a capability grant, per thread. Helix may request one; a human decides. `allowWrites: false` refuses writes outright rather than queueing them.
- **Action** — a proposed change. **Never written on first call**: the gatekeeper describes, previews and *simulates* it, and the thread's reads are replayed through that simulated overlay so the agent stays consistent and keeps working. Nothing commits until a human approves, and approval executes in proposal order.
- **Gadget / Blueprint** — a sandboxed per-client mini-app Helix writes; a blueprint is its source without its data.

`pnpm test` (vitest) checks the invariants below mechanically — overlay
semantics, registry contract, sandbox flags and CSP. Run it after touching
anything in `src/lib/helix/`; the suite is fast and database-free.

Rules that must hold:
- Every capability lives in `src/lib/helix/registry.ts` and nowhere else — that file is the whole blast radius.
- A write op must supply **both** `simulate()` and `execute()`; the contract types make an op missing either half unregisterable.
- Every op is authorised by an introduction. Ops that *create* a row declare a `guard` naming the parent (a task is guarded by its client), because the new row could never have been introduced.
- Gadgets **read but never write** — generated code on a loop could flood the queue, and approval only protects you while the queue stays readable. They run `sandbox="allow-scripts"` with **no** `allow-same-origin` plus `connect-src 'none'`; never add either.
- Client-portal threads are **read-only, always**. A client has no authority over their own delivery stage or fees, so their requests must not enter the agency's approval queue.
- The agent driver is pluggable: Anthropic-backed with `ANTHROPIC_API_KEY`, otherwise a rule-based planner that says so. Both go through `callOp`.

## Roles & access
`users.role`: `client | va | project_manager | admin` (see `src/lib/permissions.ts`). Staff land on `/admin` via `/post-login`; clients on `/dashboard`. VAs only see projects they hold a task on (`getAccessibleProjectIds`). Finance pages require `admin`.

## Offerings
Fortitudo sells exactly five things (`src/lib/services.ts`, mirrored by `src/lib/pricing.ts` and the `service_type` enum): **Websites, Software Solutions, AI Solutions, Consultation, Digital Marketing**. Anything outside that list does not belong in the product.

## Database
**A schema change needs `npx drizzle-kit push` against the target database before it deploys** — the `helix_*` tables and the `helix_approval_needed` notification type are recent additions.

Schema (`src/db/schema.ts`) covers CRM (`agencyClients`, `clientTasks`), ops (`tasks`, `leads`, `weeklyReports`), and revenue (`clientPayments`, `invoices`). Money is always integer cents. Run `npx drizzle-kit push` after pulling schema changes.

The dashboard was originally ported from a GoHighLevel marketing-agency template; that machinery has been swept out and **must not come back**: no expenses table, no partner ledger or 50/50 payment splits, no departments, no ad-campaign tracking, no SaaS-plan reselling, no GHL columns/integration, no Bronze/Gold/Diamond tiers (clients carry one of the five offerings), and **no built-in staff** — checklists seed unassigned and every roster reads from the DB. The CRM pipeline is the delivery pipeline (`src/lib/crm.ts`): Onboarding → Discovery → Design → Build → Client review → Launched → Ongoing. `weeklyReports` (leads/CPL/spend/closes/revenue) exist for **digital-marketing engagements only** and stay hidden for every other client.
