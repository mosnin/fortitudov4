'use client';

/**
 * The homepage hero — OriginKit `hero-19` ("Visionary" wellness hero),
 * ported to this site per the owner's instruction, replacing hero-23.
 *
 * WHAT SURVIVED THE DROP. The composition: the ceiling light rig
 * (`backdrop.tsx`, screen-blended exports), the photographed hand rising
 * from the bottom edge with its feathered mask, the arcs + film grain, the
 * bottom light bloom and warm haze, and the stage geometry with its
 * ipad/desktop-sm/ultrawide breakpoints. All of the baked light was
 * red-orange in the drop; every export is hue-shifted +38° into the
 * racing-yellow family (and the CSS bloom colours recomputed to match), so
 * the one light source in the scene is the brand's own — "tailored to our
 * color scheme", not grayscaled into a different picture.
 *
 * WHAT DID NOT, AND WHY:
 *  - The floating orb (particle sphere + mask group) — replaced by the
 *    site's own ParticleMark, the brand mark as a particle field, in the
 *    same slot above the palm. That swap is the owner's explicit spec.
 *  - Its nav, pill menu, and Sign in / Join Now — this site has a header.
 *  - The "trusted by" logo marquee and the wellness recommendation card —
 *    invented facts about somebody else's product; nothing on this site is
 *    invented. The badge carries the fixed-price promise instead.
 *  - The Google-Fonts import and the Instrument Serif face — no network
 *    fonts, and no serif on this surface; the display face is the site's.
 *
 * THE FIRST-LOAD REVEAL (hero-01) CARRIES OVER from hero-23: the stage is
 * the `data-hero-01-media` clip target, everything inside rides the
 * `.hero-01__image` scale layer, the yellow underlay shows through the
 * narrow window, and the headline/lead arrive via Text Reveal 01 at 2.24s.
 * Armed pre-hydration, never under reduced motion, once per JS lifetime.
 */

import { Fragment, useEffect, useRef } from 'react';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { BlurRise, PillGhost, PillPrimary } from '@/components/marketing/giga/primitives';
import { DISPLAY_XL, LEAD, MONO_STYLE } from '@/components/marketing/giga/tokens';
import { ParticleMark } from '@/components/marketing/giga/particle-mark';
import { Backdrop } from './backdrop';

function asset(file: string) {
  return `/originkit/hero-19/${file}`;
}

/** Feathers the hand's top and base into the backdrop (drop, verbatim). */
const HAND_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 7%, #000 20%, #000 86%, rgba(0,0,0,0.5) 95%, transparent 100%)';

/* The drop's bloom colours, hue-shifted with the artwork:
   rgba(180,52,26) → rgba(180,150,26); 39,7,1 → 39,31,1; 141,27,4 → 141,114,4. */
const BLOOM = 'rgba(180,150,26,0.1)';
const HAZE =
  'linear-gradient(178.552deg, rgba(39,31,1,0.2) 28.846%, rgba(141,114,4,0.2) 92.813%)';

const HERO01_ARM =
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!window.__fxHero01Played){document.documentElement.setAttribute('data-hero01','')}}catch(e){}";

/** Expansion lands at 1.4 − 0.1 + 1.65s on the resource timeline. */
const UNDERLAY_FADE_AT = 2.95;
/** The hero-01 resource's load delay for Text Reveal 01, verbatim. */
const TEXT_REVEAL_DELAY = 2.24;

