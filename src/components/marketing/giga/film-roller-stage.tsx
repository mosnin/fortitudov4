'use client';

/**
 * The homepage's creative-direction section: the film-roller piece on a
 * racing-yellow ground, with the design pitch above it.
 *
 * The scene is `components/filmroller/` — a vendored three.js engine with a
 * plain-factory contract (`createFilmRoller` returns a handle or `null`).
 * This component is only the mounting: it owns the boxes, reads the palette
 * off its own computed style, wires the readouts, and never lets the copy
 * depend on the canvas.
 *
 * YELLOW VIA THE TONE SCOPE, NOT BY HAND. The section carries
 * `data-fx-tone="light"`, the same inversion the testimonials below it live
 * in — so `--fx-charcoal` resolves to yellow, ink and hairlines flip, and
 * the engine's palette (read off this very element) inherits the flip for
 * free: yellow floor, near-black film carrier, ink keylines. The one token
 * that must NOT come from the scope is the frames' paper (`--fx-white` is
 * ink here), so paper stays a literal white. The scope's own rule holds for
 * the art too: the photographs in the frames are monochrome
 * (`filmroller/frames.ts` explains), because no third hue joins yellow and
 * ink on this surface.
 *
 * STACKED, NOT OVERLAID. The first cut floated the copy over the canvas and
 * the drum rolled straight through the lead on phones — text riding the
 * piece. Copy now sits in normal flow above its own canvas band; the only
 * things inside the canvas are the piece's own readouts, pinned to its
 * bottom corners. Nothing can collide with anything at any width.
 *
 * MID-PAGE RULES (unchanged): the engine chunk dynamic-imports from a
 * one-shot IntersectionObserver with a 600px lead, so three.js never sits on
 * the hydration path and never downloads for a visitor who stops scrolling
 * early. Hover (or touch-drag) steering is free; wheel zoom and keys engage
 * only once the canvas is clicked, Escape releases, touch keeps `pan-y` —
 * the section can never trap the page. When nobody steers for a beat, the
 * drum wanders on its own (`create-film-roller.ts`), so the piece is alive
 * before the first pointer arrives.
 *
 * REDUCED MOTION uses motion's own `useReducedMotion`, not the safe hook, on
 * purpose: the value is a CONSTRUCTOR argument (`still`) consumed inside an
 * effect, the same shape as `page-hero.tsx`'s dot-matrix — it never reaches
 * the SSR markup. The allowlist test in `use-reduced-motion-safe.test.ts`
 * names this file for that reason.
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

/** The four monochrome stock frames (`public/filmroller/`, sourced and
 *  licensed per the note in `filmroller/frames.ts`). */
const FRAME_ART = [
  '/filmroller/frame-01.jpg',
  '/filmroller/frame-02.jpg',
  '/filmroller/frame-03.jpg',
  '/filmroller/frame-04.jpg',
] as const;

/**
 * Token fallbacks for a render outside `[data-marketing-shell]` — these are
 * the LIGHT-scope token values from globals.css (this section lives inside
 * `data-fx-tone="light"`), not a second palette. Change one there, change it
 * here. `paper` is the exception documented above: a literal, never a token,
 * because the scope maps `--fx-white` to ink.
 */
const FALLBACKS: FilmRollerPalette = {
  ground: '#f8cd02',
  raised: '#191a1d',
  paper: '#ffffff',
  ink: '#0f0f12',
  yellow: '#0f0f12',
};

function readPalette(element: HTMLElement): FilmRollerPalette {
  const style = getComputedStyle(element);
  const read = (token: string, fallback: string) =>
    style.getPropertyValue(token).trim() || fallback;
  return {
    // Inside the light scope these resolve inverted: charcoal IS the yellow.
    ground: read('--fx-charcoal', FALLBACKS.ground),
    raised: read('--fx-charcoal-raised', FALLBACKS.raised),
    paper: FALLBACKS.paper,
    ink: read('--fx-white', FALLBACKS.ink),
    // The scope maps the accent to ink — its "no third hue" rule, which the
    // drum's index dot obeys like everything else.
    yellow: read('--fx-yellow', FALLBACKS.yellow),
  };
}

export function FilmRollerStage({ lang }: { lang: Lang }) {
  const t = HOME[lang].design;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

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
            host: stage,
            palette: readPalette(section),
            still: reduce === true,
            frameArtUrls: FRAME_ART,
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
    <section
      ref={sectionRef}
      data-fx-tone="light"
      /* No borders and no rules anywhere in this section: the canvas floor is
         painted with the exact ground token (scene.ts), so the scene and the
         section are one unbroken yellow surface — a hairline would put a seam
         back where one was deliberately removed. */
      className="bg-[var(--fx-charcoal)]"
    >
      {/* The pitch, in normal flow — nothing overlays the scene. Tokens here
          are already inverted by the scope: white is ink, yellow is ink. */}
      <Band className="pt-16 pb-10 sm:pt-20 sm:pb-12">
        <BlurRise>
          <Eyebrow>{t.eyebrow}</Eyebrow>
        </BlurRise>
        <Serif className={`mt-5 max-w-3xl ${DISPLAY_M} text-[var(--fx-white)]`}>
          <KineticText lines={[t.titleLead]} />
          <KineticText delay={0.18} lines={[t.titleAccent]} />
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
      </Band>

      {/* The scene's own band. Focusable on purpose — focus IS the engagement
          switch; `pan-y` keeps a touch swipe scrolling the page. */}
      <div ref={stageRef} className="relative isolate h-[56svh] min-h-[430px] overflow-hidden">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label={t.canvasAria}
          className="absolute inset-0 h-full w-full [touch-action:pan-y] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--fx-white)]"
        />

        {/* Readouts, pinned inside the scene band. Decoration in the piece's
            own voice — the copy above and the aria-label carry the real
            information, so these stay hidden from readers and pointers. */}
        {status ? (
          <div
            aria-hidden
            style={MONO_STYLE}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-6 px-5 pb-5 text-[10px] uppercase tracking-[0.22em] text-[var(--fx-faint)] sm:px-8 lg:px-10"
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
      </div>

      {/* The piece's caption: what the frames hold and what they are not.
          Same honesty /portfolio leads with, kept touching what it explains. */}
      <Band>
        <BlurRise className="pb-10 pt-2">
          <p className={`max-w-2xl ${BODY_S} text-[var(--fx-muted)]`}>{t.framesNote}</p>
        </BlurRise>
      </Band>
    </section>
  );
}
