'use client';

/**
 * Global reach — the particle-globe band.
 *
 * Ported from the OriginKit `hero-33` drop (a ruled white sheet with a blue
 * particle globe rising out of its bottom edge, a headline, a plate button and
 * four figures). What survived the port is the BEHAVIOUR: the same WebGL point
 * cloud, the same rotation, drag-and-throw, cursor repulsion and click scatter,
 * driven with the reference's own settings. Everything else is ours.
 *
 * What was replaced, and why:
 *
 *  - **Palette.** The drop was `#edeff3` sheet, `#f3f4f7` cells, black rules
 *    with a white bevel and a `#167bde` globe over three `#1d73c9` washes. Not
 *    one of those hexes is left. Ground is `--fx-charcoal`, structure is
 *    `--fx-hairline`, the cells are `--fx-charcoal-deep`, and the globe and its
 *    glow are `--fx-yellow`. The particle colour is READ OFF THE DOM at mount
 *    (`getComputedStyle`) rather than hardcoded, because WebGL needs a literal
 *    — so the globe follows the `[data-fx-tone="light"]` inversion the way
 *    every other element on this surface does, instead of being the one thing
 *    that stays yellow when the ground turns yellow.
 *  - **Type.** `font-tight` (Inter Tight) is gone, along with the drop's raw
 *    `text-[35px]/[48px]/[28px]/[22px]` clamps. The headline is `<Serif>` — the
 *    display sans — at `DISPLAY_M`, card heads at `TITLE_S`, labels at
 *    `EYEBROW_TEXT`. There is no serif on this surface and no second face.
 *  - **Corners.** `rounded-[12px]` button → the kit's squared controls.
 *  - **Breakpoints.** `ipad:` / `desktop-sm:` / `ultrawide:` and the CLI's
 *    `originkit-section-theme*.css` are not depended on at all; this file uses
 *    Tailwind's defaults only, so it survives those files being deleted.
 *  - **The stats row.** The drop shipped "145+", "$1.6T+", "99.99%", "250M+".
 *    Fortitudo publishes no metrics, and this site was cleared of exactly that
 *    kind of filler. The row keeps its shape and its numbers are gone: what is
 *    left is three things that are true and checkable in this repo — see
 *    `FACTS` below, each with its source named.
 *  - **The grain PNG and the engraved white bevel.** Deleted. The bevel only
 *    reads as engraving on a near-white sheet; on charcoal it is a seam.
 *
 * Copy lives in this file, not in `src/lib/i18n/dictionaries/`, because the
 * dictionaries are mid-refactor in a parallel branch. It is keyed by `Lang`
 * exactly like `HOME` is, so extracting it later is a move, not a rewrite.
 */

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import ParticleSphere from '@/components/originkit/ui/hero-33/particle-sphere';
import type { Lang } from '@/lib/i18n/markets';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from './primitives';
import { DISPLAY_M, EYEBROW_TEXT, MONO_STYLE, SECTION_Y, TITLE_S } from './tokens';

/* ── Copy ────────────────────────────────────────────────────────────────── */

type Fact = { label: string; title: string; body: string };
type Copy = {
  eyebrow: string;
  heading: string;
  lead: string;
  cta: string;
  factsLabel: string;
  facts: Fact[];
};

/**
 * Three facts, no figures we cannot point at.
 *
 *  1. Money used to read "prices in 11 currencies", pointing at our own
 *     pricing page, which rendered its figures in the visitor's currency. The
 *     site advertises no prices now, so that claim would be about a page that
 *     no longer does it. What is left is the thing we actually build for a
 *     client: a checkout that takes the money their customers hold. Sourced to
 *     the `Currency` union in `src/lib/i18n/markets.ts` and the geo resolution
 *     in `src/proxy.ts`.
 *  2. One build, many languages is the shape of `src/lib/i18n/` itself — copy
 *     is a dictionary, not a second site. It deliberately does NOT claim the
 *     pages are translated today; they are not (see copy.md).
 *  3. Handover is the promise the FAQ and the numbers band already make.
 *
 * No country is named and no client is implied. We sell what the build can do,
 * which is the only thing here we can stand behind.
 */
const EN: Copy = {
  eyebrow: 'Global reach',
  heading: 'Reach your customers globally.',
  lead:
    'The web has no borders. What loses the sale is smaller than that: the wrong language, a price in money they do not use, a form that will not take their address. We build for that on day one, so a customer three time zones away gets the same site you do.',
  cta: 'Tell us what you need',
  factsLabel: 'What that means in practice',
  facts: [
    {
      label: 'Money',
      title: 'They pay in their own money',
      body:
        'We build your checkout to read where a customer is and price in the money they hold. What their card is charged in, we say on the page.',
    },
    {
      label: 'Language',
      title: 'One site, more than one language',
      body:
        'The words swap. The build stays the same. No second site to keep in sync, and no plugin to babysit.',
    },
    {
      label: 'Ownership',
      title: 'You own all of it',
      body:
        'Code, domains and accounts are yours the day it goes live — in every market you decide to open.',
    },
  ],
};

