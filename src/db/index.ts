import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/**
 * The connection variables we accept, in the order we want them.
 *
 * This used to fall back to scanning `Object.values(process.env)` and taking
 * the first `postgres://` it found. That is unordered, and Vercel's Postgres
 * integrations set several of these at once — so on a deployment where
 * DATABASE_URL happened to be unset, the app would bind to whichever URL the
 * environment enumerated first. In practice that is often the NON_POOLING
 * direct connection, which is the one thing a serverless deployment must not
 * use: every lambda opens its own session and the connection limit is gone
 * long before the traffic is.
 *
 * An explicit, ordered list picks the pooled connection deliberately, and a
 * name we do not recognise now fails loudly instead of being silently
 * promoted to the app's database.
 */
const CONNECTION_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  // Direct/session connections, last: correct for migrations, wrong for
  // serverless request handling, but better than no database at all.
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
] as const;

export function resolveConnectionString(): string {
  for (const name of CONNECTION_VARS) {
    const value = process.env[name];
    if (isPgUrl(value)) return value;
  }

  throw new Error(
    `No Postgres connection string found. Checked ${CONNECTION_VARS.join(", ")}. ` +
      "Set DATABASE_URL in the Vercel project's environment variables and redeploy."
  );
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  // Supabase's transaction pooler (port 6543) doesn't support prepared
  // statements. Disabling them is also safe on a direct connection — it costs
  // a little planning time and nothing else — so this is set unconditionally
  // rather than sniffed from the port.
  const client = postgres(resolveConnectionString(), { prepare: false });
  return drizzle(client, { schema });
}

/**
 * Lazy: the client is constructed on first property access, not at import.
 * That is what lets a build with no database in the environment succeed —
 * every route that touches the database is dynamic, so nothing here runs
 * during static generation.
 */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
