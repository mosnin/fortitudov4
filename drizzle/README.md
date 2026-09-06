# Current database release checks

`src/db/schema.ts` is the current schema. The application uses Neon Postgres,
not the Supabase setup described in the archived notes below. A successful
Next.js build does not check the database: its connection is deliberately lazy.

On 2026-09-06 UTC, the current schema was installed in Neon project
`sparkling-term-17704790`, branch `br-super-term-avgn3m7u` (`main`), database
`neondb`, after matching its endpoint to the live Fortitudo deployment. The
public schema contained zero tables and zero enums. The guarded, atomic install
created 29 tables and 28 enums, and left the separate `neon_auth` schema alone.
No users, roles, client records or projects were seeded.

The reviewed SQL was exported from the current source:

```sh
npx drizzle-kit export --dialect postgresql --schema ./src/db/schema.ts
```

**Do not replay `0000_studio_core.sql` / `0001_business_profiles.sql` as a
current setup.** They describe retired offerings and omit current CRM, partner
and Helix tables. The commands, driver details and table counts in the archived
notes below are historical, not deployment instructions.

For future changes, verify the exact database target, inspect the proposed SQL,
back up populated data and validate on an isolated branch. Use the same
database's direct URL for schema operations and pooled URL for runtime. Never
approve destructive `drizzle-kit push` changes automatically. Preview currently
shares the integration with production, so its form submissions are real writes.

Verify the live tables and exercise the affected flow after deployment.
`/api/db-check` returning `ok: true` only means its query completed; inspect its
table-existence fields as well. Builds and fixtures do not prove real sign-in
or enquiry persistence.

Clerk remains the auth provider. `/post-login` now provisions missing records
from the verified server identity, always as a client, without waiting for a
webhook. Existing roles are preserved. `CLERK_WEBHOOK_SECRET` is still needed
for asynchronous profile update/deletion events; its absence must not be
reported as a fully configured webhook integration.

## Archived migration notes (superseded; do not execute)

The source of truth for the database is **`src/db/schema.ts`** (Drizzle). The SQL
files in this folder are generated from it via `drizzle-kit`. All application
code accesses the DB through Drizzle's typed query builder, so `tsc --noEmit`
mechanically guarantees that every table/column/enum referenced in `src/`
exists in the schema — keep that check green.

## CRITICAL: one database, everywhere

`relation "users" does not exist` (Postgres `42P01`) in production means the
schema was never applied to the database the app actually connects to. To make
that impossible:

- **`DATABASE_URL` must point to the same Postgres database in every
  environment** — your local `.env.local`, the seed/migrate step, and the
  `DATABASE_URL` configured in Vercel (Project → Settings → Environment
  Variables) must all resolve to the **same** Supabase database.
- Applying migrations locally does nothing for production unless `DATABASE_URL`
  at apply-time is the production database. Run the apply step against the same
  URL Vercel uses (or run it from CI with that secret) before/at deploy.
- Supabase exposes two ports: the **direct** connection (`5432`) and the
  **transaction pooler / Supavisor** (`6543`). The app runtime uses the pooler
  with prepared statements disabled (see `src/db/index.ts`). Either URL works
  for `db:push` / `db:migrate`; just make sure it is the right project.

## Apply the schema to a fresh database

```bash
# 1. Point at the target DB (must match Vercel's DATABASE_URL for production).
#    Put it in .env.local — both drizzle.config.ts and the seed read from there.
echo 'DATABASE_URL=postgres://...' >> .env.local

# 2a. Fast path for a brand-new/empty DB: push the schema directly.
pnpm db:push

#     — or —

# 2b. Migration path (applies the versioned SQL in drizzle/ in order):
pnpm db:migrate

# 3. Seed catalog + architects (idempotent; safe to re-run).
pnpm db:seed
```

`db:push` reconciles the live DB to `schema.ts` without migration files — ideal
for a fresh DB. `db:migrate` replays the committed `0000_*`/`0001_*` SQL and
records them in the `drizzle.__drizzle_migrations` table. Both produce the same
20 tables, 11 enums, and 22 indexes.

## Verify the database actually has the schema

```bash
# Should list users, projects, business_profiles, catalog_items, … (20 tables).
psql "$DATABASE_URL" -c "\dt"

# Quick existence check for the table the prod incident was missing:
psql "$DATABASE_URL" -c "SELECT to_regclass('public.users');"   # -> users (not null)
```

If `to_regclass` returns null against the URL Vercel uses, the app **will** throw
`42P01` at runtime — apply the schema before deploying.

## Changing the schema

1. Edit `src/db/schema.ts`.
2. `pnpm db:generate` — generates a new `drizzle/NNNN_*.sql` + `meta/` snapshot.
3. Commit the generated SQL **with** the schema change (never hand-edit the SQL).
4. Apply with `pnpm db:migrate` (or `pnpm db:push` for dev) against the target
   `DATABASE_URL`, including production's, as part of the deploy.

## Files

- `0000_studio_core.sql` — users, projects, all studio tables (catalog,
  blueprints, decision loop, deliverables, team, api_keys), enums, indexes, FKs.
- `0001_business_profiles.sql` — `business_profiles` table + `business_stage` enum.
- `meta/` — drizzle-kit snapshots & journal (do not edit by hand).
