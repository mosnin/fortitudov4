/**
 * POST /api/leads — the public contact form.
 *
 * This endpoint exists because the contact page did not have one. The form
 * waited a second, said "Message sent!", and threw the message away. Every
 * prospect who wrote in through it was told they would hear back within 24
 * hours and then never heard from anyone, because nothing was ever recorded.
 *
 * Deliberately unauthenticated — it is a public form on a marketing page —
 * which means it is also the one write path a stranger can reach, so it
 * validates hard, caps every field, and rate-limits by IP.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { leads } from "@/db/schema";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(255).optional().or(z.literal("")),
  // Free text rather than the enum: the form offers the five offerings but a
  // prospect who does not see themselves in that list should still be able to
  // write in, and a dropped lead is worse than an unrecognised label.
  service: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
});

/** Field names a prospect can actually act on, for the 400 message. */
const FIELD_LABELS: Record<string, string> = {
  name: "name",
  email: "email",
  company: "company",
  service: "service",
  message: "message",
};

/* In-memory, per-instance rate limit. It is not a distributed limiter and does
 * not pretend to be one — it is the cheap ceiling that stops a single client
 * from filling the table faster than anyone would notice. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * The ceiling for callers we could not identify.
 *
 * Behind Vercel `x-forwarded-for` is always set, so this bucket should never
 * fill in production. If the site is ever served direct-to-origin, or a proxy
 * in front of it is misconfigured, every visitor keys to the same string — and
 * with one shared allowance of five the form would stop accepting leads for
 * the whole world after five submissions, silently, with a message blaming the
 * prospect's connection. That failure is far more expensive than the spam it
 * would be preventing, so the anonymous bucket gets its own much larger
 * allowance and says so in the log.
 */
const ANON_KEY = "unknown";
const MAX_PER_WINDOW_ANON = 500;

const hits = new Map<string, number[]>();

/** Requests in the current window, oldest entries dropped. */
function recentHits(key: string, now: number): number[] {
  return (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
}

function limitFor(key: string): number {
  return key === ANON_KEY ? MAX_PER_WINDOW_ANON : MAX_PER_WINDOW;
}

/** Peek: is this caller already at their ceiling? Consumes nothing. */
function overLimit(key: string): boolean {
  const now = Date.now();
  const recent = recentHits(key, now);
  hits.set(key, recent);
  if (recent.length < limitFor(key)) return false;

  if (key === ANON_KEY) {
    console.error(
      "[api/leads] the anonymous rate-limit bucket is full — no x-forwarded-for " +
        "reached this route, so every caller is sharing one allowance. Check the " +
        "proxy in front of the app; leads are being rejected."
    );
  }
  return true;
}

/**
 * Spend one unit of the caller's allowance.
 *
 * Called only after a lead is actually written. Rejected submissions cost
 * nothing on purpose: the limiter exists to stop the table being flooded, and
 * a prospect who mistypes their email five times should not then be locked out
 * for an hour on the attempt that was finally correct. A caller sending
 * nothing but malformed bodies writes no rows, which is the outcome the
 * limiter wanted anyway.
 */
function recordHit(key: string): void {
  const now = Date.now();
  const recent = recentHits(key, now);
  recent.push(now);
  hits.set(key, recent);
  // Bound the map so a long-lived instance under spray does not grow forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((at) => now - at >= WINDOW_MS)) hits.delete(k);
    }
  }
}

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || ANON_KEY;
  if (overLimit(ip)) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Try again later." },
      { status: 429 }
    );
  }

  /* Parsed OUTSIDE the try below, and separately from the insert.
   *
   * A body that is not JSON is the caller's mistake; a database that will not
   * accept the row is ours. Sharing one catch made them the same 500, so a
   * malformed request told the prospect "we could not record that message" —
   * as if we had lost it — and logged an error that read like an outage. */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "That message could not be read. Please try again." },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    // Name the fields that actually failed. "Check your name, email and
    // message" sent someone re-reading three correct fields when the problem
    // was a company name over the length cap.
    const bad = [
      ...new Set(
        parsed.error.issues
          .map((issue) => FIELD_LABELS[String(issue.path[0])])
          .filter(Boolean)
      ),
    ];
    return NextResponse.json(
      {
        error: bad.length
          ? `Please check your ${bad.join(", ")}.`
          : "Please check the form and try again.",
      },
      { status: 400 }
    );
  }

  try {
    const { name, email, company, service, message } = parsed.data;
    await db.insert(leads).values({
      name,
      email,
      company: company || null,
      // Stored as sent. The five offerings are what the form's select offers,
      // but free text is accepted (see the schema note), so there is nothing
      // to map it against — an earlier version looked the value up in a set of
      // known ids and then returned it unchanged either way.
      serviceInterest: service || null,
      message,
      source: "contact_form",
    });

    // Only a written row spends the caller's allowance.
    recordHit(ip);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[api/leads] POST", error);
    // The caller is told it failed rather than shown a success state, so a
    // prospect can fall back to email instead of assuming we have their note.
    return NextResponse.json(
      { error: "We could not record that message. Please email us directly." },
      { status: 500 }
    );
  }
}
