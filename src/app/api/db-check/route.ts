import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

// Diagnostic: which DB the live deployment actually connects to, and whether the
// schema is applied. Exposes only the host (no credentials) + table existence.
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unparseable";
  }
}

export async function GET() {
  const named: [string, string | undefined][] = [
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL],
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
  ];

  const envVarsPresent = Object.fromEntries(named.map(([k, v]) => [k, Boolean(v)]));
  // Same priority order the app uses (src/db/index.ts).
  const chosen = named.find((e): e is [string, string] => Boolean(e[1]));

  if (!chosen) {
    return NextResponse.json({
      ok: false,
      error: "No database connection env var is set on this deployment.",
      envVarsPresent,
    });
  }

  const [usingEnvVar, url] = chosen;
  const host = hostOf(url);
  const isNeon = host.includes("neon.tech");

  let usersTableExists: boolean | null = null;
  let connectError: string | undefined;
  try {
    const sql = postgres(url, {
      prepare: false,
      max: 1,
      idle_timeout: 5,
      connect_timeout: 8,
    });
    const rows = await sql`select to_regclass('public.users') as t`;
    usersTableExists = rows[0]?.t != null;
    await sql.end({ timeout: 5 });
  } catch (e) {
    connectError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: true,
    envVarsPresent,
    usingEnvVar,
    host,
    isNeon,
    usersTableExists,
    connectError,
    hint: isNeon
      ? "Still pointing at NEON. Set POSTGRES_URL (or DATABASE_URL) to the Supabase pooler URL and remove the Neon var."
      : usersTableExists === false
      ? "Connected to the right DB, but the schema is missing. Run `pnpm db:push` against this database."
      : usersTableExists
      ? "Connected to a database that HAS the users table. Auth/provisioning should work."
      : undefined,
  });
}