/** English is the only written language (copy.md); the keys exist so this
 *  lifts into the dictionaries unchanged, the way `HOME` does. */
const COPY: Record<Lang, Copy> = { en: EN, es: EN, ru: EN };

/* ── The ruled sheet ─────────────────────────────────────────────────────── */

/**
 * The drop's engraved grid, rebuilt out of our hairline.
 *
 * Its version was a dark rule plus a hard WHITE one every 65.5px — the bevel
 * that made the rules read as cut into a near-white sheet. On charcoal that
 * white line is just a bright seam, so the bevel is dropped and the rule is the
 * token, once. The cell is 64px rather than 65.5 for the same reason the rest
 * of the surface uses round numbers.
 */
const CELL = '64px';
const RULED =
  `repeating-linear-gradient(to right, var(--fx-hairline) 0 1px, transparent 1px ${CELL}), ` +
  `repeating-linear-gradient(to bottom, var(--fx-hairline) 0 1px, transparent 1px ${CELL})`;

/** The grid dissolves before it reaches the headline — structure under the
 *  visual, clean charcoal under the words. The `black` here is a MASK alpha,
 *  not a colour: nothing on this surface paints black, and nothing is painted
 *  by this value at all. */
const GRID_FADE = 'linear-gradient(to bottom, transparent 0%, black 42%, black 100%)';

/** Rail insets match `Band`'s gutters, so the two hairlines land on the edge of
 *  the copy rather than near it. */
const RAIL_INSET = 'left-5 right-5 sm:left-8 sm:right-8 lg:left-10 lg:right-10';

