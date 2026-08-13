'use client';

/**
 * The homepage's creative-direction section: the film-roller piece with the
 * design pitch laid over it.
 *
 * The scene is `components/filmroller/` — a vendored three.js engine with a
 * plain-factory contract (`createFilmRoller` returns a handle or `null`; see
 * that file for what the port keeps and drops). This component is only the
 * mounting: it owns the section box, reads the palette off its own computed
 * style, wires the status readouts, and never lets the copy depend on the
 * canvas.
 *
 * IT LIVES MID-PAGE, and two decisions exist only because of that:
 *
 *  - THE ENGINE LOADS ON APPROACH, not on page load. three.js is the
 *    heaviest thing on the homepage and most visitors may never scroll here,
 *    so the dynamic import fires from a one-shot IntersectionObserver with a
 *    600px lead — by the time the section is on screen the drum is rolling,
 *    and a visitor who never comes never downloads it. The import must stay
 *    dynamic and inside this observer: statically imported, three.js lands on
 *    the hydration path and every whileInView observer below registers late.
 *  - INTERACTION IS SPLIT so the section can never trap the page.
 *    Hover-steering is free; wheel zoom and the speed/steer keys engage only
 *    once the canvas is CLICKED, and Escape releases (`filmroller/input.ts`
 *    documents the model; a section that captures the wheel on arrival is a
 *    section the page cannot scroll past). Touch keeps `pan-y`. The overlays
 *    are `pointer-events-none` so every pointer move lands on the canvas.
 *
 * COPY FIRST. Eyebrow, headline and lead render server-side in the same tree
 * whether WebGL exists, failed, or has not mounted (the `page-hero.tsx`
 * rule). When the factory returns `null` this is copy on charcoal and loses
 * nothing but the toy. The caption band below the canvas says why the
 * frames are blank — that line and the blank frames ship together.
 *
 * REDUCED MOTION uses motion's own `useReducedMotion`, not the safe hook, on
 * purpose: the value is a CONSTRUCTOR argument (`still`) consumed inside an
 * effect, the same shape as `page-hero.tsx`'s dot-matrix — it never reaches
 * the SSR markup. The allowlist test in `use-reduced-motion-safe.test.ts`
 * names this file for that reason. Under the preference the engine lays a
 * pre-rolled arc, renders one frame, and takes no input at all.
 */

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import type { FilmRollerHandle, FilmRollerStatus } from '@/components/filmroller/create-film-roller';
import type { FilmRollerPalette } from '@/components/filmroller/palette';
import { KineticText } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { BODY_S, DISPLAY_M, LEAD, MONO_STYLE } from './tokens';

/**
 * Token fallbacks for a render outside `[data-marketing-shell]` — these are
 * the token VALUES (globals.css), not a second palette. Change one there,
 * change it here.
 */
const FALLBACKS: FilmRollerPalette = {
  ground: '#0f0f12',
  raised: '#191a1d',
  paper: '#ffffff',
  ink: '#0f0f12',
  yellow: '#f8cd02',
};

function readPalette(element: HTMLElement): FilmRollerPalette {
  const style = getComputedStyle(element);
  const read = (token: string, fallback: string) =>
    style.getPropertyValue(token).trim() || fallback;
  return {
    ground: read('--fx-charcoal', FALLBACKS.ground),
    raised: read('--fx-charcoal-raised', FALLBACKS.raised),
    paper: read('--fx-white', FALLBACKS.paper),
    ink: read('--fx-charcoal', FALLBACKS.ink),
    yellow: read('--fx-yellow', FALLBACKS.yellow),
  };
}

