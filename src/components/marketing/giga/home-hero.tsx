'use client';

/**
 * `HomeHero` — the homepage hero, and the one deliberately centred block on
 * this surface (design.md: everything else sits at the 40px `Band` gutter).
 *
 * WHAT IT IS
 * A charcoal full-viewport column with a wireframe corridor receding behind
 * it — OriginKit `hero-03`'s three.js perspective tunnel, ported in
 * `../../originkit/ui/hero-03/perspective-tunnel`. The corridor is real
 * geometry with real fog, which is why it was worth taking: the top of the
 * page gets depth without a photograph, and the site has no photographs.
 *
 * WHAT CAME OFF THE DROP
 * The drop was a portrait-photography landing page: cream `#fffbe1` ground,
 * Instrument Serif at 68px, its own nav bar, a lightbox, and five portraits of
 * other people's models floating through the tunnel. Ground is
 * `--fx-charcoal` — the same token the sections below paint, so the seam into
 * `<Stats/>` is a colour change of zero. Type is the shell's Inter Tight at
 * 500/-0.03em through `<Serif>`, off the `tokens.ts` ladder. The nav went (the
 * site has a header), the lightbox went (it opened photographs that no longer
 * exist), and NO IMAGES are passed to the corridor at all — see below.
 *
 * NO IMAGES, AND NOT PLACEHOLDERS EITHER
 * Five placeholder boxes floating in a tunnel is a wireframe, not a hero, and
 * five panels of real type would be a second reading of the five offerings
 * three inches above the chip row that already lists them — set in a decoration
 * that is `aria-hidden`, so the words would be there for the eye and absent
 * from the page. The corridor runs empty. It is hairline structure receding
 * into fog, which is the same vocabulary as every rule and hairline below it.
 *
 * COLOUR
 * The corridor gets no hex. Ground, rails and ribs are read off the mounted
 * element's computed style (`--fx-charcoal`, `--fx-white`, `--fx-yellow`) and
 * handed to WebGL, which needs literals — the same trick `page-hero.tsx` and
 * `global-reach.tsx` use, and the reason this follows the palette instead of
 * freezing one. The `FALLBACK_*` constants are only reached outside
 * `[data-marketing-shell]`, and they are the token values.
 *
 * WHEN IT CANNOT DRAW
 * `createPerspectiveTunnel` returns `null` rather than throwing when there is
 * no WebGL context, and this component does nothing with `null`. Badge,
 * headline, lead, both CTAs and the chip row are rendered by the same tree
 * whether the canvas exists, failed, or has not mounted yet (which is also
 * what the server renders): no state, no branch, no empty box where the copy
 * should be.
 *
 * MOTION
 * `prefers-reduced-motion` draws the corridor once, correctly coloured, and
 * never schedules a frame — the drop only set its speed to zero, which stops
 * the travel and leaves a render loop running for a picture that cannot
 * change. Otherwise the loop stops when the hero leaves the viewport or the
 * tab goes to the back, and is cancelled on unmount.
 *
 * The copy's own motion is the surface's: the headline assembles itself
 * (`KineticText`, the signature move, spent here and on section headings) and
 * everything around it blur-rises a beat apart. The yellow CTA leans toward
 * the cursor because `PillPrimary` does; "See our work" does not.
 */

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { services } from '@/lib/services';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { createPerspectiveTunnel } from '@/components/originkit/ui/hero-03/perspective-tunnel';
import { BlurRise, PillGhost, PillPrimary, Serif } from './primitives';
import { KineticText } from './motion-kit';
import { BODY, BODY_S, DISPLAY_XL, EYEBROW_TEXT, HERO_Y, LEAD, MONO_STYLE } from './tokens';

/** The five things we sell, read from the module the product prices from. */
const OFFERINGS = services.map((service) => service.name);

/**
 * The palette, for the case where the tokens do not resolve — outside the
 * marketing shell. These MUST stay equal to the `[data-marketing-shell]` block
 * in globals.css; they exist so a hero rendered outside the shell is
 * charcoal-and-yellow rather than black, not as a second source of truth.
 */
const FALLBACK_CHARCOAL = '#0f0f12';
const FALLBACK_WHITE = '#ffffff';
const FALLBACK_YELLOW = '#f8cd02';

/**
 * The veil that keeps the corridor off the type. The drop blurred a cream slab
 * behind its headline; this is the same idea in the ground token, so it
 * follows the palette rather than being the one painted hex on the page.
 */
const VEIL =
  'radial-gradient(58% 44% at 50% 40%, var(--fx-charcoal) 0%, ' +
  'color-mix(in srgb, var(--fx-charcoal) 74%, transparent) 46%, transparent 76%)';

/**
 * The corner falloff. Near-camera rails leave the frame as long diagonals, and
 * unchecked they run out through the four corners and read as stray lines
 * rather than as a corridor. This folds them back into the ground so what is
 * left is a well of depth behind the column.
 */
const VIGNETTE =
  'radial-gradient(78% 64% at 50% 46%, transparent 0%, transparent 52%, ' +
  'color-mix(in srgb, var(--fx-charcoal) 76%, transparent) 78%, var(--fx-charcoal) 100%)';

/**
 * Top and bottom. The site header floats over the first stop; the bottom
 * reaches the ground at full strength BEFORE the section ends, so the corridor
 * has already dissolved by the join into `<Stats/>` and there is no edge to
 * see. A gradient that only lands on charcoal at 100% leaves lines visible at
 * 95% and puts a hairline where the two sections meet.
 */
