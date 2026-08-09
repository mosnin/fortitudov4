<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fortitudo architecture notes

## Surfaces & design systems
- **Landing** (`src/app/page.tsx` + `src/components/landing/`): editorial system extracted from the reference site — Geist Mono display headings (100% leading, -0.032em tracking), Georgia italic accents, cream `#FDFBF6`, blueprint hairline rails (`SectionRails`), 3D press buttons (`PressButton`), rotating chips. Image/illustration slots are explicit `ImagePlaceholder`s awaiting final artwork — never replace them with invented graphics.
- **Product (dashboard + admin)** (`src/app/(dashboard)`, `src/app/(admin)`): paper-flat neutral-first system fused with the studio ASCII voice. Near-black `--primary`; hairline `--border`; brand orange (`--brand`) ONLY for logo/ticks/rare accents. Mono voice (`.eyebrow-mono`, `.bracket-label`, `font-mono`) for labels, statuses, amounts, dates; `.font-title` (Georgia) for page titles; `<AsciiField />` as sparse atmosphere. Shell: `src/components/shell/app-shell.tsx`, driven by serializable nav config in the two layouts.
- Light theme is the default; `.dark` tokens exist and the toggle lives in the shell.

## Roles & access
`users.role`: `client | va | project_manager | admin` (see `src/lib/permissions.ts`). Staff land on `/admin` via `/post-login`; clients on `/dashboard`. VAs only see projects they hold a task on (`getAccessibleProjectIds`). Finance pages require `admin`.

## Database
Schema (`src/db/schema.ts`) is a superset including CRM (`agencyClients`, `clientTasks`), ops (`tasks`, `leads`, `weeklyReports`), and finance (`clientPayments`, `expenses`, `partnerLedgerEntries`). After pulling this branch, run `npx drizzle-kit push` against the database to create the new tables/columns/enums. Money is always integer cents. `ghl*` columns are dormant (kept for schema compatibility; no GoHighLevel integration is wired).
