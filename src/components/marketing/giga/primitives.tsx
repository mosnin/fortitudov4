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

/** Racing yellow. The one accent, spent on what you want pressed. */
export const ACCENT = '#f8cd02';

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
  /** Override the dot color (defaults to the warm brand orange). */
  dotClassName?: string;
}) {
  return (
    <span
      style={{ fontFamily: 'var(--font-mono-display), ui-monospace, monospace' }}
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('inline-block size-1.5 rounded-full', dotClassName)}
        style={dotClassName ? undefined : { backgroundColor: ACCENT }}
      />
      {children}
    </span>
  );
}

/** A squared, hairline-bordered eyebrow chip (the hero / sub-page treatment). */
export function EyebrowPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[4px] border border-white/15 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md',
        className,
      )}
    >
      <Eyebrow>{children}</Eyebrow>
    </span>
  );
}

/* ── Mono label (footers, stat captions) ────────────────────────────────── */

export function Mono({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      style={{ fontFamily: 'var(--font-mono-display), ui-monospace, monospace' }}
      className={cn('uppercase tracking-[0.2em]', className)}
    >
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

/** The secondary CTA: hairline border, transparent fill, white text. */
export function PillGhost({ href, children, className, withArrow }: PillProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-white/20 px-6 text-[14px] font-medium text-white transition-colors duration-200 hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)]',
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
