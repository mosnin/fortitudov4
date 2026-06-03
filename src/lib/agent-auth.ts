import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys, users, type User } from "@/db/schema";

// Agents authenticate to the agent API with a bearer key. The raw key is shown
// once at creation and never stored — we keep only its SHA-256 hash.

const KEY_PREFIX = "ftd_live_";

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hashedKey: string } {
  const raw = KEY_PREFIX + randomBytes(24).toString("hex");
  return {
    raw,
    // A short, non-secret identifier shown in the dashboard.
    prefix: raw.slice(0, 14),
    hashedKey: hashKey(raw),
  };
}

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Resolve the agent principal (a DB user of type "agent") from a bearer API key.
 * Throws a NextResponse on failure so route handlers can catch and return it.
 * Updates lastUsedAt as a side effect.
 */
export async function getAgentPrincipal(req: Request): Promise<User> {
  const raw = extractBearer(req);
  if (!raw) {
    throw NextResponse.json(
      { error: "Missing API key. Provide 'Authorization: Bearer <key>'." },
      { status: 401 }
    );
  }

  const hashed = hashKey(raw);
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.hashedKey, hashed), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!key) {
    throw NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, key.userId)).limit(1);
  if (!user) {
    throw NextResponse.json({ error: "API key principal not found." }, { status: 401 });
  }

  // Best-effort last-used tracking; never block the request on it.
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch(() => {});

  return user;
}
