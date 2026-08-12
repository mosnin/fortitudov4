'use client';

/**
 * The logged-out surface's motion vocabulary.
 *
 * `primitives.tsx` is what the page is made of; this file is how it arrives.
 * Six primitives, and deliberately no more — the surface already had one
 * entrance (`BlurRise`) used on everything, and the fix for "one move used
 * everywhere" is not "thirty moves used once each". Each section on the site
 * picks ONE idea from this file. If a section wants two, one of them is
 * decoration and should be cut.
 *
 * House rules, all enforced below rather than left to the caller:
 *
 *  - `prefers-reduced-motion` is a hard fallback, not a shorter duration.
 *    Every primitive branches on `useReducedMotion()` and renders the same
 *    content, statically. A reader who asks for less motion loses the travel
 *    and nothing else.
 *  - Nothing bounces. Entrances run on `EASE_OUT`; the one spring here
 *    (`useMagnetic`) is overdamped, so it settles without overshoot.
 *  - No layout shift. Reveals move `transform` and `opacity` only; the mask
 *    boxes in `KineticText` cancel their own padding with negative margins,
 *    and `Counter` reserves the width of its final value up front.
 *  - No per-frame layout reads. Scroll work goes through `useScroll` /
 *    `useTransform`, which the library batches; `useMagnetic` measures once
 *    per hover, not once per pointer event.
 *  - Colour is not motion's business. Nothing here sets a colour.
 */

