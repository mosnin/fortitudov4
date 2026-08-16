'use client';

/**
 * The homepage hero — OriginKit `hero-23`, ported to this site.
 *
 * WHAT SURVIVED THE DROP. The composition: a hairline-framed panel with
 * corner brackets, a starfield behind the copy, and a half-globe rising out
 * of the hero's bottom edge. The engine files are vendored beside this
 * (`stardust.tsx`, `globe.tsx` — the globe's land data now ships same-origin
 * in `public/originkit/hero-23-land.json` instead of being fetched from a
 * third-party GitHub raw URL at runtime).
 *
 * WHAT DID NOT, AND WHY:
 *  - Its nav, logo and menu — this site has a header.
 *  - The "$20M raised led by Sequoia" badge, the "300K+ users" and "120+
 *    countries" stat cards, the avatars, the flags and the client-logo strip.
 *    Every one is an invented fact about somebody else's company, and nothing
 *    on this site is invented — the badge carries the fixed-price promise the
 *    old hero carried, and the numbers this page CAN stand behind live in the
 *    Stats section below.
 *  - Helvetica and the three pixel-perfect Figma frames. One fluid layout in
 *    the site's own type and primitives replaces them.
 *
 * COLOUR: charcoal ground, white type, the badge dot and primary CTA are the
 * only yellow. The globe is drawn in the site's own hairline greys.
 *
 * REDUCED MOTION: the starfield and the rotating globe simply do not mount —
 * `useReducedMotionSafe` flips post-hydration, so SSR and the first client
 * render agree (the hydration lesson in `use-reduced-motion-safe.ts`), and a
 * reader who asked for stillness gets the framed copy on clean charcoal.
 * `KineticText`/`BlurRise` carry their own reduced-motion fallbacks.
 */

import { Fragment, useEffect, useRef } from 'react';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import { BlurRise, PillGhost, PillPrimary } from '@/components/marketing/giga/primitives';
import { DISPLAY_XL, LEAD, MONO_STYLE } from '@/components/marketing/giga/tokens';
import Globe from './globe';
import Stardust from './stardust';

/**
 * Hero 01 first-load reveal — arming script. Streams with the SSR HTML and
 * runs on parse, BEFORE the hero paints: it sets `html[data-hero01]`, whose
 * CSS (globals.css) clips the panel to the narrow starting window, shows the
 * yellow underlay and hides the `[data-reveal-01]` copy. It refuses to arm
 * under prefers-reduced-motion and after the intro has already played once
 * this JS lifetime — in every unarmed world the hero simply renders whole.
 */
const HERO01_ARM =
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!window.__fxHero01Played){document.documentElement.setAttribute('data-hero01','')}}catch(e){}";

/** Expansion lands at 1.4 − 0.1 + 1.65s on the resource timeline; the yellow
 *  field folds away right behind it. */
const UNDERLAY_FADE_AT = 2.95;
/** The resource's load delay for Text Reveal 01, verbatim. */
const TEXT_REVEAL_DELAY = 2.24;

/** The drop's corner brackets, inlined as SVG — four rotations of one
 *  10×10 path, stroke in the hairline-strength white the frame uses. */
function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10.5 10.5"
      fill="none"
      className={`absolute size-[10px] text-white ${className}`}
    >
      <path d="M10.5 0.5H0.5V10.5" stroke="currentColor" />
    </svg>
  );
}

function Corners() {
  return (
    <>
      <Corner className="left-0 top-0" />
      <Corner className="right-0 top-0 rotate-90" />
      <Corner className="bottom-0 right-0 rotate-180" />
      <Corner className="bottom-0 left-0 -rotate-90" />
    </>
  );
}

