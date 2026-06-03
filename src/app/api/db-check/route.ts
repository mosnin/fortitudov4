import { NextResponse } from "next/server";
import postgres from "postgres";
import { resolveConnectionString } from "@/db";

export const dynamic = "force-dynamic";

// Diagnostic: which DB the live deployment connects to and whether the schema
// is applied. Exposes only the host (no credentials).
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unparseable";
  }
}

export async function GET() {
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

  const isSupabase = host?.includes("supabase.co") ?? false;

  return NextResponse.json({
    ok: error === undefined,
    host,
    isSupabase,
    usersTableExists,
    error,
    status:
      error?.includes("DATABASE_URL is not set")
        ? "No DATABASE_URL is set on this deployment. Add it (your Supabase pooler URL) and redeploy."
        : usersTableExists === false
        ? `Connected to ${host}, but the schema is missing. Run \`pnpm db:push\`.`
        : usersTableExists
        ? `Connected to ${host} and the users table exists — auth should work.`
        : undefined,
  });
}
