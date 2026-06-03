import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/**
 * Resolve the Postgres connection string.
 *
 * Vercel's Supabase integration provisions POSTGRES_URL etc. — but if a Neon
 * integration is also connected, it overwrites those standard names with Neon
 * URLs. So we first scan EVERY env var for a Supabase Postgres URL (the
 * Supabase value may survive under a non-standard name), and only then fall
 * back to the standard variables.
 */
export function resolveConnectionString(): string {
  for (const value of Object.values(process.env)) {
    if (isPgUrl(value) && value.includes("supabase.co")) return value;
  }

  const standard =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (standard) return standard;

  throw new Error(
    "No Postgres connection string found in the environment. Set POSTGRES_URL to your Supabase pooler URL."
  );
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
