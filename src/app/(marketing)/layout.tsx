/**
 * Marketing route-group layout, the dark, cinematic shell ("Giga" redesign).
 *
 * Every page under `app/(marketing)/` renders inside this shell, which is a
 * deliberately separate visual world from the product:
 *
 *  - ALWAYS DARK. The charcoal ground (`--fx-charcoal`) with light text,
 *    regardless of the app's light/dark theme toggle. The `dark` class is
 *    forced ON this subtree so sub-pages authored with `dark:` variants render
 *    their dark treatment here instead of flashing white cards. The product
 *    (outside this group) keeps its own theme untouched.
 *
 *  - ONE VOICE, NO SERIF. Headlines are a tight geometric sans (Geist,
 *    self-hosted) at semibold and eyebrows are the matching monospace. There is
 *    no serif on this surface: `--font-serif-display` survives only because ~14
 *    components reference it inline, and it points at the sans. The shell is
 *    tagged `data-marketing-shell`; a scoped rule in globals.css makes that
 *    face the DEFAULT for every heading in the tree (out-specifying the global
 *    `h1..h6 { --font-heading }` base rule) and defines the whole --fx-*
 *    palette.
 *
 * The marketing site is public; Clerk isn't loaded for unauth visitors (the
 * middleware sets `x-public-page` and the root layout skips ClerkProvider).
 * Auth-aware pages (the homepage redirects auth users to their workspace) still
 * call `auth()` from their own server component before rendering.
 */

import { SiteHeader } from '@/components/marketing/giga/header';
import { SiteFooter } from '@/components/marketing/giga/footer';
import { FooterReveal } from '@/components/ui/footer-reveal';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      // `dark` is forced ON, not inherited. The logged-out site is charcoal in
      // both themes: half these sections were authored dark-only, and letting
      // the product's light/dark toggle reach them produced white cards
      // dropped into a black page. `data-marketing-shell` scopes both the
      // display-face rules and the whole --fx-* palette in globals.css to this
      // subtree, so neither can leak into the product.
      data-marketing-shell
      className="dark flex min-h-screen flex-col bg-[var(--fx-charcoal)] text-[var(--fx-white)] antialiased"
    >
      {/* Shared gradient def so icons can be stroked with the brand gradient.
          The stops read the palette rather than repeating its hex: the vars are
          defined on this element, so they resolve for the whole subtree. */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="chippi-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--fx-yellow)" />
            <stop offset="100%" stopColor="var(--fx-yellow-hover)" />
          </linearGradient>
        </defs>
      </svg>
      <SiteHeader />
      {/* FooterReveal: the footer stays pinned under the page and is uncovered
          as the content slides up on the last stretch of scroll. The content
          wrapper carries the shell background so it occludes the pinned footer
          mid-page. */}
      <FooterReveal
        className="flex flex-1 flex-col"
        contentClassName="flex flex-1 flex-col bg-[var(--fx-charcoal)]"
        footer={<SiteFooter />}
      >
        <main className="flex-1">{children}</main>
      </FooterReveal>
    </div>
  );
}
