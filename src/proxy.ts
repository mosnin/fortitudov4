import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import {
  CURRENCY_COOKIE,
  LANG_COOKIE,
  decideLangRouting,
  isCurrency,
  resolveMarket,
  splitLocalizedPath,
} from "@/lib/i18n/markets";

/**
 * Everything reachable without signing in.
 *
 * Exported so it can be asserted in a test. A page missing from this list is
 * merely annoying — a signed-out visitor gets bounced to sign-in and comes
 * back. An API route missing from it is silent data loss, which is what
 * happened to `/api/leads`: the contact form POSTed to a route Clerk was
 * protecting, so every anonymous prospect got a 307 to sign-in and their
 * message went nowhere. That route exists specifically because the form used
 * to throw messages away, and it was throwing them away again for want of one
 * line here.
 *
 * When adding a public route, add the test with it.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/services(.*)",
  "/pricing(.*)",
  "/portfolio(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/faq(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  // The public contact form's submit target. Unauthenticated by design — it
  // validates hard, caps every field and rate-limits by IP instead.
  "/api/leads(.*)",
  "/api/webhooks(.*)",
  "/api/db-check(.*)",
];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

/**
 * Cross-language REDIRECTS are off; language RESOLUTION is not.
 *
 * `LOCALIZED_PATHS` in lib/i18n/markets.ts already names `/pricing`, but the
 * `[lang]` route trees do not exist yet — there is no `/es/pricing` and no
 * `/ru/pricing` under src/app/(marketing). Honouring the redirect today would
 * send the first visitor geo-located to Mexico City from a page they can read
 * to a 404 they cannot, which is strictly worse than serving them English.
 *
 * Flip this to `true` in the same commit that ships those routes, once every
 * entry in LOCALIZED_PATHS renders at `/es/<path>` and `/ru/<path>`. Nothing
 * else in this file changes: the decision is computed either way, so the
 * `?hl=` switcher already pins the language cookie and the currency cookie is
 * already written — only the 302 is withheld.
 */
const LANG_REDIRECTS_ENABLED: boolean = false;

/**
 * Top-level segments of the logged-out marketing site — the only place a
 * language decision means anything.
 *
 * An allowlist rather than a denylist of `/api`, `/_next`, `/dashboard`,
 * `/admin`, … : a denylist is one forgotten entry away from 302-ing a fetch to
 * `/es/api/leads` or bouncing a signed-in user out of their dashboard, and the
 * cost of forgetting an entry HERE is only that a new marketing page does not
 * localize. Matched on the first segment so nested pages (`/services/websites`)
 * are covered without listing each one.
 */
const MARKETING_ROOTS = new Set([
  "/",
  "/about",
  "/contact",
  "/faq",
  "/portfolio",
  "/pricing",
  "/privacy",
  "/services",
  "/terms",
]);

function isMarketingPath(basePath: string): boolean {
  const first = basePath.split("/")[1];
  return MARKETING_ROOTS.has(first ? `/${first}` : "/");
}

/**
 * Preference cookies, one year.
 *
 * NOT httpOnly, deliberately: local-price.tsx parses `document.cookie` after
 * hydration to swap the statically rendered USD price for the visitor's
 * currency, so a cookie the client cannot read is a cookie that does nothing.
 * Neither value carries authority — the worst a forged one buys you is prices
 * in the wrong currency, and both are re-validated (`isLang` / `isCurrency`)
 * everywhere they are read.
 */
const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Serialized by hand rather than through `NextResponse.cookies`, because Clerk
 * hands back a plain `Response` by type and we want to attach to ITS response
 * instead of discarding the auth headers it just set. Safe to skip encoding:
 * both values are drawn from closed unions of ASCII identifiers.
 */
function setPreferenceCookie(response: Response, name: string, value: string): void {
  response.headers.append(
    "set-cookie",
    `${name}=${value}; Path=/; Max-Age=${PREFERENCE_MAX_AGE}; SameSite=Lax`,
  );
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const handled = await clerkHandler(request, event);
  const response = handled ?? NextResponse.next();

  // Clerk redirecting (a handshake, or an unauthenticated user bounced to
  // sign-in) outranks anything below: that response is a control-flow step in
  // an auth exchange, and appending to it or replacing it breaks the exchange.
  if (response.status >= 300 && response.status < 400) return response;

  const { pathname } = request.nextUrl;
  if (!isMarketingPath(splitLocalizedPath(pathname).basePath)) return response;

  // Vercel geo-locates at the edge; locally the header is simply absent, which
  // resolveMarket already reads as the en/USD base market.
  const country = request.headers.get("x-vercel-ip-country");

  const decision = decideLangRouting({
    pathname,
    country,
    cookieLang: request.cookies.get(LANG_COOKIE)?.value,
    hlParam: request.nextUrl.searchParams.get("hl"),
  });

  // Correct the currency cookie whenever it is missing or unrecognised — a
  // stale value left by an earlier release (or a hand-edited one) would
  // otherwise pin a visitor to a currency forever, since local-price.tsx
  // trusts any value that survives isCurrency.
  const currencyCookie = request.cookies.get(CURRENCY_COOKIE)?.value;
  if (!isCurrency(currencyCookie)) {
    setPreferenceCookie(response, CURRENCY_COOKIE, resolveMarket(country).currency);
  }

  if (LANG_REDIRECTS_ENABLED && decision.redirectTo) {
    // Clone so the query string survives, `?hl=` included: carrying it to the
    // target keeps the choice explicit there (which also makes the target a
    // fixed point — it cannot bounce back) even if the cookie write is lost.
    const url = request.nextUrl.clone();
    url.pathname = decision.redirectTo;

    // 302, not 308: which language a bare path serves is a per-visitor
    // decision that must never be cached as a permanent property of the URL.
    const redirect = NextResponse.redirect(url, 302);
    for (const cookie of response.headers.getSetCookie()) {
      redirect.headers.append("set-cookie", cookie);
    }
    if (decision.setCookie) setPreferenceCookie(redirect, LANG_COOKIE, decision.lang);
    return redirect;
  }

  if (decision.setCookie) setPreferenceCookie(response, LANG_COOKIE, decision.lang);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