export function Hero23({ lang }: { lang: Lang }) {
  const t = HOME[lang].hero;
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);

  // Hero 01: the media reveal (clip window on the yellow field) + Text
  // Reveal 01 at the resource's 2.24s. Plays only when the arming script
  // armed this load; reduced motion never reaches this effect.
  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    if (!section || !document.documentElement.hasAttribute('data-hero01')) return;

    let cancelled = false;
    let revert: (() => void) | null = null;

    Promise.all([
      import('gsap'),
      import('@/lib/hero-01'),
      import('@/lib/text-reveal-01'),
      document.fonts.ready,
    ]).then(([{ default: gsap }, { hero01 }, { textReveal01 }]) => {
      if (cancelled) return;
      (window as Window & { __fxHero01Played?: boolean }).__fxHero01Played = true;
      const underlay = section.querySelector('[data-hero-01-underlay]');
      const ctx = gsap.context(() => {
        hero01(section);
        textReveal01(section, TEXT_REVEAL_DELAY);
        if (underlay) {
          // The yellow field around the window — the user's swap for the
          // demo's white page ground. It holds through both expansions and
          // folds away the moment the panel reaches full size.
          gsap.set(underlay, { autoAlpha: 1 });
          gsap.to(underlay, {
            autoAlpha: 0,
            duration: 0.6,
            delay: UNDERLAY_FADE_AT,
            ease: 'power2.out',
          });
        }
      });
      // Every intro state is now pinned inline by GSAP; the pre-hydration
      // gate has done its job and can go.
      document.documentElement.removeAttribute('data-hero01');
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reduce]);

  return (
    <section ref={sectionRef} className="relative px-4 pt-4 sm:px-6 sm:pt-6">
      <script dangerouslySetInnerHTML={{ __html: HERO01_ARM }} />
      {/* The yellow field the clip window opens onto. Visibility is gated on
          html[data-hero01] in globals.css, so it exists only while the intro
          owns the frame. */}
      <div
        aria-hidden
        data-hero-01-underlay
        className="absolute inset-0 bg-[var(--fx-yellow)]"
      />
      {/* The framed panel — the drop's signature chrome, and the intro's
          media layer: html[data-hero01] pre-clips it to the narrow window,
          then hero-01.ts drives the expansion. */}
      <div
        data-hero-01-media
        className="relative z-[1] overflow-hidden border border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]"
      >
        {/* `.hero-01__image` — the resource's scaling layer. Everything in the
            panel (canvases and copy alike) breathes 1 → 0.86 → 1 inside the
            clip window as one surface, the way the demo's photograph did. */}
        <div className="hero-01__image relative">
        {/* Starfield. Transparent background: the panel paints the ground. */}
        {reduce ? null : (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Stardust
              particleDensity={10}
              minSize={1}
              maxSize={1}
              speed={10}
              particleSpeed={1}
              movement={6}
              angle={184}
              particleColor="#FFFFFF33"
              background="rgba(0,0,0,0)"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}

        <div className="relative z-[1] flex flex-col items-center px-5 pb-[240px] pt-20 text-center sm:pb-[300px] sm:pt-28">
          {/* The badge: the fixed-price promise, not somebody's funding round. */}
          <BlurRise trigger="load">
            <span className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] px-3 py-2">
              <span aria-hidden className="size-1.5 rounded-full bg-[var(--fx-yellow)]" />
              <span
                style={MONO_STYLE}
                className="text-[11px] uppercase tracking-[0.18em] text-[var(--fx-yellow)]"
              >
                {t.badgeTag}
              </span>
              <span className="text-[12px] text-[var(--fx-muted)]">{t.badgeText}</span>
            </span>
          </BlurRise>

          {/* Text Reveal 01 owns the headline and lead now — masked lines
              sliding up 2.24s in, after the media expansion (the resource's
              own choreography). The KineticText/BlurRise entrances they used
              to carry are gone: one arrival per element. A bare h1 rather
              than <Serif>, because the reveal attribute must sit on the
              element SplitText owns and the shell's heading rule already
              sets the display face. */}
          <h1
            data-reveal-01="lines"
            className={`mt-7 max-w-4xl ${DISPLAY_XL} text-[var(--fx-white)]`}
          >
            {t.headlineLines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </h1>

          <p
            data-reveal-01="lines"
            className={`mx-auto mt-6 max-w-xl ${LEAD} text-[var(--fx-muted)]`}
          >
            {t.lead}
          </p>

          <BlurRise trigger="load" delay={0.4}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <PillPrimary href="/contact" withArrow>
                {t.ctaPrimary}
              </PillPrimary>
              <PillGhost href="/work">{t.ctaSecondary}</PillGhost>
            </div>
          </BlurRise>
        </div>

        {/* The half-globe, rising out of the panel's bottom edge — hero-23's
            signature. Drawn in the site's hairline greys; rotation pauses on
            hover (the engine's own behaviour), absent under reduced motion. */}
        {reduce ? null : (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-[220px] w-[min(920px,140vw)] -translate-x-1/2 overflow-hidden sm:h-[280px]"
          >
            <div className="absolute left-1/2 top-0 aspect-square w-full -translate-x-1/2">
              <Globe
                scale={9.7}
                initialLatitude={12}
                speed={2}
                oceanColor="#0f0f12"
                outlineColor="rgba(255,255,255,0.45)"
                graticuleColor="rgba(255,255,255,0.10)"
                dots={{ color: '#ffffff', size: 5, density: 8, allDots: false }}
                fillColor="#ffffff"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            {/* Fold the sphere's lower glow back into the ground. */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--fx-charcoal)]" />
          </div>
        )}

        <Corners />
        </div>
        {/* `[data-hero-01-overlay]` — same node, timing and autoAlpha as the
            resource, adapted fill: the demo's flat 40% black exists to make
            white text read over a photograph, and on this already-dark canvas
            it would only dim the artwork, so the overlay carries the panel's
            own grounding gradient instead. `opacity-0` at rest: it appears
            only when the intro's timeline fades it in. */}
        <div
          aria-hidden
          data-hero-01-overlay
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0"
        />
      </div>
    </section>
  );
}
