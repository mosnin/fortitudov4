import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Please configure it in your .env file."
    );
  }
  // Supabase's transaction-mode pooler (Supavisor, port 6543) does not support
  // prepared statements, so disable them on the postgres.js client.
  const client = postgres(databaseUrl, { prepare: false });
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
