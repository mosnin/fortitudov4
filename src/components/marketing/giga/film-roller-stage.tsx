'use client';

/**
 * The `/design` hero: the film-roller piece with the page's opening copy
 * laid over it.
 *
 * The scene is `components/filmroller/` — a vendored three.js engine with a
 * plain-factory contract (`createFilmRoller` returns a handle or `null`; see
 * that file for what the port keeps and drops). This component is only the
 * mounting: it owns the section box, reads the palette off its own computed
 * style, wires the status readouts, and never lets the copy depend on the
 * canvas.
 *
 * INTERACTION SPLIT (the part a maintainer must not "fix"): hover-steering is
 * free, but wheel zoom and the keys only work after the visitor clicks the
 * canvas. `filmroller/input.ts` documents why — a section that captures the
 * wheel on arrival is a section the page cannot scroll past. The overlays are
 * `pointer-events-none` to a fault so every pointer move lands on the canvas
 * underneath; only the CTA link below the lead takes clicks back.
 *
 * COPY FIRST. The eyebrow, headline, lead and CTAs render server-side in the
 * same tree whether WebGL exists, failed, or has not mounted — the exact
 * `page-hero.tsx` rule. When `createFilmRoller` returns `null` the section is
 * copy on charcoal and loses nothing but the toy.
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
import { DESIGN_PAGE } from '@/lib/i18n/dictionaries/design-page';
import type { FilmRollerHandle, FilmRollerStatus } from '@/components/filmroller/create-film-roller';
import type { FilmRollerPalette } from '@/components/filmroller/palette';
import { KineticText } from './motion-kit';
import { BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_L, LEAD, MONO_STYLE } from './tokens';

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
  const t = DESIGN_PAGE[lang].hero;
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<FilmRollerStatus | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    // The engine is imported HERE, dynamically, and nowhere else — that is
    // load-bearing, not style. A static import would put three.js (by far
    // the heaviest thing on this route) on the hydration path: the main
    // thread parses it before React can commit, every other component's
    // effects — including the IntersectionObservers that drive the
    // whileInView entrances further down the page — register late, and a
    // visitor who lands and scrolls immediately walks past sections whose
    // observers do not exist yet. Imported inside the effect, hydration
    // commits with the copy already interactive and the engine streams in
    // behind it; the canvas simply starts drawing a beat later, which the
    // page is already designed to tolerate (the copy never depends on it).
    let cancelled = false;
    let handle: FilmRollerHandle | null = null;
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
    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-[92svh] min-h-[600px] overflow-hidden bg-[var(--fx-charcoal)]"
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

      {/* Opening copy, over the scene, pointer-transparent so every move
          still steers. Rendered whether or not the canvas draws. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] px-5 pt-28 sm:px-8 sm:pt-32 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <BlurRise trigger="load">
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </BlurRise>
          <Serif as="h1" className={`mt-5 max-w-3xl ${DISPLAY_L} text-[var(--fx-white)]`}>
            <KineticText trigger="load" delay={0.12} lines={[t.titleLead]} />
            <KineticText
              trigger="load"
              delay={0.3}
              lines={[t.titleAccent]}
              className="text-[var(--fx-yellow)]"
            />
          </Serif>
          <BlurRise trigger="load" delay={0.5}>
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
          the aria-label carry the real information, so these stay hidden from
          readers and from pointers alike. */}
      {status ? (
        <div
          aria-hidden
          style={MONO_STYLE}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between px-5 pb-6 text-[10px] uppercase tracking-[0.22em] text-[var(--fx-faint)] sm:px-8 lg:px-10"
        >
          <span>
            {t.frameLabel} {String(status.frameIndex + 1).padStart(2, '0')} /{' '}
            {String(status.frameCount).padStart(2, '0')}
            <span className="mx-3 opacity-50">·</span>
            {t.speedLabel} {status.speed.toFixed(0)}
          </span>
          <span className={status.engaged ? 'text-[var(--fx-muted)]' : undefined}>
            {status.engaged ? t.hintEngaged : t.hintIdle}
          </span>
        </div>
      ) : null}

      {/* Fold the scene's bottom edge back into the page ground so the next
          section starts from charcoal, not from a lit floor cut mid-air. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-b from-transparent to-[var(--fx-charcoal)]"
      />
    </section>
  );
}
