import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/**
 * Resolve the Postgres connection string from the environment. The Vercel
 * Supabase integration sets this automatically (commonly POSTGRES_URL), so we
 * accept the standard names and, failing that, use any Postgres URL present in
 * the environment — the exact variable name is managed by Vercel, not us.
 */
export function resolveConnectionString(): string {
  const preferred = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (isPgUrl(preferred)) return preferred;

  for (const value of Object.values(process.env)) {
    if (isPgUrl(value)) return value;
  }

  throw new Error(
    "No Postgres connection string found in the environment. Connect Supabase in Vercel and redeploy."
  );
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  // Supabase's transaction pooler (port 6543) doesn't support prepared
  // statements, so disable them.
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
