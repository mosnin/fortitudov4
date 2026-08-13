import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * The invite gate's back door check. `/sign-in` and `/sign-up` render an
 * invite-code prompt until this endpoint has set the `invite_ok` cookie;
 * the Clerk widgets only mount behind it.
 *
 * Codes live in the INVITE_CODES env var, comma-separated, compared after
 * trimming and case-folding — an invite read over the phone should not fail
 * on a capital letter. With the variable unset NOTHING is accepted (fail
 * closed): an empty gate that waves everyone through is not a gate, and the
 * error message tells the operator which variable to set, not the visitor.
 *
 * Public route (proxy allowlist) — its whole purpose is to run before there
 * is a user. Rate-limited by IP so the code space cannot be enumerated:
 * 10 tries a minute is plenty for a human with a real invite.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rate = checkRateLimit(`invite:${ip}`, 10, 60_000);
  if (!rate.success) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    // fall through to the empty-code rejection
  }
  if (!code || code.length > 128) {
    return NextResponse.json(
      { ok: false, error: "Enter an invite code." },
      { status: 400 },
    );
  }

  const configured = (process.env.INVITE_CODES ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (configured.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Invites are closed right now." },
      { status: 403 },
    );
  }

  if (!configured.includes(code.toLowerCase())) {
    return NextResponse.json(
      { ok: false, error: "That code did not match. Check it and try again." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });
  // The cookie says "this browser presented a valid invite once" — it is a
  // velvet rope for the sign-up flow, not an authentication credential, so a
  // 30-day plain value is proportionate. Clerk still owns real auth.
  response.cookies.set("invite_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
