'use client';

/**
 * `PageHero` — the hero every non-homepage marketing page wears.
 *
 * `/services`, `/pricing`, `/portfolio`, `/about`, `/contact` and `/faq` each
 * opened with the same hand-written block: a charcoal band, a yellow radial
 * wash, an eyebrow, a `DISPLAY_L` `h1`, one muted paragraph and sometimes a
 * pair of pills. Six copies of one idea drift, and they had already started
 * to — one page padded its `Band`, the rest padded the `<section>`. This is
 * that block, once, with the wash replaced by the dot-matrix field ported from
 * OriginKit `hero-26`.
 *
 * WHAT IT KEEPS FROM THE REFERENCE
 * The field is real: a WebGL2 shader drifting a simplex noise field through a
 * grid of `·•○●` glyphs (`../../originkit/ui/hero-26/dot-matrix`). What it
 * does NOT keep is the reference's palette, its nav bar, its two CTAs, its
 * Google-Fonts import and its full-viewport height — the drop was a landing
 * page pretending to be a section.
 *
 * COLOUR
 * Two colours: racing yellow and charcoal. The ground is never painted by the
 * shader at all — the canvas is transparent and the `<section>` behind it
 * paints `--fx-charcoal`, so the ground IS the token. The dots are read off
 * the mounted element's computed style at runtime (`--fx-hairline` →
 * `--fx-faint` → `--fx-white` → `--fx-yellow`), which is what lets one
 * component follow the palette and the `[data-fx-tone="light"]` inversion
 * instead of freezing a hex. The `FALLBACK_*` constants below are only reached
 * when the tokens do not resolve — outside `[data-marketing-shell]` — and they
 * are the token values; change one, change both.
 *
 * WHEN IT CANNOT DRAW
 * `createDotMatrix` returns `null` rather than throwing when the machine has
 * no WebGL2 context, and this component does nothing with `null`. The copy is
 * not conditional on the field: eyebrow, headline, lead and CTA are rendered
 * by the same tree whether the canvas exists, failed, or has not mounted yet
 * (which is also what the server renders). There is no state to get wrong and
 * no branch that can leave an empty box where the copy should be.
 *
 * MOTION
 * `prefers-reduced-motion` draws the field once, correctly coloured, and never
 * schedules a frame. Otherwise the loop stops whenever the section leaves the
 * viewport or the tab goes to the back, and is cancelled on unmount — this
 * component now runs on six pages, and a shader animating for nobody on all of
 * them is a battery complaint.
 *
 * The field is decoration and says so: `aria-hidden`, `pointer-events-none`,
 * and a `<canvas>` that never takes focus. The `h1` is the caller's copy,
 * because each page owns exactly one.
 */

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { createDotMatrix } from '@/components/originkit/ui/hero-26/dot-matrix';
import { Band, BlurRise, Eyebrow, PillGhost, PillPrimary, Serif } from './primitives';
import { DISPLAY_L, HERO_Y } from './tokens';

/**
 * The palette, for the case where the tokens do not resolve. These MUST stay
 * equal to the `[data-marketing-shell]` block in globals.css — they exist so a
 * hero rendered outside the shell is charcoal-and-yellow rather than black,
 * not as a second source of truth.
 */
const FALLBACK_HAIRLINE = 'rgba(255, 255, 255, 0.12)';
const FALLBACK_FAINT = 'rgba(255, 255, 255, 0.38)';
const FALLBACK_WHITE = '#ffffff';
const FALLBACK_YELLOW = '#f8cd02';

/**
 * The copy sits on solid charcoal and the field is left to breathe on the
 * right, then folded back into the ground at the bottom edge so it meets the
 * section's hairline instead of being cut by it.
 *
 * `color-mix` with `transparent` rather than an `rgba()` literal: the ground
 * is a token, and a scrim written as a hex would be the one thing on the
 * surface that did not follow the palette.
 */
const SCRIM = [
  'linear-gradient(to right, var(--fx-charcoal) 0%, color-mix(in srgb, var(--fx-charcoal) 88%, transparent) 38%, transparent 80%)',
  'linear-gradient(to bottom, color-mix(in srgb, var(--fx-charcoal) 55%, transparent) 0%, transparent 34%, var(--fx-charcoal) 100%)',
].join(', ');

/** Under `sm` the copy runs the full width, so the field steps further back. */
const SCRIM_NARROW = 'color-mix(in srgb, var(--fx-charcoal) 58%, transparent)';

export type PageHeroCta = {
  label: string;
  href: string;
};

