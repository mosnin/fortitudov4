import { NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { resolveConnectionString } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Diagnostic: which database the live deployment actually reaches, whether the
 * schema is applied, and which Postgres-shaped env vars exist. Names and hosts
 * only — never a credential.
 *
 * It earns its keep: this route is how the STORAGE_POSTGRES_URL prefix problem
 * was found, when a hardcoded list of five exact variable names matched nothing
 * in production and took the database down.
 *
 * SECURITY NOTE — it is in PUBLIC_ROUTES, so anyone can call it. It leaks no
 * credential, but it does disclose the database host and the names of every
 * DB-related variable, which is reconnaissance. It is public deliberately,
 * because the moment you most need it is the moment the database is unreachable
 * and a role lookup cannot run to authorise you. If that trade stops being
 * worth it, gate it behind a shared secret in the query string rather than
 * behind auth, or the tool stops working exactly when it is needed.
 */
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unparseable";
  }
}

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

/** Which managed Postgres the host belongs to, for the "am I on the new one?" question. */
function providerOf(host: string | null): string {
  if (!host) return "unknown";
  if (host.includes("neon.tech")) return "neon";
  if (host.includes("supabase.co") || host.includes("supabase.com")) return "supabase";
  if (host.includes("localhost") || host.startsWith("127.")) return "local";
  return "other";
}

export async function GET() {
  // Every env var holding a Postgres URL — name + host only.
  const postgresUrlVars = Object.entries(process.env)
    .filter(([, v]) => isPgUrl(v))
    .map(([name, v]) => ({ name, host: hostOf(v as string) }));

  // Names of DB-related vars, to spot whatever an integration decided to call
  // things this week.
  const dbRelatedEnvKeys = Object.keys(process.env)
    .filter((k) => /supabase|postgres|database|neon|_db_|pg_/i.test(k))
    .sort();

  let host: string | null = null;
  let usersTableExists: boolean | null = null;
  let partnerTablesExist: boolean | null = null;
  let error: string | undefined;

  let pool: Pool | null = null;
  try {
    if (typeof globalThis.WebSocket !== "undefined") {
      neonConfig.webSocketConstructor = globalThis.WebSocket;
    }
    const url = resolveConnectionString();
    host = hostOf(url);

    // One connection, short fuse. A diagnostic that hangs is worse than one
    // that fails: this is called when something is already wrong.
    pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 8000 });
    const { rows } = await pool.query(
      "select to_regclass('public.users') as users, to_regclass('public.partner_requests') as partner_requests"
    );
    usersTableExists = rows[0]?.users != null;
    // The partner tables are the most recent migration, so they answer the
    // question this endpoint is usually being asked: has drizzle-kit push run
    // against THIS database since the last schema change?
    partnerTablesExist = rows[0]?.partner_requests != null;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  } finally {
    await pool?.end().catch(() => {});
  }

  return NextResponse.json({
    ok: error === undefined,
    connectingToHost: host,
    provider: providerOf(host),
    usersTableExists,
    partnerTablesExist,
    error,
    postgresUrlVars,
    dbRelatedEnvKeys,
  });
}
