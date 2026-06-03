import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Resolve the Postgres connection string.
 *
 * Vercel's Supabase (and Postgres) marketplace integration provisions
 * `POSTGRES_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` — it does
 * NOT set `DATABASE_URL`. A previously-connected Neon integration, on the other
 * hand, sets `DATABASE_URL`. To avoid connecting to a stale Neon database we
 * prefer the integration's pooled URL and explicitly skip any `neon.tech` host.
 */
function resolveConnectionString(): string {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter((u): u is string => Boolean(u));

  if (candidates.length === 0) {
    throw new Error(
      "No database connection string found. Set POSTGRES_URL (Vercel Supabase integration) or DATABASE_URL."
    );
  }

  // Never connect to a leftover Neon database once one of the others is present.
  return candidates.find((u) => !u.includes("neon.tech")) ?? candidates[0];
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