export type PageHeroProps = {
  /** The mono label above the headline — `<Eyebrow>` supplies the dot. */
  eyebrow: ReactNode;
  /**
   * The `h1`. An array renders one line per entry, which is how these
   * headlines are written; a single node is left to wrap on its own. Entries
   * are nodes rather than strings so a page can keep its yellow clause:
   * `['Five things we build.', <span className="text-[var(--fx-yellow)]">Pick one.</span>]`.
   */
  title: ReactNode | ReactNode[];
  /** One paragraph, ~65ch. */
  lead?: ReactNode;
  /** The primary action. Yellow, and there is only ever one on a screen. */
  cta?: PageHeroCta;
  /** The bordered second action, if the page has one. */
  secondaryCta?: PageHeroCta;
  /**
   * Offsets the noise field. Six pages sharing one component would otherwise
   * share one frame; give each page its own number and each opens differently.
   */
  seed?: number;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  lead,
  cta,
  secondaryCta,
  seed = 0,
  className,
}: PageHeroProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Read the palette off the mounted element, so the field inherits whatever
    // scope it is rendered in rather than a hex compiled in here.
    const computed = getComputedStyle(host);
    const token = (name: string, fallback: string) =>
      computed.getPropertyValue(name).trim() || fallback;

    const matrix = createDotMatrix(host, {
      // Dimmest first: structure, then dust, then the white mid-tones, and the
      // accent only on the rare bright cells. Yellow is capped below full so
      // the field never competes with the one yellow button beneath it.
      //
      // The steps carry their own opacities rather than reusing --fx-hairline
      // and --fx-faint. Those two are TEXT tokens, already alpha'd for copy
      // sitting on the old, lighter charcoal; against the ground as it is now
      // the first two steps of the ramp landed under 4% effective and the
      // field was invisible on a rendered page. Only the two solid tokens are
      // read, so the field still follows the tone inversion — in the yellow
      // scope --fx-white and --fx-yellow both resolve to charcoal and the dots
      // come out dark on yellow, which is correct.
      ramp: [
        { css: token('--fx-white', FALLBACK_WHITE), opacity: 0.14 },
        { css: token('--fx-white', FALLBACK_WHITE), opacity: 0.3 },
        { css: token('--fx-white', FALLBACK_WHITE), opacity: 0.55 },
        { css: token('--fx-yellow', FALLBACK_YELLOW), opacity: 0.95 },
      ],
      // The default 1.7 keeps the top two stops rare — on four of the six
      // seeds they never fired at all and the field drew only its dimmest
      // stop, measuring 26 against a ground of 15. That is a canvas doing
      // work nobody can see. Lower gamma spreads the noise across the ramp,
      // so the bright clusters actually appear on every seed rather than on
      // whichever one happens to peak.
      gamma: 1.15,
      seed,
      still: reduce === true,
    });

    // `null` means this machine cannot draw the field. Nothing else changes.
    return () => matrix?.destroy();
  }, [reduce, seed]);

  const lines = Array.isArray(title) ? title : [title];
  const hasActions = Boolean(cta || secondaryCta);

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]',
        HERO_Y,
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <div ref={hostRef} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ background: SCRIM }} />
        <div className="absolute inset-0 sm:hidden" style={{ background: SCRIM_NARROW }} />
      </div>

      {/* The narrowing goes on a div INSIDE the Band, never through
          `innerClassName`. Band's inner element is `mx-auto w-full
          max-w-[1728px]`, and `cn` is twMerge — so passing `max-w-3xl` replaces
          the max-width and KEEPS the `mx-auto`, quietly centring the column.
          That is how every sub-page headline ended up indented 336px on a
          1440px screen while the sections below it sat at the 40px gutter. */}
      <Band innerClassName="relative">
        <BlurRise trigger="load" className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Serif as="h1" className={cn('mt-5 text-[var(--fx-white)]', DISPLAY_L)}>
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </Serif>
          {lead ? (
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              {lead}
            </p>
          ) : null}
          {hasActions ? (
            <div className="mt-9 flex flex-wrap gap-3">
              {cta ? (
                <PillPrimary href={cta.href} withArrow>
                  {cta.label}
                </PillPrimary>
              ) : null}
              {secondaryCta ? (
                <PillGhost href={secondaryCta.href}>{secondaryCta.label}</PillGhost>
              ) : null}
            </div>
          ) : null}
        </BlurRise>
      </Band>
    </section>
  );
}

export default PageHero;
