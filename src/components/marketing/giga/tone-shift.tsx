'use client';

/**
 * The tone shift — the moment the page turns yellow.
 *
 * Everything inside renders in the inverted scope: racing-yellow ground, black
 * ink, black cards. The mechanics live in `[data-fx-tone="light"]` in
 * globals.css; this component's job is the *transition*, so the flip reads as
 * a deliberate move rather than a hard cut between two stylesheets.
 *
 * Three things make it feel intentional:
 *
 *  1. A tall gradient seam at the top edge, charcoal fading into yellow, so
 *     the boundary is a horizon rather than a rule.
 *  2. The seam's own arrival is scroll-linked — it lifts and settles as it
 *     enters, which is what stops a colour change this large from feeling like
 *     a rendering bug.
 *  3. The children do not animate. Inverting the palette is already the
 *     loudest thing on the page; animating the content through it as well is
 *     how a strong idea turns into a cheap one.
 *
 * Reduced motion gets the colour and the seam, with nothing moving. The point
 * of the section survives; only the travel is dropped.
 */

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

export function ToneShift({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Tracked across the seam only — from the moment the boundary enters the
  // viewport to the moment it leaves the top — so the easing is spent on the
  // transition itself and not on the whole section's height.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const seamY = useTransform(scrollYProgress, [0, 1], ['14%', '0%']);
  const seamOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [0, 0.85, 1]);

  return (
    <div
      ref={ref}
      data-fx-tone="light"
      className={`relative bg-[var(--fx-charcoal)] ${className}`}
    >
      {/* The seam. Sits above the yellow ground and below the content, and is
          the only thing here that moves. */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: seamY, opacity: seamOpacity }}
        // ABOVE the children, not below. Sections paint their own full-bleed
        // grounds, so a seam underneath them is a seam nobody sees — the flip
        // then reads as a hard cut, which is the exact failure this element
        // exists to prevent. It fades to transparent within ~200px and takes
        // no pointer events, so overlaying the top of the first section costs
        // nothing.
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-[#0f0f12] via-[#0f0f12]/55 to-transparent sm:h-56"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * A black card on the yellow ground.
 *
 * Marks the element so the nested reset in globals.css flips its ink back to
 * light. Without it a card paints itself black and then renders black text on
 * it, which is invisible rather than subtle.
 *
 * Use it for any element inside `ToneShift` that paints
 * `--fx-charcoal-raised`.
 */
export function DarkSurface({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li';
}) {
  return (
    <Tag data-fx-surface="dark" className={className}>
      {children}
    </Tag>
  );
}
