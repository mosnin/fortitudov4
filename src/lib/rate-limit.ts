/**
 * Rate limiter. Uses Upstash Redis when configured (durable across serverless
 * instances); otherwise falls back to a best-effort in-memory limiter.
 *
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable the durable
 * backend. The API is async either way.
 */
import { Redis } from "@upstash/redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// ── Durable backend (Upstash) ────────────────────────────────────────────────
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ── In-memory fallback ───────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
      if (value.resetAt < now) rateLimitMap.delete(key);
    }
  }, 60_000).unref?.();
}

function checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  entry.count++;
  if (entry.count > limit) return { success: false, remaining: 0, resetAt: entry.resetAt };
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Check the rate limit for a key (e.g. userId or IP).
 * @param key    Unique bucket identifier
 * @param limit  Max requests allowed in the window
 * @param windowMs Window length in ms (default 60s)
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  if (redis) {
    try {
      const rkey = `rl:${key}`;
      const count = await redis.incr(rkey);
      if (count === 1) await redis.pexpire(rkey, windowMs);
      const now = Date.now();
      if (count > limit) {
        const ttl = await redis.pttl(rkey);
        return { success: false, remaining: 0, resetAt: now + (ttl > 0 ? ttl : windowMs) };
      }
      return { success: true, remaining: limit - count, resetAt: now + windowMs };
    } catch {
      // Redis hiccup — degrade to in-memory rather than failing the request.
      return checkMemory(key, limit, windowMs);
    }
  }
  return checkMemory(key, limit, windowMs);
}
