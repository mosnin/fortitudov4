'use client';

/**
 * Currency ring — the OriginKit `hero-04` orbit mechanic, rebuilt for this
 * surface.
 *
 * WHAT CAME FROM THE DROP. The mechanic, and only the mechanic: a ring of
 * cards that orbits on its own, can be grabbed and thrown, carries momentum
 * when released, and resumes spinning afterwards; cards at the front of the
 * ring are larger, brighter and stacked above the ones behind them. That
 * behaviour is reproduced here (see `CurrencyOrbit`), not simplified away.
 *
 * WHAT DID NOT. The drop was a music-streaming hero: deep red `#901214`,
 * Instrument Serif at 66px, `font-tight`, a vinyl disc, a grain-textured
 * background, its own navbar, and — the part that mattered — a ring driven by
 * `DEFAULT_IMAGES`, i.e. artist photography. This site has no photography and
 * does not invent any, so the cards hold DATA instead: the display currencies
 * the site actually resolves visitors to.
 *
 * WHY THAT IS HONEST. The ring is not decoration standing in for a claim. Its
 * contents are the real list — derived from the pinned-rate table, which is
 * typed `Record<Currency, number>` against `lib/i18n/markets.ts` and checked by
 * `markets.test.ts`. Add a currency to the market registry and this ring gains
 * it; there is no second copy to drift. The counts under the headline are
 * `.length` of those same arrays, so the section cannot overstate them.
 *
 * The section says nothing about who our clients are or where they are. The
 * claim is about what we build.
 *
 * COLOUR. Two, and both from the `--fx-*` block: racing yellow and charcoal.
 * Cards are `--fx-charcoal-raised` with a `--fx-hairline` edge on the charcoal
 * ground; `--fx-yellow` marks exactly one card — the currency this visitor is
 * actually being shown — and nothing else in the section is yellow, so it does
 * not compete with the page's call to action. Ink on that one yellow card is
 * `--fx-on-yellow`, the palette's designated ink for a yellow surface. There is
 * no per-currency colour: eleven hues would turn the one accent into noise.
 * Nothing here is a flat black, shadows included.
 *
 * TYPE. One family. Headline through `<Serif>` (which renders the display sans
 * off `--font-title`), codes and captions in the shared `MONO_STYLE`. The
 * drop's `font-instrument-serif` and `font-tight` are gone with the CSS that
 * declared them; this file depends on nothing from `originkit-section-theme*`.
 *
 * Intended home: `/pricing`, below the quote cards — "prices in your own
 * money" only means something next to prices. It is exported and not mounted
 * anywhere yet.
 *
 * COPY: strings are local on purpose. `lib/i18n/dictionaries/` is mid-refactor;
 * these want extracting into it (marked `// i18n:` below) once it settles.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion, type MotionValue } from 'motion/react';
import { cn } from '@/lib/utils';
import { LANGS, LANG_TAG, type Currency, type Lang } from '@/lib/i18n/markets';
import { PINNED_USD_RATES } from '@/lib/i18n/currency';
import { useDisplayCurrency } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_S, EYEBROW_TEXT, MONO_STYLE, SECTION_Y } from './tokens';

/**
 * The ring's contents, derived — never typed by hand.
 *
 * `markets.ts` keeps its `CURRENCIES` array private (only the `Currency` union
 * and `isCurrency` are exported), so the exhaustive list we can legally read is
 * the pinned-rate table: it is declared `Record<Currency, number>`, which means
 * a new currency in the union is a type error until the table gains it, and
 * `markets.test.ts` asserts the two agree in both directions. Reading the keys
 * here is therefore the same list, one hop away, with the compiler and a test
 * holding it in place.
 */
const RING_CURRENCIES = Object.keys(PINNED_USD_RATES) as Currency[];

/* ── Orbit geometry ───────────────────────────────────────────────────────
 *
 * A circle drawn in perspective is an ellipse, so the ring is `rx` wide and
 * `ry` tall with `ry` about a third of `rx` — that ratio IS the tilt. Depth
 * then comes from `sin(angle)`: +1 at the front of the ring (nearest the
 * reader, drawn low), -1 at the back. Cards scale, fade and stack along it.
 *
 * The drop hard-coded three copies of the stage at three breakpoints — two of
 * which were the CLI's `ipad`/`desktop-sm` at 768/1280px, and ours are 48rem
 * and 64rem. Rather than re-tune numbers against different breakpoints, the
 * stage measures itself and derives its geometry from its own width, so there
 * is nothing to re-check.
 */

/** Seconds for one full revolution. Slow: it is a background rhythm. */
const ORBIT_SECONDS = 34;
/** -1 anticlockwise, matching the reference. */
const ORBIT_DIRECTION = -1;

/** Text never drops below this. `--fx-muted` (0.58) is the contrast floor for
 *  anything meaningful, and a currency code is meaning, not decoration. */
const MIN_DEPTH_OPACITY = 0.65;

interface Geometry {
  rx: number;
  ry: number;
  cardW: number;
  cardH: number;
  boxH: number;
  codeSize: number;
}