export function FilmRollerStage({ lang }: { lang: Lang }) {
  const t = HOME[lang].design;
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<FilmRollerStatus | null>(null);
  // Touch gets its own hint — "click the floor" and "scroll zooms" describe
  // controls a phone does not have. Read post-mount and used only inside the
  // status-gated readout bar, which never server-renders, so the media query
  // can never disagree with SSR markup (the use-reduced-motion-safe lesson).
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: none), (pointer: coarse)');
    const sync = () => setCoarse(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let cancelled = false;
    let handle: FilmRollerHandle | null = null;

    const approach = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        approach.disconnect();
        void import('@/components/filmroller/create-film-roller').then((engine) => {
          if (cancelled) return;
          handle = engine.createFilmRoller({
            canvas,
            host: section,
            palette: readPalette(section),
            still: reduce === true,
            onStatus: setStatus,
          });
        });
      },
      // A 600px lead: the chunk downloads and the scene builds while the
      // visitor is still a section away, so arrival never shows a blank floor.
      { rootMargin: '600px 0px' },
    );
    approach.observe(section);

    return () => {
      cancelled = true;
      approach.disconnect();
      handle?.destroy();
    };
  }, [reduce]);

  return (
    <div className="border-y border-[var(--fx-hairline)]">
      <section
        ref={sectionRef}
        className="relative isolate h-[86svh] min-h-[560px] overflow-hidden bg-[var(--fx-charcoal)]"
      >
        {/* The scene. Focusable on purpose — focus IS the engagement switch.
            `pan-y` keeps a touch swipe scrolling the page. */}
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label={t.canvasAria}
          className="absolute inset-0 h-full w-full [touch-action:pan-y] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--fx-yellow)]"
        />

        {/* The pitch, over the scene, pointer-transparent so every move
            still steers. Rendered whether or not the canvas draws. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <BlurRise>
              <Eyebrow>{t.eyebrow}</Eyebrow>
            </BlurRise>
            <Serif className={`mt-5 max-w-3xl ${DISPLAY_M} text-[var(--fx-white)]`}>
              <KineticText lines={[t.titleLead]} />
              <KineticText
                delay={0.18}
                lines={[t.titleAccent]}
                className="text-[var(--fx-yellow)]"
              />
            </Serif>
            <BlurRise delay={0.25}>
              <p className={`mt-6 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>{t.body}</p>
              <p
                style={MONO_STYLE}
                className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[var(--fx-faint)]"
              >
                {t.instructions}
              </p>
            </BlurRise>
          </div>
        </div>

        {/* Readouts. Decoration in the piece's own voice — the copy above and
            the aria-label carry the real information, so these stay hidden
            from readers and from pointers alike. */}
        {status ? (
          <div
            aria-hidden
            style={MONO_STYLE}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-6 px-5 pb-6 text-[10px] uppercase tracking-[0.22em] text-[var(--fx-faint)] sm:px-8 lg:px-10"
          >
            {/* Frame and speed stay off small screens: speed cannot change
                on touch anyway, and two wrapping mono lines are noise. */}
            <span className="hidden whitespace-nowrap sm:inline">
              {t.frameLabel} {String(status.frameIndex + 1).padStart(2, '0')} /{' '}
              {String(status.frameCount).padStart(2, '0')}
              <span className="mx-3 opacity-50">·</span>
              {t.speedLabel} {status.speed.toFixed(0)}
            </span>
            <span className={status.engaged && !coarse ? 'text-[var(--fx-muted)]' : undefined}>
              {coarse ? t.hintTouch : status.engaged ? t.hintEngaged : t.hintIdle}
            </span>
          </div>
        ) : null}

        {/* Fold the scene's bottom edge back into the page ground so the next
            block starts from charcoal, not from a lit floor cut mid-air. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-b from-transparent to-[var(--fx-charcoal)]"
        />
      </section>

      {/* The piece's caption: why the frames are empty. The same sentence of
          honesty /portfolio leads with, kept touching the thing it explains. */}
      <Band className="border-t border-[var(--fx-hairline)]">
        <BlurRise className="py-6">
          <p className={`max-w-2xl ${BODY_S} text-[var(--fx-muted)]`}>{t.framesNote}</p>
        </BlurRise>
      </Band>
    </div>
  );
}
