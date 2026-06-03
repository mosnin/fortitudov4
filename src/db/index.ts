import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Resolve the Postgres connection string.
 *
 * Vercel's Supabase (and Postgres) marketplace integration provisions
 * `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` — it does
 * NOT set `DATABASE_URL`. Prefer those (so the integration "just works"), then
 * fall back to `DATABASE_URL` for local development.
 */
function resolveConnectionString(): string {
  const url =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "No database connection string found. Set POSTGRES_URL (Vercel Supabase integration) or DATABASE_URL."
    );
  }
  return url;
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  // Supabase's transaction-mode pooler (Supavisor, port 6543) does not support
  // prepared statements, so disable them on the postgres.js client.
  const client = postgres(resolveConnectionString(), { prepare: false });
  return drizzle(client, { schema });
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
