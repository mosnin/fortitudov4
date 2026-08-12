import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/**
 * Resolve the Postgres connection string.
 *
 * Provider-agnostic on purpose, and it did not change when the app moved from
 * Supabase to Neon: both are Postgres behind a Vercel integration that sets a
 * handful of URLs at once, and the rule that matters — prefer the POOLED one —
 * is the same either way. Neon names its direct connection
 * `DATABASE_URL_UNPOOLED`, which `isDirect` already matched.
 *
 * Two failure modes have to be avoided at once, and the obvious fix for each
 * causes the other:
 *
 *  - Scanning every env value for the first `postgres://` match is unordered.
 *    Vercel's integrations set several URLs at once, so the app could bind to
 *    the NON_POOLING direct connection — fine for migrations, wrong for
 *    serverless, where every lambda opens its own session and the connection
 *    limit is gone long before the traffic is. On Neon the pooled URL is the
 *    one whose host carries `-pooler`; it terminates at their pgBouncer.
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

/**
 * Neon over WebSockets, not HTTP — `drizzle-orm/neon-serverless`.
 *
 * `neon-http` is the faster of Neon's two drivers and would serve almost every
 * query here in one round trip, but it cannot open a session, and therefore
 * cannot run a transaction. Two flows in this app write several rows that only
 * make sense together: creating a client seeds its delivery checklist
 * (api/admin/clients), and onboarding writes a project, its submission and its
 * six phases (api/onboarding). Neither is wrapped today — which is a gap, not a
 * decision — and picking the HTTP driver would make wrapping them impossible
 * rather than merely undone. The WebSocket driver costs a handshake and keeps
 * the option.
 *
 * `Pool` rather than a single `Client`: route handlers run concurrently in one
 * lambda, and a single connection serialises them.
 */
function createDb() {
  /* Node 22 has a global WebSocket, which the driver uses when it finds one.
     Setting it explicitly means this does not depend on the runtime happening
     to expose it — on a runtime that does not, the driver's own error is a
     confusing one about `ws` rather than about the environment. */
  if (typeof globalThis.WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  }

  const pool = new Pool({ connectionString: resolveConnectionString() });
  return drizzle(pool, { schema });
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