function geometryFor(width: number): Geometry {
  const w = width || 640;
  const cardW = Math.round(Math.min(120, Math.max(74, w * 0.155)));
  const cardH = Math.round(cardW * 0.46);
  const rx = Math.max(80, (w - cardW) / 2 - 4);
  const ry = Math.round(rx * 0.36);
  return {
    rx,
    ry,
    cardW,
    cardH,
    boxH: Math.round(ry * 2 + cardH * 1.5 + 12),
    codeSize: Math.round(Math.min(17, Math.max(12, cardW * 0.19))),
  };
}

interface Placement {
  transform: string;
  opacity: number;
  zIndex: number;
}

/** Where card `index` sits when the ring is at `angle`. Pure, so the first
 *  server-rendered paint is already a ring rather than a stack. */
function placementFor(
  index: number,
  count: number,
  angle: number,
  { rx, ry }: Pick<Geometry, 'rx' | 'ry'>,
): Placement {
  const at = angle + (index * Math.PI * 2) / count;
  const depth = Math.sin(at);
  const front = (depth + 1) / 2;
  const x = Math.cos(at) * rx;
  const y = depth * ry;
  const scale = 0.68 + 0.32 * front;
  return {
    transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`,
    opacity: MIN_DEPTH_OPACITY + (1 - MIN_DEPTH_OPACITY) * front,
    zIndex: 100 + Math.round(front * 100),
  };
}

/** One continuous revolution. `repeat: Infinity` over a +2π target reads as an
 *  unbroken turn because the ring's geometry is periodic — the value resets to
 *  where it started and nothing on screen moves at the seam. */
function startOrbit(value: MotionValue<number>) {
  return animate(value, value.get() + Math.PI * 2 * ORBIT_DIRECTION, {
    duration: ORBIT_SECONDS,
    ease: 'linear',
    repeat: Infinity,
  });
}

/** The stage's own width, so geometry follows the container instead of a
 *  breakpoint table. */
function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    // A measurement is enough on its own; the observer only keeps it honest
    // through resizes. Guarded so a browser (or a test environment) without
    // ResizeObserver gets a correctly sized ring rather than a thrown effect.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* ── The orbit ────────────────────────────────────────────────────────────── */

/**
 * The mechanic, intact: continuous rotation, grab-to-spin, momentum on
 * release, and front-of-ring focus.
 *
 * Reduced motion stops the ring SPINNING ITSELF — it does not take the ring
 * away. A visitor who has asked for less motion can still grab it and turn it,
 * because that motion is theirs; what it loses is the automatic revolution and
 * the momentum coast, which are the parts nobody asked for.
 */
function CurrencyOrbit({
  currencies,
  active,
}: {
  currencies: readonly Currency[];
  active: Currency;
}) {
  const reduce = useReducedMotion();
  const [stageRef, width] = useMeasuredWidth<HTMLDivElement>();
  const geometry = useMemo(() => geometryFor(width), [width]);

  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const angle = useMotionValue(0);
  const playback = useRef<{ stop: () => void } | null>(null);

  const dragging = useRef(false);
  const dragStartAngle = useRef(0);
  const dragStartPointer = useRef(0);
  const velocity = useRef(0);
  const lastMoveAt = useRef(0);

  /** Held in a ref so the drag handlers read the CURRENT setting rather than
   *  the one captured when they were created. */
  const live = useRef(reduce);
  useEffect(() => {
    live.current = reduce;
  }, [reduce]);

  /* Position every card whenever the angle moves. Direct style writes rather
     than React state: this runs at 60fps and a re-render per frame for eleven
     absolutely-positioned nodes is exactly the wrong trade. */
  useEffect(() => {
    const place = (current: number) => {
      const count = currencies.length;
      for (let i = 0; i < count; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const { transform, opacity, zIndex } = placementFor(i, count, current, geometry);
        el.style.transform = transform;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(zIndex);
      }
    };
    place(angle.get());
    return angle.on('change', place);
  }, [angle, currencies.length, geometry]);

  /* The automatic revolution. Stopped outright — not slowed — under reduced
     motion, which is the whole point of the setting. */
  useEffect(() => {
    if (reduce) return;
    playback.current?.stop();
    playback.current = startOrbit(angle);
    return () => playback.current?.stop();
  }, [angle, reduce]);

  /** Resume the revolution after a drag (or after a throw has run down). */
  const spin = () => {
    if (live.current || dragging.current) return;
    playback.current?.stop();
    playback.current = startOrbit(angle);
  };

  const pointerAngle = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2),
    );
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    playback.current?.stop();
    dragStartAngle.current = angle.get();
    dragStartPointer.current = pointerAngle(event);
    velocity.current = 0;
    lastMoveAt.current = performance.now();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dt = now - lastMoveAt.current;
    lastMoveAt.current = now;

    const swept = pointerAngle(event) - dragStartPointer.current;
    const target = dragStartAngle.current + swept;
    if (dt > 0) velocity.current = (target - angle.get()) / dt;
    angle.set(target);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // The throw. Under reduced motion the ring simply stops where it was left:
    // a coast is animation the visitor did not ask to keep watching.
    if (!live.current && Math.abs(velocity.current) > 0.03) {
      playback.current = animate(angle, angle.get(), {
        type: 'inertia',
        velocity: velocity.current * 1000,
        power: 0.8,
        timeConstant: 700,
        restDelta: 0.01,
        onComplete: spin,
      });
      return;
    }
    spin();
  };

  return (
    <div
      ref={stageRef}
      className="relative w-full cursor-grab select-none active:cursor-grabbing"
      style={{ height: geometry.boxH, touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* i18n: label */}
      <ul
        aria-label="Currencies this site shows prices in"
        className="absolute left-1/2 top-1/2 h-px w-px list-none"
      >
        {currencies.map((code, index) => {
          const placement = placementFor(index, currencies.length, 0, geometry);
          const isActive = code === active;
          return (
            <li
              key={code}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="absolute left-0 top-0 will-change-transform"
              style={{
                width: geometry.cardW,
                height: geometry.cardH,
                transform: placement.transform,
                opacity: placement.opacity,
                zIndex: placement.zIndex,
              }}
            >
              {/* The card is a real surface, not floating text — the tilt is
                  only legible if the thing being tilted has an edge. Charcoal
                  raised + hairline on the charcoal ground; the visitor's own
                  currency takes the yellow SURFACE with black ink, which is
                  the palette's one rule and the section's one accent. */}
              <span
                className={cn(
                  'flex h-full w-full items-center justify-center rounded-[4px] border tracking-[0.14em]',
                  isActive
                    ? 'border-[var(--fx-yellow)] bg-[var(--fx-yellow)] text-[var(--fx-on-yellow)]'
                    : 'border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] text-[var(--fx-white)]',
                )}
                style={{
                  ...MONO_STYLE,
                  fontSize: geometry.codeSize,
                  // Depth, drawn in the palette: the deep charcoal, never a
                  // black shadow. Two colours on this surface and this is not
                  // an exception to them.
                  boxShadow: '0 12px 28px -8px var(--fx-charcoal-deep)',
                }}
              >
                {code}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

/** The visitor's currency written out, in the language they are reading.
 *  Falls back to the bare code where ICU data is missing. */
function currencyName(code: Currency, lang: Lang): string | null {
  try {
    const name = new Intl.DisplayNames([LANG_TAG[lang]], { type: 'currency' }).of(code);
    return name && name !== code ? name : null;
  } catch {
    return null;
  }
}

export function CurrencyRing({ lang = 'en' }: { lang?: Lang }) {
  // Server render (and any visitor we cannot place) is USD — the honest
  // fallback, same as every other price on this surface.
  const currency = useDisplayCurrency();
  const name = currencyName(currency, lang);

  return (
    <Band className={SECTION_Y}>
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-20">
        <BlurRise>
          {/* i18n: eyebrow */}
          <Eyebrow>Local prices</Eyebrow>

          {/* i18n: headline */}
          <Serif as="h2" className={cn(DISPLAY_S, 'mt-5 text-[var(--fx-white)]')}>
            Your customers see prices in their own money.
          </Serif>

          {/* i18n: body. "This page" is literal — the section belongs on
              /pricing, and the claim is checkable by reloading it. */}
          <p className="mt-6 max-w-[65ch] text-[15px] leading-relaxed text-[var(--fx-muted)] sm:text-base">
            This page does it. Open it in Mexico City and the price reads in pesos. Open it
            in Berlin and it reads in euros. One price list, read in the money your customer
            thinks in. We build that into what we make for you.
          </p>

          {/* The honest half, and it is not fine print: we DISPLAY in local
              money and CHARGE in dollars. Same meaning as
              `PRICING_DICTS.billedInUsdNote`, which says it under the prices. */}
          {/* i18n: disclosure */}
          <p className="mt-4 max-w-[65ch] text-[15px] leading-relaxed text-[var(--fx-muted)] sm:text-base">
            We charge in US dollars. Your bank sets the final amount.
          </p>

          {/* Counts are `.length` of the real arrays — they cannot drift and
              they cannot overstate. No claim is made about where clients are. */}
          <p
            style={MONO_STYLE}
            className={cn(EYEBROW_TEXT, 'mt-8 flex flex-wrap items-center gap-x-3 gap-y-2')}
          >
            {/* i18n: counts */}
            <span>{RING_CURRENCIES.length} currencies</span>
            <span aria-hidden className="text-[var(--fx-faint)]">
              ·
            </span>
            <span>{LANGS.length} languages</span>
            <span aria-hidden className="text-[var(--fx-faint)]">
              ·
            </span>
            <span>One price list</span>
          </p>
        </BlurRise>

        <div>
          <CurrencyOrbit currencies={RING_CURRENCIES} active={currency} />
          {/* i18n: caption. Reads USD until the currency cookie is known, then
              names what this visitor is actually being shown. */}
          {/* Left, like everything else on this surface — a centred caption
              under a symmetric object is still the drift design.md names. */}
          <p style={MONO_STYLE} className={cn(EYEBROW_TEXT, 'mt-6')}>
            You are seeing {currency}
            {name ? ` — ${name}` : ''}
          </p>
        </div>
      </div>
    </Band>
  );
}
