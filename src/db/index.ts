import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * The Postgres connection. Set `DATABASE_URL` to your Supabase pooler URL.
 * (`POSTGRES_URL` is also accepted, since Vercel's Supabase integration sets
 * that name.)
 */
export function resolveConnectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Point it at your Supabase pooler connection string."
    );
  }
  return url;
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
