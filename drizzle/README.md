# Database migrations & runbook

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