const EDGES =
  'linear-gradient(to bottom, var(--fx-charcoal) 0%, ' +
  'color-mix(in srgb, var(--fx-charcoal) 62%, transparent) 11%, transparent 30%, ' +
  'transparent 50%, var(--fx-charcoal) 90%)';

export function HomeHero({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].hero;
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Read the palette off the mounted element, so the corridor inherits
    // whatever scope it renders in rather than a hex compiled in here.
    const computed = getComputedStyle(host);
    const token = (name: string, fallback: string) =>
      computed.getPropertyValue(name).trim() || fallback;

    const tunnel = createPerspectiveTunnel(host, {
      // The clear colour AND the fog. It has to be the section's own ground or
      // the corridor would end on a visible rectangle.
      background: token('--fx-charcoal', FALLBACK_CHARCOAL),
      // Rails in white at hairline strength, ribs in the accent. Both solid
      // tokens: `--fx-hairline` and `--fx-faint` are TEXT tokens, pre-alpha'd
      // for copy, and WebGL wants the alpha as a number anyway.
      lineColor: token('--fx-white', FALLBACK_WHITE),
      accentColor: token('--fx-yellow', FALLBACK_YELLOW),
      lineOpacity: 0.22,
      accentOpacity: 0.2,
      grid: 4,
      speed: 0.32,
      fade: 100,
      still: reduce === true,
    });

    // `null` means this machine cannot draw the corridor. Nothing else changes.
    return () => tunnel?.destroy();
  }, [reduce]);

  return (
    <section
      /* `Band`'s three gutter steps, written out: the corridor is positioned
         against this section and would be cropped to the content column if the
         section were a `Band`. They must stay equal to it — without the `lg`
         step the hero sat 8px proud of every section below it. */
      className={cn(
        'relative isolate flex min-h-dvh w-full flex-col items-center overflow-hidden',
        'bg-[var(--fx-charcoal)] px-5 sm:px-8 lg:px-10',
        HERO_Y,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none">
        <div ref={hostRef} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ background: VEIL }} />
        <div className="absolute inset-0" style={{ background: VIGNETTE }} />
        <div className="absolute inset-0" style={{ background: EDGES }} />
      </div>

      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <BlurRise trigger="load">
          <a
            href="/pricing"
            /* The one circle on the surface that is not a dot or an avatar: the
               hero badge, which the system keeps as its single pill. */
            className="inline-flex items-center gap-3 rounded-full border border-[var(--fx-faint)] bg-[var(--fx-white)]/[0.06] py-1.5 pr-5 pl-1.5 backdrop-blur-md transition-colors duration-200 hover:border-[var(--fx-yellow)]"
          >
            <span
              style={MONO_STYLE}
              className={cn(
                EYEBROW_TEXT,
                /* `nowrap`: the tag is two words and the pill is the width of
                   the phone under `sm` — without it "FIXED PRICE" breaks over
                   two lines and the pill grows a second row. */
                'rounded-full bg-[var(--fx-yellow)] px-3 py-1 whitespace-nowrap text-[var(--fx-on-yellow)]',
              )}
            >
              {t.badgeTag}
            </span>
            <span className={cn(BODY, 'font-medium text-[var(--fx-white)]')}>
              {t.badgeText}
            </span>
          </a>
        </BlurRise>

        {/* Not wrapped in `BlurRise`: the headline runs its own mask reveal, and
            a blur-rise around it would be a second curve on the same element. */}
        <Serif as="h1" className={cn('mt-8', DISPLAY_XL, 'text-[var(--fx-white)]')}>
          <KineticText trigger="load" delay={0.18} lines={t.headlineLines} />
        </Serif>

        <BlurRise trigger="load" delay={0.22}>
          <p className={cn('mt-7 max-w-xl', LEAD, 'text-[var(--fx-muted)]')}>{t.lead}</p>
        </BlurRise>

        <BlurRise
          trigger="load"
          delay={0.3}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {/* Exactly one yellow action on the screen. */}
          <PillPrimary href="/onboarding" withArrow>
            {t.ctaPrimary}
          </PillPrimary>
          <PillGhost href="/portfolio" withArrow>
            {t.ctaSecondary}
          </PillGhost>
        </BlurRise>
      </div>

      {/* ── What we build ──────────────────────────────────────────────────────
          The slot where the reference put a row of partner logos. We have none,
          and a wall of invented ones is the exact thing this site has been
          cleared of — so it carries the five offerings, which are true and do
          the same job of saying what you are looking at.

          This is the obvious place for a marquee and it deliberately does not
          get one: every chip here is a link to /services, and a link that slides
          out from under the cursor is a link you have to chase. */}
      <BlurRise
        trigger="load"
        delay={0.38}
        className="mt-auto flex w-full max-w-4xl flex-col items-center pt-20"
      >
        <p style={MONO_STYLE} className={EYEBROW_TEXT}>
          {t.offeringsEyebrow}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {OFFERINGS.map((offering) => (
            <a
              key={offering}
              href="/services"
              className={cn(
                'block rounded-[4px] border border-[var(--fx-faint)] bg-[var(--fx-white)]/[0.06]',
                'px-4 py-2.5 font-medium whitespace-nowrap backdrop-blur-sm transition-colors duration-200',
                BODY_S,
                'text-[var(--fx-white)] hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)]',
              )}
            >
              {offering}
            </a>
          ))}
        </div>
      </BlurRise>
    </section>
  );
}

export default HomeHero;
