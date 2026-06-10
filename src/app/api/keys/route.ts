import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { generateApiKey } from "@/lib/agent-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// List the caller's API keys (never returns the raw secret).
export async function GET() {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(desc(apiKeys.createdAt));

  return NextResponse.json(rows);
}

const createSchema = z.object({ name: z.string().min(1).max(120) });

// Mint a new API key. The raw secret is returned ONCE and never stored.
export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A key name is required." }, { status: 400 });
  }

  const { raw, prefix, hashedKey } = generateApiKey();
  const [created] = await db
    .insert(apiKeys)
    .values({ userId: user.id, name: parsed.data.name, prefix, hashedKey })
    .returning({ id: apiKeys.id, name: apiKeys.name, prefix: apiKeys.prefix, createdAt: apiKeys.createdAt });

  // `key` is shown exactly once — the client must copy it now.
  return NextResponse.json({ ...created, key: raw }, { status: 201 });
}
