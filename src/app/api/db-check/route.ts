import { NextResponse } from "next/server";
import postgres from "postgres";
import { resolveConnectionString } from "@/db";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

// Diagnostic: which DB the live deployment connects to, whether the schema is
// applied, and what Postgres URLs / DB-related vars exist (names + hosts only,
// never credentials). Infrastructure detail — admin eyes only.
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
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Every env var that holds a Postgres URL — name + host only.
  const postgresUrlVars = Object.entries(process.env)
    .filter(([, v]) => isPgUrl(v))
    .map(([name, v]) => ({ name, host: hostOf(v as string) }));

  // Names of any DB-related env vars (to spot integration-set names).
  const dbRelatedEnvKeys = Object.keys(process.env)
    .filter((k) => /supabase|postgres|database|neon|_db_|pg_/i.test(k))
    .sort();

  let host: string | null = null;
  let usersTableExists: boolean | null = null;
  let error: string | undefined;
  try {
    const url = resolveConnectionString();
    host = hostOf(url);
    const sql = postgres(url, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 8 });
    const rows = await sql`select to_regclass('public.users') as t`;
    usersTableExists = rows[0]?.t != null;
    await sql.end({ timeout: 5 });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: error === undefined,
    connectingToHost: host,
    isSupabase: host?.includes("supabase.co") ?? false,
    usersTableExists,
    error,
    postgresUrlVars,
    dbRelatedEnvKeys,
  });
}
