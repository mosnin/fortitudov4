'use client';

/**
 * Giga marketing primitives, the shared kit for the logged-out site.
 *
 * Visual language (the hero-21 system, recoloured to racing yellow):
 *  - Charcoal ground, generous air, thin hairline dividers, SQUARED corners.
 *    Nothing on the logged-out site is a lozenge; the radius is 4px and the
 *    structure is drawn with rules rather than rounded cards.
 *  - Display headlines are a large, tightly-tracked geometric SANS at semibold
 *    (see the `[data-marketing-shell]` block in globals.css, which sets the
 *    face for every heading in the tree). `<Serif>` keeps its name because ~14
 *    files import it; what it renders is the display sans.
 *  - Eyebrow labels: UPPERCASE MONOSPACE with a small yellow dot.
 *  - CTAs: a racing-yellow block with BLACK text. Yellow is the primary
 *    action and nothing else; a second yellow button on the same screen is a
 *    bug, not a style choice.
 *
 * Motion is the installed `motion` package; everything respects
 * prefers-reduced-motion (BlurRise falls back to a plain block).
 *
 * `BlurRise` is the quiet end of the vocabulary — the entrance for a block
 * that should simply appear. The deliberate moves (the headline mask, the
 * parallax glow, the magnetic pull on this file's primary CTA, the ticker, the
 * counter, the grid cascade) live in `motion-kit.tsx`, which is where a new
 * one goes. This file imports from it; it must never import back, or the two
 * modules become a cycle.
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import { EYEBROW_TEXT, MONO_STYLE } from './tokens';

/** `PillPrimary` is the one magnetic control on the surface — see below. */

/* ── Serif display headline ─────────────────────────────────────────────── */

/**
 * The display headline face. The scoped CSS in globals.css resolves
 * --font-serif-display for every heading in the shell; this component pins the
 * weight and tracking, and keeps the inline font as belt-and-suspenders so a
 * headline rendered on a <span> or <p> is never left on the body face.
 *
 * The name is a leftover from the serif era. It is kept so the ~14 files that
 * import it do not all have to change to say the same thing.
 */
export function Serif({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}) {
  return (
    <Tag
      style={{
        fontFamily: 'var(--font-serif-display), ui-sans-serif, system-ui, sans-serif',
      }}
      /* `font-medium` (500), not `font-semibold` (600), and the distinction
         matters in exactly one place. The shell rule
         `[data-marketing-shell] h1…h6` in globals.css is unlayered, so it beats
         any Tailwind utility here — headings were already 500 and the old
         `font-semibold` was dead on them. On `as="span"` and `as="p"` nothing
         overrode it, so the same 17px title rendered at 600 in a FAQ question
         and 500 in a card head three sections below. Invisible while display
         was also 600; the move to 500 is what exposed it.
         It must stay an explicit 500 rather than nothing — a bare span would
         otherwise inherit body weight and land at 400.

         Tracking stays. The shell rule only reaches h1–h6, so this is the only
         thing tracking a `<Serif as="span">`. It duplicates the shell value for
         headings, which is harmless but is the thing to change in step if the
         shell's tracking ever moves. */
      className={cn('font-medium tracking-[-0.03em]', className)}
    >
      {children}
    </Tag>
  );
}

/* ── Eyebrow: uppercase mono + colored dot ──────────────────────────────── */

export function Eyebrow({
  children,
  className,
  dotClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** Override the dot colour (defaults to the racing-yellow accent). */
  dotClassName?: string;
}) {
  return (
    <span
      style={MONO_STYLE}
      className={cn('inline-flex items-center gap-2', EYEBROW_TEXT, className)}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block size-1.5 rounded-full',
          dotClassName ?? 'bg-[var(--fx-yellow)]',
        )}
      />
      {children}
    </span>
  );
}

/* `EyebrowPill` — a bordered chip wrapping an eyebrow — is gone. It existed
 * only for the two photographic heroes (/about, /pricing), which needed a
 * backdrop to stay legible over a stock image. Those heroes are charcoal now,
 * the plain dotted <Eyebrow> reads fine on them, and one page wearing a chip
 * while five wear a dot was the eyebrow drift in miniature. */

/* ── Mono label (footers, stat captions) ────────────────────────────────── */

export function Mono({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span style={MONO_STYLE} className={cn('uppercase tracking-[0.22em]', className)}>
      {children}
    </span>
  );
}

/* ── Pill CTAs ──────────────────────────────────────────────────────────── */

type PillProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  withArrow?: boolean;
};

