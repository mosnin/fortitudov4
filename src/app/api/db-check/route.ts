import { NextResponse } from "next/server";
import postgres from "postgres";
import { resolveConnectionString } from "@/db";

export const dynamic = "force-dynamic";

// Diagnostic: which DB the live deployment actually connects to, whether the
// schema is applied, and what Postgres URLs exist in the environment. Exposes
// only hosts (no credentials).
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unparseable";
  }
}

const isPgUrl = (v: string | undefined): v is string =>
  !!v && /^postgres(?:ql)?:\/\//.test(v);

export async function GET() {
  // Every env var that holds a Postgres URL — name + host only (no creds).
  const pgVars = Object.entries(process.env)
    .filter(([, v]) => isPgUrl(v))
    .map(([name, v]) => {
      const host = hostOf(v as string);
      return {
        name,
        host,
        isSupabase: host.includes("supabase.co"),
        isNeon: host.includes("neon.tech"),
      };
    });

  // Names (only) of any other DB-ish env vars, to spot a Supabase URL hiding
  // under a non-URL value or unusual name.
  const dbRelatedKeys = Object.keys(process.env)
    .filter((k) => /supabase|postgres|database|neon|pg_|_db_/i.test(k))
    .sort();

  let usingHost: string | null = null;
  let isNeon = false;
  let isSupabase = false;
  let usersTableExists: boolean | null = null;
  let connectError: string | undefined;

  try {
    const url = resolveConnectionString();
    usingHost = hostOf(url);
    isNeon = usingHost.includes("neon.tech");
    isSupabase = usingHost.includes("supabase.co");
    const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 8 });
    const rows = await sql`select to_regclass('public.users') as t`;
    usersTableExists = rows[0]?.t != null;
    await sql.end({ timeout: 5 });
  } catch (e) {
    connectError = e instanceof Error ? e.message : String(e);
  }

  const anySupabaseUrlPresent = pgVars.some((p) => p.isSupabase);

  return NextResponse.json({
    ok: true,
    connectingToHost: usingHost,
    isNeon,
    isSupabase,
    usersTableExists,
    connectError,
    postgresUrlVars: pgVars,
    dbRelatedEnvKeys: dbRelatedKeys,
    diagnosis: !anySupabaseUrlPresent
      ? "NO Supabase Postgres URL exists in this deployment's environment. The code cannot connect to Supabase that isn't there — in Vercel, remove the Neon integration and connect Supabase (or set POSTGRES_URL to the Supabase pooler URL), then redeploy."
      : isSupabase && usersTableExists === false
      ? "Connected to Supabase, but the schema is missing. Run `pnpm db:push` against it."
      : isSupabase && usersTableExists
      ? "Connected to Supabase and the users table exists — auth/provisioning should work."
      : "A Supabase URL exists in the env but the app is not using it; investigating.",
  });
}
