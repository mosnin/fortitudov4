import type { MetadataRoute } from "next";

/**
 * robots.txt, generated rather than served from `public/robots.txt`.
 *
 * Same reasoning as `sitemap.ts`: a text file in `public/` has no connection to
 * the routes it describes, so it silently falls behind them. The static version
 * this replaces listed six of the product's routes and had missed the eight
 * added since — `/helix`, `/payments`, `/reports`, `/guides`, `/tools`,
 * `/checkout`, `/onboarding` and `/post-login` were all crawlable.
 *
 * Note that the route-group parentheses in `src/app/(dashboard)/…` do NOT
 * appear in URLs: `(dashboard)/projects` serves at `/projects`, not
 * `/dashboard/projects`. Every segment of that group therefore needs its own
 * entry here, which is exactly the detail that made the static file rot.
 */

const ORIGIN = "https://fortitudo.agency";

/**
 * The authenticated surface, as `src/app` actually lays it out. Keep in step
 * with the `(dashboard)` and `(admin)` route groups.
 *
 * Crawl-blocking is not access control — every one of these is behind Clerk in
 * `src/proxy.ts`, and a crawler ignoring robots.txt still gets bounced to
 * sign-in. This exists so the product does not surface in search results as a
 * wall of identical login redirects.
 */
const PRIVATE_ROUTES = [
  // (dashboard)
  "/analytics",
  "/dashboard",
  "/guides",
  "/helix",
  "/messages",
  "/notifications",
  "/payments",
  "/projects",
  "/reports",
  "/settings",
  "/tools",
  // (admin)
  "/admin",
  // Standalone authenticated flows. `/post-login` is the role-routing hop
  // between auth and the right dashboard — it exists only to 302, which is the
  // shape that fills a Search Console report with soft-404 noise.
  "/checkout",
  "/onboarding",
  "/post-login",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_ROUTES,
    },
    sitemap: `${ORIGIN}/sitemap.xml`,
  };
}
