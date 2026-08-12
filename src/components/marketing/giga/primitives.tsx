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
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

/* ── The one type scale ─────────────────────────────────────────────────────
 *
 * Five display steps and two title steps, and nothing else. The surface was
 * assembled from a ported kit, an OriginKit hero and two reference layouts, so
 * it arrived carrying eleven different heading clamps that all meant roughly
 * "section heading". Sizes AND leading live in the step, because a step whose
 * leading is left to the caller is a step that drifts again on the next page.
 *
 * Pass a step to <Serif>; do not write a bare `text-[clamp(...)]` on this
 * surface.
 */
/** The page owns the screen: the homepage hero, the footer's closing line. */
export const DISPLAY_XL = 'text-[clamp(2.5rem,7.5vw,5.25rem)] leading-[0.98]';
/** A sub-page `h1`. */
export const DISPLAY_L = 'text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04]';
/** A major section `h2` — the ones with an eyebrow above them. */
export const DISPLAY_M = 'text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.06]';
/** A secondary section `h2` — a band inside a longer page. */
export const DISPLAY_S = 'text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08]';
/** A closing ask or an in-panel headline. */
export const DISPLAY_XS = 'text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08]';

/** A card headline set in the display face. */
export const TITLE_L = 'text-[22px] leading-tight';
/** A sub-card or list-row heading. */
export const TITLE_S = 'text-[17px] leading-snug font-semibold';

/* ── Alignment ───────────────────────────────────────────────────────────────
 *
 * Everything on this surface is LEFT-ALIGNED. The page is built out of
 * hairlines and squared edges, and a centred headline over a left-aligned rule
 * fights the structure it is sitting on. Read top to bottom, the homepage used
 * to alternate centred and left section by section, which looks like drift
 * rather than rhythm.
 *
 * The one deliberate exception is the homepage hero, which is a full-viewport
 * centred column and is the only thing on the site with no structure beside it.
 */

/* ── Alert ───────────────────────────────────────────────────────────────────
 *
 * The one colour on this surface outside the --fx-* palette, and it earns its
 * place: the "typical agencies" belt is a bad-vs-good comparison, and the bad
 * half has to read as a warning rather than as a second brand accent. Held
 * here so both users (the comparison belt, the contact form's failure notice)
 * say the same red — these want to be `--fx-alert*` in the marketing-shell
 * block in globals.css, which this surface does not own.
 */
/** An outlined alert chip: border, wash, and ink. */
export const ALERT_CHIP = 'border-[#ff405d] bg-[#ff405d]/[0.08] text-[#ff7a8d]';
/** The alert rule/connector fill. */
export const ALERT_RULE = 'bg-[#ff405d]/60';
/** Alert ink on charcoal. */
export const ALERT_TEXT = 'text-[#ff7a8d]';

/* ── Section rhythm ──────────────────────────────────────────────────────── */

/**
 * Two vertical steps, not five. `py-20`/`py-24`/`py-28`/`py-32` were in use
 * simultaneously, which reads as sections that do not know their own rank.
 */
/** A top-level section. */
export const SECTION_Y = 'py-24 sm:py-32';
/** A band that stacks with others inside one continuous page (pricing, legal). */
export const SECTION_Y_TIGHT = 'py-16 sm:py-20';
/** A page hero. The extra top pad clears the fixed header. */
export const HERO_Y = 'pt-32 pb-20 sm:pt-40 sm:pb-24';

/* ── Mono ────────────────────────────────────────────────────────────────── */

/**
 * The eyebrow / caption face. Exported so no file declares its own copy — the
 * surface previously carried two spellings of the same role (`--font-mono` and
 * `--font-mono-display`), which resolve to the same face and so hid the drift
 * rather than preventing it.
 */
export const MONO_STYLE = {
  fontFamily: 'var(--font-mono-display), ui-monospace, monospace',
} as const;

/**
 * The eyebrow treatment, as a class string, for the labels that are a bare
 * `<p>` rather than the dotted `<Eyebrow>` — footer column heads, category
 * labels, mock captions. One size, one tracking, one colour.
 *
 * `--fx-muted`, never `--fx-faint`: a label that names the content under it is
 * content, and `--fx-faint` is 3.6:1.
 */
export const EYEBROW_TEXT =
  'text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--fx-muted)]';

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
      className={cn('font-semibold tracking-[-0.03em]', className)}
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
 * The primary CTA: a racing-yellow block, black text, 4px corners.
 *
 * `bg-[var(--fx-yellow)]` rather than the literal so the palette stays one
 * place to change. The token is defined on `[data-marketing-shell]`, which
 * wraps every logged-out route; outside that tree it would resolve to nothing,
 * and this component is not for the product.
 */
export function PillPrimary({ href, children, className, withArrow }: PillProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[var(--fx-yellow)] px-6 text-[14px] font-medium text-[var(--fx-on-yellow)] transition-all duration-200 hover:bg-[var(--fx-yellow-hover)] active:scale-[0.98]',
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
  const reduce = useReducedMotion();
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

/** A standard near-black section band with consistent horizontal gutters. */
export function Band({
  children,
  className,
  innerClassName,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('px-5 sm:px-8 lg:px-10', className)}>
      <div className={cn('mx-auto w-full max-w-[1728px]', innerClassName)}>{children}</div>
    </section>
  );
}
