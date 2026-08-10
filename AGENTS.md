<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fortitudo architecture notes

## Surfaces & design systems
**`design.md` is the single canonical design doc.** Both systems in it were adopted wholesale from the `realestatecrm` repository — that codebase, not a paraphrase of it, is the source of truth. When a component is missing, port the real file from there instead of approximating one.

- **Product (dashboard + admin)** (`src/app/(dashboard)`, `src/app/(admin)`): premium, Apple-calm, monochrome and text-first. Compose from the ported kit in `src/components/crm/` (`CrmPageHeader`, `StatStrip`, `TabStrip`, `Toolbar`, `RecordList`, `SectionHead`) plus `src/components/motion/`. No decorative icons (only nav + functional controls), no gradients, no per-category colour, no mono/ASCII voice. Scale in `src/lib/typography.ts`. Shell: `src/components/shell/app-shell.tsx` (floating rounded sidebar, neutral active bar), driven by serializable nav config in the two layouts.
- **Logged-out** (`src/app/(marketing)`, `src/app/(auth)`, `src/app/onboarding`): dark, cinematic, photography-led. Kit is `src/components/marketing/giga/` — `primitives.tsx` is the vocabulary. Near-black `#0a0a0a`, serif display via `--font-title`, monospace eyebrows, white pill CTAs, `#ff7a45` used sparingly, `FooterReveal`.
- The two systems never mix. Light theme is the default in the product; `.dark` tokens exist and the toggle lives in the shell.
- Onboarding is the source repo's conversational flow, ported: its stages (`StageWhoYouServe`, `StageVoice`, `StageSources`) keep their markup and timings; only the questions and the submit binding are ours.

## Roles & access
`users.role`: `client | va | project_manager | admin` (see `src/lib/permissions.ts`). Staff land on `/admin` via `/post-login`; clients on `/dashboard`. VAs only see projects they hold a task on (`getAccessibleProjectIds`). Finance pages require `admin`.

## Offerings
Fortitudo sells exactly five things (`src/lib/services.ts`, mirrored by `src/lib/pricing.ts` and the `service_type` enum): **Websites, Software Solutions, AI Solutions, Consultation, Digital Marketing**. Anything outside that list does not belong in the product.

## Database
Schema (`src/db/schema.ts`) covers CRM (`agencyClients`, `clientTasks`), ops (`tasks`, `leads`, `weeklyReports`), and revenue (`clientPayments`, `invoices`). Money is always integer cents. Run `npx drizzle-kit push` after pulling schema changes.

The dashboard was originally ported from a GoHighLevel marketing-agency template; that machinery has been swept out and **must not come back**: no expenses table, no partner ledger or 50/50 payment splits, no departments, no ad-campaign tracking, no SaaS-plan reselling, no GHL columns/integration, no Bronze/Gold/Diamond tiers (clients carry one of the five offerings), and **no built-in staff** — checklists seed unassigned and every roster reads from the DB. The CRM pipeline is the delivery pipeline (`src/lib/crm.ts`): Onboarding → Discovery → Design → Build → Client review → Launched → Ongoing. `weeklyReports` (leads/CPL/spend/closes/revenue) exist for **digital-marketing engagements only** and stay hidden for every other client.