import { Children, Fragment, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

/* ── 1. Kinetic text ─────────────────────────────────────────────────────── */

/**
 * The signature move: a headline whose words rise out of a clipped line box,
 * one after the next. Not a fade — the words are genuinely masked, so the
 * headline assembles itself rather than materialising.
 *
 * It sets no type of its own. Put it INSIDE `<Serif>`, which owns the face,
 * the weight and the tracking, and pass the heading as `lines` — one string
 * per hard line break:
 *
 *     <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
 *       <KineticText lines={['Five ways we can build with you.']} />
 *     </Serif>
 *
 * Use it for major section headings and the hero `h1`. Do NOT use it for:
 *  - body copy, captions or labels — a paragraph animating word-by-word is
 *    unreadable while it runs, and this surface's paragraphs are the argument;
 *  - anything with inline markup (a link, a `<br>`, an accented clause). It
 *    takes plain strings on purpose, because splitting arbitrary children is
 *    how a reveal primitive turns into a parser;
 *  - a heading that is already inside another entrance. Nesting a mask inside
 *    a blur-rise gives you two curves fighting over the same element.
 */
export function KineticText({
  lines,
  className,
  delay = 0,
  /** Seconds between words. Above ~0.08 a long heading reads as a crawl. */
  stagger = 0.05,
  duration = 0.8,
  /** `load` animates on mount (the hero); `scroll` when it enters view. */
  trigger = 'scroll',
}: {
  lines: string[];
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  trigger?: 'load' | 'scroll';
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    );
  }

  // Word index across the whole heading, so the stagger runs continuously
  // through a line break instead of restarting on each line.
  let word = 0;

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...(trigger === 'load'
        ? { animate: 'show' as const }
        : { whileInView: 'show' as const, viewport: { once: true, margin: '-80px' } })}
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line.split(' ').map((token, i, all) => {
            const index = word++;
            return (
              <Fragment key={`${token}-${index}`}>
                {/* The mask. Padding buys headroom for ascenders and
                    descenders (this surface's headings are set on tight
                    leading, so glyphs overflow their own line box); the
                    matching negative margins hand that space straight back,
                    which is why nothing below the heading moves. */}
                <span className="-mt-[0.14em] -mb-[0.22em] inline-block overflow-hidden pt-[0.14em] pb-[0.22em] align-bottom">
                  <motion.span
                    className="inline-block"
                    variants={{ hidden: { y: '130%' }, show: { y: '0%' } }}
                    transition={{ duration, ease: EASE_OUT, delay: delay + index * stagger }}
                  >
                    {token}
                  </motion.span>
                </span>
                {/* The space lives outside the mask so the line still wraps. */}
                {i < all.length - 1 ? ' ' : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </motion.span>
  );
}

/* ── 2. Parallax ─────────────────────────────────────────────────────────── */

/**
 * Scroll-linked drift for a decorative layer. The element sits at its resting
 * position when it is centred in the viewport and travels `distance` pixels
 * across a full screen of scroll, so a background reads as further away than
 * the copy in front of it.
 *
 * For backgrounds ONLY — the drawn glow behind the hero, a texture, a rule.
 * Do NOT parallax text, a control, or anything with a hit area: content that
 * moves at a different rate than the page is content you have to chase, and
 * scroll-linked transforms on real content are the classic cause of "the
 * button was here a second ago".
 */
export function Parallax({
  children,
  className,
  /** Total travel in px across one viewport of scroll. Keep it under ~150. */
  distance = 110,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The library reads scroll once per frame and writes the transform off the
  // main thread's layout path — this is the reason not to hand-roll it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);

  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/* ── 3. Magnetic hover ───────────────────────────────────────────────────── */

/**
 * A few pixels of pull toward the cursor, released on leave. Spread the result
 * onto a `motion` element — it returns a `style` plus the three pointer
 * handlers, and adds no wrapper, so the element keeps its own box:
 *
 *     const magnetic = useMagnetic<HTMLAnchorElement>();
 *     <motion.a {...magnetic} className="...">Start a project</motion.a>
 *
 * For the ONE primary action on a screen. Do NOT put it on secondary buttons,
 * nav links or cards: the pull is a way of saying "this is the thing to
 * press", and a page where everything leans toward you says nothing at all.
 *
 * Never fires on touch (`pointerType` is checked, and coarse pointers are
 * refused outright), because there is no cursor to lean toward and the effect
 * would just be a tap that lands off-centre.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  /** Maximum travel in px. 6–10 reads as intent; 20 reads as a toy. */
  strength = 7,
) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Overdamped (ζ ≈ 1.7): it settles, it does not spring back past centre.
  const springX = useSpring(x, { stiffness: 220, damping: 30, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 30, mass: 0.35 });
  // Measured once when the pointer arrives, not on every move — a rect read
  // per pointermove is a forced layout on a hot event.
  const box = useRef<DOMRect | null>(null);

  const enter = useCallback((event: React.PointerEvent<T>) => {
    if (event.pointerType !== 'mouse') return;
    box.current = event.currentTarget.getBoundingClientRect();
  }, []);

  const move = useCallback(
    (event: React.PointerEvent<T>) => {
      if (reduce || event.pointerType !== 'mouse') return;
      const rect = box.current;
      if (!rect) return;
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      x.set(Math.max(-1, Math.min(1, dx)) * strength);
      y.set(Math.max(-1, Math.min(1, dy)) * strength);
    },
    [reduce, strength, x, y],
  );

  const leave = useCallback(() => {
    box.current = null;
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    style: { x: springX, y: springY },
    onPointerEnter: enter,
    onPointerMove: move,
    onPointerLeave: leave,
  };
}

/* ── 4. Marquee ──────────────────────────────────────────────────────────── */

/**
 * A seamless horizontal ticker. Renders its children twice — the second copy
 * is `aria-hidden`, so the loop is a visual trick and not a repeated sentence
 * — and drives them with the `marquee-left` keyframe that already lives in
 * globals.css. There is exactly one such keyframe on this surface and this is
 * its wrapper; a component that needs a ticker uses this rather than adding a
 * second copy of the same animation.
 *
 * `motion-safe:` carries the reduced-motion fallback: with the animation off
 * the belt simply sits at its start, which is a legible static row.
 *
 * Use it for atmosphere — a belt of labels, a texture of repeating chips. Do
 * NOT use it for links or buttons: a moving target is a target you have to
 * catch, and a duplicated `<a>` is a duplicated tab stop.
 */
export function Marquee({
  children,
  className,
  /** Seconds for one full pass. Longer = calmer; under ~15s reads frantic. */
  seconds = 26,
  /** Fade the belt out at both edges so it does not hard-cut at the frame. */
  fade = true,
}: {
  children: React.ReactNode;
  className?: string;
  seconds?: number;
  fade?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-x-clip',
        fade &&
          '[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max items-center motion-safe:animate-[marquee-left_26s_linear_infinite]"
        style={{ animationDuration: `${seconds}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── 5. Counter ──────────────────────────────────────────────────────────── */

/**
 * A number that counts up once, when it enters view.
 *
 * It reserves the width of the finished value before it starts, so a figure
 * going 0 → 100% does not shove its neighbours around while it runs — the
 * rolling value is painted over an invisible copy of the final one.
 *
 * For figures that are quantities. Do NOT use it for a number that is really a
 * name (a year, a version, a phone number, "24/7"): counting up to 2026 makes
 * the reader watch a number that was never a measurement. And never let it
 * animate a value the page cannot stand behind — this surface's figures are
 * facts the codebase settles, not decoration to be made exciting.
 */
export function Counter({
  value,
  suffix = '',
  className,
  /** Seconds. Long enough to read as a roll, short enough not to be a wait. */
  duration = 1.1,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(count, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, count]);

  return (
    <span ref={ref} className={cn('relative inline-block tabular-nums', className)}>
      {/* The width reservation. Invisible, and hidden from the reader. */}
      <span aria-hidden className="invisible">
        {value}
        {suffix}
      </span>
      <span className="absolute inset-0">
        {display}
        {suffix}
      </span>
    </span>
  );
}

/* ── 6. Staggered grid ───────────────────────────────────────────────────── */

/**
 * A grid whose cells arrive in sequence rather than all at once. The delay is
 * keyed to grid POSITION, not source order — cells travel out from the
 * top-left corner along the diagonal, which is what makes it read as one
 * gesture across the grid instead of a queue of cards.
 *
 * One wrapper per grid: keep the grid classes on it and drop the cells in as
 * children. Each cell is wrapped in a plain `div`, so a card that stretches
 * with `h-full` still stretches.
 *
 *     <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" columns={3}>
 *       {cards}
 *     </StaggerGrid>
 *
 * Do NOT use it for long lists — past a dozen cells the last one arrives after
 * the reader has already got there, which is a wait, not a reveal. And do not
 * wrap a grid whose cells are already animating themselves.
 */
export function StaggerGrid({
  children,
  className,
  /** Columns at the WIDEST breakpoint — the diagonal is computed from it. */
  columns = 3,
  /** Seconds per diagonal step. */
  step = 0.07,
  /** Travel in px. Small: this is an arrival, not an entrance. */
  y = 18,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: number;
  step?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const cells = Children.toArray(children);

  return (
    <div className={className}>
      {cells.map((cell, i) => {
        const key = isValidElement(cell) && cell.key != null ? cell.key : i;
        if (reduce) {
          // Same wrapper, same box — only the travel is dropped.
          return <div key={key}>{cell}</div>;
        }
        const diagonal = (i % columns) + Math.floor(i / columns);
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: diagonal * step }}
          >
            {cell}
          </motion.div>
        );
      })}
    </div>
  );
}
