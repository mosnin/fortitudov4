/**
 * What is reachable without signing in.
 *
 * This file exists because of one line that was missing. `/api/leads` — the
 * public contact form's submit target — was not in the public list, so Clerk
 * answered every anonymous POST with a 307 to sign-in. The form showed its
 * generic failure and the prospect's message was lost. That route was written
 * precisely because an earlier version of the form discarded messages, and it
 * was discarding them again.
 *
 * Nothing about that was visible in code review: the route file's own doc
 * comment says "deliberately unauthenticated", the form's fetch looked right,
 * and both were true. The mistake lived in a third file.
 *
 * So the assertions here are deliberately blunt and name real paths. A regex
 * that looks correct is not the thing being tested — the thing being tested is
 * whether a visitor who is not signed in can reach the URL.
 */

import { describe, expect, it } from "vitest";
import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { PUBLIC_ROUTES, isMarketingPath } from "./proxy";

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);

/** Matches how the proxy sees a request: a real NextRequest, real pathname. */
const req = (path: string, method = "GET") =>
  new NextRequest(new URL(path, "https://fortitudo.agency"), { method });

/** Every page and endpoint a signed-out visitor has to be able to use. */
const MUST_BE_PUBLIC = [
  "/",
  "/services",
  "/pricing",
  "/portfolio",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
];

/** The authenticated product. None of it may be readable signed-out. */
const MUST_BE_PROTECTED = [
  "/dashboard",
  "/admin",
  "/partner",
  "/analytics",
  "/guides",
  "/helix",
  "/messages",
  "/notifications",
  "/payments",
  "/projects",
  "/reports",
  "/settings",
  "/tools",
  "/onboarding",
  "/checkout",
  "/post-login",
];

describe("public marketing pages", () => {
  it.each(MUST_BE_PUBLIC)("%s is reachable signed-out", (path) => {
    expect(isPublicRoute(req(path))).toBe(true);
  });

  it("covers nested paths under each public page", () => {
    // The list uses `(.*)` suffixes; a section page must not fall through.
    for (const path of ["/services/websites", "/sign-in/factor-one", "/faq#tech"]) {
      expect(isPublicRoute(req(path)), path).toBe(true);
    }
  });
});

describe("the contact form's submit target", () => {
  // The regression this file was written for. Kept as its own block so a
  // failure names the actual consequence rather than a path in a list.
  it("POST /api/leads does not require signing in", () => {
    expect(isPublicRoute(req("/api/leads", "POST"))).toBe(true);
  });

  it("is public for every method, not just POST", () => {
    for (const method of ["GET", "POST", "OPTIONS"]) {
      expect(isPublicRoute(req("/api/leads", method)), method).toBe(true);
    }
  });
});

describe("public API routes", () => {
  it.each(["/api/leads", "/api/webhooks/clerk", "/api/webhooks/creem", "/api/db-check"])(
    "%s is reachable without a session",
    (path) => {
      expect(isPublicRoute(req(path, "POST"))).toBe(true);
    }
  );
});

describe("the authenticated product", () => {
  it.each(MUST_BE_PROTECTED)("%s requires a session", (path) => {
    expect(isPublicRoute(req(path))).toBe(false);
  });

  it.each(MUST_BE_PROTECTED)("%s requires a session on nested paths too", (path) => {
    expect(isPublicRoute(req(`${path}/anything/deeper`))).toBe(false);
  });

  it("does not expose the rest of the API", () => {
    // Everything under /api that is NOT explicitly public. These carry client
    // data, invoices and the agency's own pipeline.
    for (const path of [
      "/api/admin/clients",
      "/api/invoices",
      "/api/messages",
      "/api/projects",
      "/api/reports",
      "/api/team",
      "/api/search",
      "/api/helix/threads",
      "/api/onboarding",
    ]) {
      expect(isPublicRoute(req(path, "POST")), path).toBe(false);
    }
  });

  it("does not expose the partner API surface", () => {
    // Someone else's budget, our quote against it, and the list of every job a
    // partner has with us.
    for (const path of [
      "/api/partners",
      "/api/partners/requests",
      "/api/admin/partners",
    ]) {
      expect(isPublicRoute(req(path, "POST")), path).toBe(false);
    }
  });

  it("is not fooled by a public prefix on a protected path", () => {
    // `/api/leads(.*)` must not turn `/api/leadsecret` into a public route by
    // accident, and a protected route must not become public by being spelled
    // as a suffix of a public one.
    for (const path of ["/adminx", "/dashboardz", "/api/leadsomething/../admin"]) {
      expect(isPublicRoute(req(path)), path).toBe(false);
    }
  });
});

describe("the partner surface", () => {
  // The fourth surface (plans/partners.md). It is authenticated like the other
  // two, and it is not a marketing page — being absent from BOTH lists is what
  // makes that true, so both absences are asserted rather than assumed.
  it("requires a session", () => {
    expect(isPublicRoute(req("/partner"))).toBe(false);
  });

  it("requires a session on every page under it", () => {
    for (const path of [
      "/partner/requests",
      "/partner/requests/new",
      "/partner/requests/8f2c/edit",
      "/partner/settings",
    ]) {
      expect(isPublicRoute(req(path)), path).toBe(false);
    }
  });

  it("is not public for any method", () => {
    for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
      expect(isPublicRoute(req("/partner/requests", method)), method).toBe(false);
    }
  });

  it("is not named in PUBLIC_ROUTES at all", () => {
    // A regex added in a hurry ("/partners(.*)" for a marketing page about our
    // partner programme) would make the whole surface anonymous.
    for (const route of PUBLIC_ROUTES) {
      expect(route.startsWith("/partner"), route).toBe(false);
    }
  });

  it("is not treated as a marketing path, so no language 302 can bounce it", () => {
    // Marketing roots are an allowlist on purpose; a signed-in partner
    // redirected to /es/partner would land on a route that does not exist.
    expect(isMarketingPath("/partner")).toBe(false);
    expect(isMarketingPath("/partner/requests")).toBe(false);
  });

  it("does not localize, exactly as /dashboard and /admin do not", () => {
    for (const path of ["/dashboard", "/admin", "/partner"]) {
      expect(isMarketingPath(path), path).toBe(false);
    }
  });

  it("still treats the real marketing pages as marketing", () => {
    // Guards the assertion above against passing because isMarketingPath
    // started answering false to everything.
    for (const path of ["/", "/pricing", "/services/websites", "/work/stored"]) {
      expect(isMarketingPath(path), path).toBe(true);
    }
  });
});