/**
 * The primary CTA — now the Arrow Shift Button (`button-05` in globals.css):
 * a translucent glass pill whose generated right arrow exits through the
 * clipped edge while a second arrow enters from the left and the label shifts
 * right; only the blurred glass layer scales on hover/press.
 *
 * The interaction is CSS-only by contract, so the magnetic pull and the
 * `whileTap` spring the old yellow block carried are gone rather than layered
 * on top — the resource forbids extra motion machinery, and glass that leans
 * AND squashes is two ideas fighting over one pill. `withArrow` survives in
 * the type for its call sites, but the arrows are pseudo-elements now and
 * every glass CTA has them.
 *
 * The element relationships (`.glass` absolute child, `.content` clipping
 * wrapper, `.copy` label) are the spec's non-negotiables — do not flatten
 * them. Per its adaptation note the glass reads best over layered surfaces
 * (the hero canvases, imagery), which is where the primary CTA lives.
 */
export function PillPrimary({ href, children, className }: PillProps) {
  return (
    <Link href={href} className={cn('button-05', className)}>
      <span className="glass" aria-hidden="true" />
      <span className="content">
        <span className="copy">{children}</span>
      </span>
    </Link>
  );
}

/**
 * The secondary CTA: a bordered block with no fill.
 *
 * The border is `--fx-faint` rather than a hairline: this is a control, and
 * WCAG 1.4.11 asks 3:1 of the boundary that identifies one. The hairline is
 * 1.4:1 on charcoal; `--fx-faint` is 3.6:1.
 */
export function PillGhost({ href, children, className, withArrow }: PillProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-[var(--fx-faint)] px-6 text-[14px] font-medium text-[var(--fx-white)] transition-colors duration-200 hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)]',
        className,
      )}
    >
      {children}
      {withArrow ? (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </Link>
  );
}

/* ── Motion: blur-rise (the redesign's entrance language) ────────────────── */

/**
 * The signature entrance: fade + small rise + de-blur. Used on-load for the
 * hero and on-scroll (whileInView) for sections. Reduced-motion → plain block.
 */
export function BlurRise({
  children,
  className,
  delay = 0,
  /** `load` animates on mount; `scroll` animates when it enters the viewport. */
  trigger = 'scroll',
  y = 22,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  trigger?: 'load' | 'scroll';
  y?: number;
}) {
  // Safe, not motion's own — this branch decides what is in the DOM, and
  // motion's hook disagrees with the server on the first render. See
  // `use-reduced-motion-safe.ts`; getting it wrong left this element at
  // `opacity: 0` permanently.
  const reduce = useReducedMotionSafe();
  if (reduce) return <div className={className}>{children}</div>;

  const initial = { opacity: 0, y, filter: 'blur(12px)' };
  const shown = { opacity: 1, y: 0, filter: 'blur(0px)' };
  const transition = { duration: 0.9, ease: EASE_OUT, delay };

  if (trigger === 'load') {
    return (
      <motion.div className={className} initial={initial} animate={shown} transition={transition}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={shown}
      viewport={{ once: true, margin: '-80px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/* ── Section shell ──────────────────────────────────────────────────────── */

/**
 * A standard section band with consistent horizontal gutters.
 *
 * The inner element is `mx-auto max-w-[1728px]`, which centres the page's
 * widest possible column on an ultra-wide screen. That is correct and is the
 * only reason `mx-auto` is there.
 *
 * `narrow` — NOT `innerClassName` — is how you get a narrower column.
 * `cn` is twMerge, so a `max-w-*` passed through `innerClassName` REPLACES the
 * max-width and KEEPS the `mx-auto`: the caller asks for a narrower column and
 * silently gets a centred one. That is how six sub-page headlines ended up
 * indented 336px on a 1440px screen while every section beneath them sat at
 * the 40px gutter, and design.md is explicit that this surface is left-aligned
 * with exactly one exception (the homepage hero).
 *
 * So `narrow` drops the centring with the width. If you genuinely want a
 * centred column, say `narrow="max-w-3xl mx-auto"` and mean it.
 */
export function Band({
  children,
  className,
  innerClassName,
  narrow,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** A `max-w-*` for the reading column. Left-aligned unless you re-add mx-auto. */
  narrow?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('px-5 sm:px-8 lg:px-10', className)}>
      <div
        className={cn(
          'mx-auto w-full max-w-[1728px]',
          innerClassName,
          // Last, so it wins the twMerge conflict on both axes.
          narrow && `${narrow} mx-0`,
        )}
      >
        {children}
      </div>
    </section>
  );
}