export function Hero19({ lang }: { lang: Lang }) {
  const t = HOME[lang].hero;
  const sectionRef = useRef<HTMLElement>(null);

  // Hero 01 first-load reveal — same wiring the hero-23 host carried.
  useEffect(() => {
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
          gsap.set(underlay, { autoAlpha: 1 });
          gsap.to(underlay, {
            autoAlpha: 0,
            duration: 0.6,
            delay: UNDERLAY_FADE_AT,
            ease: 'power2.out',
          });
        }
      });
      document.documentElement.removeAttribute('data-hero01');
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <script dangerouslySetInnerHTML={{ __html: HERO01_ARM }} />
      {/* The yellow field the first-load clip window opens onto. */}
      <div
        aria-hidden
        data-hero-01-underlay
        className="absolute inset-0 bg-[var(--fx-yellow)]"
      />

      {/* The stage — the drop's <main>, and the intro's clip target. */}
      <div
        data-hero-01-media
        className="relative z-[1] min-h-dvh w-full overflow-hidden bg-[var(--fx-charcoal)]"
      >
        <div className="hero-01__image relative min-h-dvh">
          {/* Background runs edge to edge; the composition below is capped. */}
          <Backdrop />

          {/* Overlay wash across the bottom (drop, verbatim). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[38%] bg-linear-to-b from-transparent via-black/25 to-black/60 mix-blend-overlay"
          />

          {/* 402x874 stage — layers positioned against these coordinates. */}
          <div className="relative h-[874px] overflow-hidden ipad:h-[1133px] desktop-sm:h-dvh desktop-sm:min-h-[840px] ultrawide:mx-auto ultrawide:h-[1080px] ultrawide:max-w-[1920px]">
            {/* Copy block — the drop's headline slot, carrying this site's
                real copy: the fixed-price badge, the headline and lead
                (Text Reveal 01 owns their arrival), and the two CTAs. */}
            <div className="absolute top-[120px] left-1/2 z-30 flex w-full -translate-x-1/2 flex-col items-center gap-7 px-5 text-center ipad:top-[200px] desktop-sm:top-auto desktop-sm:bottom-33.5 desktop-sm:left-25 desktop-sm:w-auto desktop-sm:translate-x-0 desktop-sm:items-start desktop-sm:px-0 desktop-sm:text-left">
              <BlurRise trigger="load">
                <span className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]/80 px-3 py-2">
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

              <div className="flex flex-col items-center gap-4 desktop-sm:max-w-[560px] desktop-sm:items-start">
                <h1
                  data-reveal-01="lines"
                  className={`${DISPLAY_XL} text-[var(--fx-white)]`}
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
                  className={`max-w-xl ${LEAD} text-[var(--fx-muted)]`}
                >
                  {t.lead}
                </p>
              </div>

              <BlurRise trigger="load" delay={0.4}>
                <div className="flex flex-wrap items-center justify-center gap-3 desktop-sm:justify-start">
                  <PillPrimary href="/contact">{t.ctaPrimary}</PillPrimary>
                  <PillGhost href="/work">{t.ctaSecondary}</PillGhost>
                </div>
              </BlurRise>
            </div>

            {/* Arcs + film grain, mobile (drop, verbatim; art hue-shifted). */}
            <img
              aria-hidden
              src={asset('arcs-texture.png')}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 block size-full max-w-none object-cover mix-blend-screen ipad:opacity-80 desktop-sm:hidden"
            />

            {/* The mark, where the drop floated its orb: the brand as a
                particle field, hovering above the palm. Owner's spec —
                "replace the floating orb thing with this". ParticleMark
                parks off-screen and falls back to the static mark under
                reduced motion on its own. */}
            <div
              aria-hidden
              className="pointer-events-auto absolute top-[660px] left-1/2 z-10 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 ipad:top-[880px] ipad:h-[300px] ipad:w-[300px] desktop-sm:top-auto desktop-sm:bottom-[330px] desktop-sm:h-[340px] desktop-sm:w-[340px] desktop-sm:translate-y-0 ultrawide:bottom-[300px]"
            >
              <ParticleMark />
            </div>

            {/* Hand (drop, verbatim; art hue-shifted). */}
            <img
              aria-hidden
              src={asset('hand.png')}
              alt=""
              className="pointer-events-none absolute top-[calc(50%+255px)] left-[calc(50%-4px)] z-10 h-[410px] w-[738px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover ipad:top-[894px] ipad:left-1/2 ipad:h-[502px] ipad:w-[902px] desktop-sm:top-auto desktop-sm:bottom-0 desktop-sm:h-auto desktop-sm:w-[86vw] desktop-sm:min-w-[1239px] desktop-sm:origin-bottom desktop-sm:scale-115 desktop-sm:translate-y-0 ultrawide:top-[384px] ultrawide:bottom-auto ultrawide:w-[1180px] ultrawide:min-w-0 ultrawide:scale-100"
              style={{
                maskImage: HAND_MASK,
                WebkitMaskImage: HAND_MASK,
              }}
            />

            {/* Bottom light bloom (drop geometry, brand-shifted colour). */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[-35.15px] left-[68.62px] z-0 h-[51.15px] w-[342.55px] blur-[18.083px] ipad:bottom-[-20.15px] ipad:left-[188.62px] desktop-sm:bottom-[-29px] desktop-sm:left-[calc(50%-81.5px)] desktop-sm:h-[99px] desktop-sm:w-[663px] desktop-sm:-translate-x-1/2 desktop-sm:blur-[35px]"
            >
              <div
                className="absolute inset-0 backdrop-blur-[25.833px] desktop-sm:backdrop-blur-[50px]"
                style={{ backgroundColor: BLOOM }}
              />
            </div>

            {/* Warm haze over the wrist (drop geometry, brand-shifted). */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[-29px] left-[calc(50%-51.5px)] z-20 hidden h-[99px] w-[663px] -translate-x-1/2 blur-[35px] desktop-sm:block"
            >
              <div
                className="absolute inset-0 backdrop-blur-[53.5px]"
                style={{ backgroundImage: HAZE }}
              />
            </div>
          </div>
        </div>

        {/* hero-01's overlay: same node, timing and autoAlpha; the fill is
            the panel's grounding gradient (a flat 40% black would only dim
            artwork that is already dark). opacity-0 until the intro plays. */}
        <div
          aria-hidden
          data-hero-01-overlay
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0"
        />
      </div>
    </section>
  );
}
