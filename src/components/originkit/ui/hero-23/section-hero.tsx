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

import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import { KineticText } from '@/components/marketing/giga/motion-kit';
import { BlurRise, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { DISPLAY_XL, LEAD, MONO_STYLE } from '@/components/marketing/giga/tokens';
import Globe from './globe';
import Stardust from './stardust';

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

  return (
    <section className="px-4 pt-4 sm:px-6 sm:pt-6">
      {/* The framed panel — the drop's signature chrome. */}
      <div className="relative overflow-hidden border border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]">
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

          <Serif as="h1" className={`mt-7 max-w-4xl ${DISPLAY_XL} text-[var(--fx-white)]`}>
            <KineticText trigger="load" delay={0.12} lines={t.headlineLines} />
          </Serif>

          <BlurRise trigger="load" delay={0.4}>
            <p className={`mx-auto mt-6 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>{t.lead}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <PillPrimary href="/contact" withArrow>
                {t.ctaPrimary}
              </PillPrimary>
              <PillGhost href="/portfolio">{t.ctaSecondary}</PillGhost>
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
    </section>
  );
}
