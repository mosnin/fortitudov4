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
import { services } from "@/lib/services";

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

/** Offerings the form's select is allowed to submit, for the label lookup. */
const KNOWN_SERVICES = new Set<string>(services.map((s) => s.id));

/* In-memory, per-instance rate limit. It is not a distributed limiter and does
 * not pretend to be one — it is the cheap ceiling that stops a single client
 * from filling the table faster than anyone would notice. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function overLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Bound the map so a long-lived instance under spray does not grow forever.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((at) => now - at >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0].trim() || "unknown";
    if (overLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages from this connection. Try again later." },
        { status: 429 }
      );
    }

    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your name, email and message." },
        { status: 400 }
      );
    }

    const { name, email, company, service, message } = parsed.data;
    await db.insert(leads).values({
      name,
      email,
      company: company || null,
      serviceInterest:
        service && KNOWN_SERVICES.has(service) ? service : service || null,
      message,
      source: "contact_form",
    });

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
