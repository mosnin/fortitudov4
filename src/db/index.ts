import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/**
 * Resolve the Postgres connection string.
 *
 * Two failure modes have to be avoided at once, and the obvious fix for each
 * causes the other:
 *
 *  - Scanning every env value for the first `postgres://` match is unordered.
 *    Vercel's integrations set several URLs at once, so the app could bind to
 *    the NON_POOLING direct connection — fine for migrations, wrong for
 *    serverless, where every lambda opens its own session and the connection
 *    limit is gone long before the traffic is.
 *  - Hardcoding an exact list breaks the moment the integration prefixes its
 *    variables. This production deployment sets STORAGE_POSTGRES_URL,
 *    STORAGE_POSTGRES_PRISMA_URL and STORAGE_POSTGRES_URL_NON_POOLING and no
 *    unprefixed name at all, so a list of five exact names found nothing and
 *    took the whole database down.
 *
 * So: exact preferred names first, then a pattern match over the environment
 * that accepts any prefix but is SORTED for determinism and ranks pooled above
 * direct. The prefix is the integration's business; the pooling is ours.
 */
const EXACT_VARS = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"] as const;

/** A direct/session connection — usable, but only once nothing pooled exists. */
const isDirect = (name: string) =>
  /NON_POOLING|UNPOOLED|DIRECT/i.test(name);

/** Any `*POSTGRES_URL` / `*DATABASE_URL`, whatever the integration prefixed it with. */
const isConnectionName = (name: string) =>
  /(?:POSTGRES|DATABASE)_(?:PRISMA_)?URL(?:_NON_POOLING|_UNPOOLED)?$/i.test(name);

export function resolveConnectionString(): string {
  for (const name of EXACT_VARS) {
    if (isPgUrl(process.env[name])) return process.env[name] as string;
  }

  // Sorted so the choice is reproducible rather than dependent on the order
  // the runtime happens to enumerate keys in.
  const candidates = Object.keys(process.env)
    .filter((name) => isConnectionName(name) && isPgUrl(process.env[name]))
    .sort();

  const pooled = candidates.find((name) => !isDirect(name));
  if (pooled) return process.env[pooled] as string;

  const direct = candidates[0];
  if (direct) return process.env[direct] as string;

  throw new Error(
    "No Postgres connection string found. Looked for DATABASE_URL, POSTGRES_URL, " +
      "POSTGRES_PRISMA_URL, and any prefixed *_POSTGRES_URL / *_DATABASE_URL. " +
      "Connect a Postgres integration in Vercel, or set DATABASE_URL, then redeploy."
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