function RuledSheet() {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-0 ${RAIL_INSET}`}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: RULED,
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
        }}
      />
      <span className="absolute inset-y-0 left-0 w-px bg-[var(--fx-hairline)]" />
      <span className="absolute inset-y-0 right-0 w-px bg-[var(--fx-hairline)]" />
    </div>
  );
}

/* ── The globe ───────────────────────────────────────────────────────────── */

/**
 * The reference's cursor radius and the globe size it was tuned at.
 * `cursorRadiusUI` is not a ratio — the engine clamps it to 0–600 and spends it
 * as raw canvas pixels — so a fixed 75 shrinks as a share of a bigger sphere
 * until the repulsion is there in the numbers and invisible on screen. Scaled
 * off the measured box, exactly as the drop did.
 */
const NATIVE_GLOBE = 760;
const NATIVE_CURSOR_RADIUS = 75;

/** The token's own value, for the frame before the DOM can be read and for the
 *  (impossible in practice) case where the section renders outside the
 *  marketing shell. It tracks `--fx-yellow` in globals.css — change together. */
const YELLOW_FALLBACK = '#f8cd02';

/**
 * The globe, cut by the foot of the section.
 *
 * The stage is a window; the sphere's own box is a square hung from the top of
 * it and far taller than it, so what shows is the crest and the shoulders and
 * the rest falls past the section's bottom edge — the reference's horizon,
 * without needing the reference's `--section-h` arithmetic, because our section
 * is laid out in flow rather than pinned to the viewport.
 *
 * `overflow-hidden` on the stage is load-bearing twice over: the engine builds
 * a canvas 2.5x its container and lets it overflow, which unclipped would reach
 * up over the copy AND swallow its clicks. Clipping is also what draws the
 * horizon.
 *
 * Three things are deliberate about the interaction:
 *  - The sphere is mounted only when the section is within 400px of the
 *    viewport. A WebGL context and 10,000 particles are not worth spinning up
 *    for a visitor who never scrolls this far.
 *  - Cursor repulsion is enabled on fine pointers only. Its touch handlers
 *    `preventDefault()` on `touchmove`, which on a phone means a full-width
 *    band the page cannot be scrolled through. Rotation still runs there.
 *  - `prefers-reduced-motion` stops the unprompted spin and the cursor
 *    repulsion, and keeps everything else: the full lit sphere renders, and a
 *    drag — motion the visitor asked for — still turns it.
 */
function GlobeStage() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  /** Null until the section is near the viewport: the gate AND the colour. */
  const [particleColor, setParticleColor] = useState<string | null>(null);
  const [globeWidth, setGlobeWidth] = useState(NATIVE_GLOBE);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resolve = () => {
      const token = getComputedStyle(stage).getPropertyValue('--fx-yellow').trim();
      setParticleColor(token || YELLOW_FALLBACK);
    };

    if (typeof IntersectionObserver === 'undefined') {
      resolve();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          resolve();
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFinePointer(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    setGlobeWidth(Math.round(globe.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) =>
      setGlobeWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(globe);
    return () => observer.disconnect();
  }, []);

  const cursorRadius = Math.min(
    600,
    Math.round((NATIVE_CURSOR_RADIUS * Math.max(globeWidth, NATIVE_GLOBE)) / NATIVE_GLOBE),
  );
  const cursorOn = finePointer && !reduce;

  return (
    <div
      ref={stageRef}
      aria-hidden
      className="relative mt-16 h-[clamp(210px,28vw,360px)] overflow-hidden sm:mt-24"
    >
      {/* The light under the globe. The reference threw three blurred blue
          ellipses; one yellow wash does the same job here, kept low enough that
          the band still reads charcoal — the accent is a light source, not a
          second surface competing with the page's one yellow button. */}
      <div
        className="absolute bottom-0 left-1/2 h-[85%] w-[min(1180px,150%)] -translate-x-1/2 translate-y-1/4 rounded-[50%] opacity-20 blur-3xl"
        style={{
          backgroundImage:
            'radial-gradient(50% 50% at 50% 50%, var(--fx-yellow) 0%, transparent 72%)',
        }}
      />

      <div
        ref={globeRef}
        className="absolute top-10 left-1/2 aspect-square w-[min(760px,100%)] -translate-x-1/2"
      >
        {particleColor ? (
          <ParticleSphere
            particlesCount={10000}
            particleScale={5}
            rotationDirection="clockwise"
            autoRotate={!reduce}
            speed={20}
            scale={10}
            drag
            smoothing={7}
            dragSpeed={5}
            stopOnHover={false}
            cursorOn={cursorOn}
            cursorRadiusUI={cursorRadius}
            cursorStrengthUI={10}
            clickForce={5}
            sphereColor={particleColor}
          />
        ) : null}
      </div>
    </div>
  );
}

/* ── The section ─────────────────────────────────────────────────────────── */

export function GlobalReach({ lang = 'en' }: { lang?: Lang }) {
  const t = COPY[lang];

  return (
    <section
      /* `pb-0 sm:pb-0` against SECTION_Y on purpose: the globe is cut by the
         foot of the section, so the foot has to be a real edge, and the top
         step still comes from the token rather than from a number written here.
         The breakpoint copy is not redundant — SECTION_Y's `sm:py-32` lives in a
         media block that is emitted after the base rules, so a lone `pb-0` would
         be overridden from `sm` up and the horizon would float. */
      className={`relative isolate overflow-hidden border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y} pb-0 sm:pb-0`}
    >
      <RuledSheet />

      <Band className="relative z-10">
        <div className="max-w-2xl">
          <BlurRise>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </BlurRise>

          <BlurRise delay={0.06}>
            <Serif as="h2" className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              {t.heading}
            </Serif>
          </BlurRise>

          <BlurRise delay={0.12}>
            <p className="mt-5 max-w-[65ch] text-[15px] leading-relaxed text-[var(--fx-muted)] sm:text-[16px]">
              {t.lead}
            </p>
            {/* Ghost, not yellow. The globe is this band's accent, and the page
                gets one yellow button — see design.md. */}
            <PillGhost href="/contact" className="mt-8" withArrow>
              {t.cta}
            </PillGhost>
          </BlurRise>
        </div>

        <BlurRise delay={0.16} className="mt-14">
          <p style={MONO_STYLE} className={EYEBROW_TEXT}>
            {t.factsLabel}
          </p>
          {/* The reference's figures row, keeping its rail-to-rail band and its
              alternating cell fill, with the invented numbers taken out. */}
          <div className="mt-4 overflow-hidden rounded-[6px] border border-[var(--fx-hairline)]">
            <div className="grid grid-cols-1 gap-px bg-[var(--fx-hairline)] sm:grid-cols-3">
              {t.facts.map((fact) => (
                <div
                  key={fact.title}
                  /* Stays dark if this band is ever placed inside the
                     `[data-fx-tone="light"]` half of a page. */
                  data-fx-surface="dark"
                  className="bg-[var(--fx-charcoal-deep)] p-6 sm:p-7"
                >
                  <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                    {fact.label}
                  </p>
                  <Serif as="h3" className={`mt-4 ${TITLE_S} text-[var(--fx-white)]`}>
                    {fact.title}
                  </Serif>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--fx-muted)]">
                    {fact.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </BlurRise>

        {/* Last child of the band, and the band is the last thing in the
            section — so the stage's bottom edge IS the section's, which is the
            cut the globe is composed against. */}
        <GlobeStage />
      </Band>
    </section>
  );
}

export default GlobalReach;
