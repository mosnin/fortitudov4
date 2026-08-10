<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fortitudo architecture notes

## Surfaces & design systems
- **Landing** (`src/app/page.tsx` + `src/components/landing/`): editorial system extracted from the reference site — Geist Mono display headings (100% leading, -0.032em tracking), Georgia italic accents, cream `#FDFBF6`, blueprint hairline rails (`SectionRails`), 3D press buttons (`PressButton`), rotating chips. Image/illustration slots are explicit `ImagePlaceholder`s awaiting final artwork — never replace them with invented graphics.
- **Product (dashboard + admin)** (`src/app/(dashboard)`, `src/app/(admin)`): **`design-product.md` is canonical** — the CRM reference's premium, Apple-calm surface. Monochrome and text-first: no decorative icons, no gradients, no category colors, no mono/ASCII voice (that belongs to the logged-out site and auth only). Near-black primary, hairline borders, `tabular-nums` for figures, serif `H1` page titles, neutral `STATUS_PILL`s, `divide-y` row lists, `PRIMARY_PILL` buttons. Scale in `src/lib/typography.ts`. Shell: `src/components/shell/app-shell.tsx` (floating rounded sidebar, neutral active bar), driven by serializable nav config in the two layouts.
- Light theme is the default; `.dark` tokens exist and the toggle lives in the shell.
- **Auth + onboarding** (`src/app/(auth)`, `src/app/onboarding`) follow the logged-out system and keep the ASCII atmosphere.

## Roles & access
`users.role`: `client | va | project_manager | admin` (see `src/lib/permissions.ts`). Staff land on `/admin` via `/post-login`; clients on `/dashboard`. VAs only see projects they hold a task on (`getAccessibleProjectIds`). Finance pages require `admin`.

## Offerings
Fortitudo sells exactly five things (`src/lib/services.ts`, mirrored by `src/lib/pricing.ts` and the `service_type` enum): **Websites, Software Solutions, AI Solutions, Consultation, Digital Marketing**. Anything outside that list does not belong in the product.

## Database
Schema (`src/db/schema.ts`) covers CRM (`agencyClients`, `clientTasks`), ops (`tasks`, `leads`, `weeklyReports`), and revenue (`clientPayments`, `invoices`). Money is always integer cents. Run `npx drizzle-kit push` after pulling schema changes.

The dashboard was originally ported from a GoHighLevel marketing-agency template; that machinery has been swept out and **must not come back**: no expenses table, no partner ledger or 50/50 payment splits, no departments, no ad-campaign tracking, no SaaS-plan reselling, no GHL columns/integration, no Bronze/Gold/Diamond tiers (clients carry one of the five offerings), and **no built-in staff** — checklists seed unassigned and every roster reads from the DB. The CRM pipeline is the delivery pipeline (`src/lib/crm.ts`): Onboarding → Discovery → Design → Build → Client review → Launched → Ongoing. `weeklyReports` (leads/CPL/spend/closes/revenue) exist for **digital-marketing engagements only** and stay hidden for every other client.
