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
 *  - ONE VOICE, NO SERIF. Headlines are Inter Tight (self-hosted) at medium
 *    and eyebrows are the matching monospace. The product runs the same face,
 *    so the type no longer changes at the sign-in boundary. There is
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

import { Cursor } from '@/components/marketing/giga/cursor';
import { SoundLayer } from '@/components/sound/sound-layer';
import { PageShutter } from '@/components/marketing/giga/page-shutter';
import { ProgressiveBlur } from '@/components/marketing/giga/progressive-blur';
import { TextRevealInit } from '@/components/marketing/giga/text-reveal-init';
import { SiteHeader } from '@/components/marketing/giga/header';
import { FlameOutro, OfferingsTicker } from '@/components/marketing/giga/marketing-flair';
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
      {/* The `chippi-grad` linearGradient def used to live here, so icons could
          be stroked with the brand gradient. Its only two consumers were the
          decorative glyphs above the card headings in `offerings.tsx` and
          `complexity.tsx` — the pattern AGENTS.md rules out by name — and both
          are gone, so the def went with them rather than sitting in every page
          of the site with nothing referencing it. */}
      {/* Pointer devices only, never on touch, off under reduced motion. */}
      <Cursor />
      {/* Text Reveal 03: arms the pre-paint hidden state and drives the
          character colour-wave on every [data-reveal-03] element. */}
      <TextRevealInit />
      {/* Interface sounds (lib/sound): taps, hovers on the nav/CTA family,
          the drawer pair, page turns. One mute in the footer governs all. */}
      <SoundLayer />
      {/* The yellow shutter that covers every internal navigation — including
          sign-in/sign-up, whose (auth) layout mounts the same component so the
          reveal completes on the far side. */}
      <PageShutter />
      <SiteHeader />
      {/* FooterReveal: the footer stays pinned under the page and is uncovered
          as the content slides up on the last stretch of scroll. The content
          wrapper carries the shell background so it occludes the pinned footer
          mid-page. */}
      <FooterReveal
        className="flex flex-1 flex-col"
        contentClassName="flex flex-1 flex-col bg-[var(--fx-charcoal)]"
        footer={
          <>
            <SiteFooter />
            {/* The site ends in embers — the ASCII flame under the footer,
                on every logged-out page. Decorative, aria-hidden, one static
                frame under reduced motion (marketing-flair.tsx). */}
            <FlameOutro />
          </>
        }
      >
        <main className="flex-1">{children}</main>
        {/* The offerings belt: the five things we sell, in LED dots, above
            the footer on every logged-out page. */}
        <OfferingsTicker />
      </FooterReveal>
      {/* Progressive blur along both viewport edges — fixed, so it sits
          OUTSIDE FooterReveal: a transformed ancestor would re-anchor it. */}
      <ProgressiveBlur />
    </div>
  );
}
