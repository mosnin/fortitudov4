'use client';

/**
 * The cursor.
 *
 * A small ring that trails the pointer with spring lag, swells over anything
 * clickable, and inverts to yellow when it crosses onto the black half of the
 * page. It is the one piece of chrome on this site that exists purely to say
 * "someone made this on purpose".
 *
 * It is also the single most commonly botched effect on agency sites, so the
 * rules it follows are worth stating:
 *
 *  - **The real cursor never disappears.** Hiding it and drawing your own is
 *    how you make a site unusable the moment your JS is slow, and it strands
 *    anyone relying on a system pointer setting. This ring is additive; the
 *    native cursor stays exactly where it is.
 *  - **Pointer devices only.** Gated on `(hover: hover) and (pointer: fine)`,
 *    so it never mounts on a phone, where it would be a permanent dot in the
 *    corner.
 *  - **Off under reduced motion.** A lagging element that chases you is the
 *    definition of what that preference is asking you to stop doing.
 *  - **`pointer-events: none`, always.** It can never eat a click.
 *
 * Rendered once, by the marketing layout. Not for the product.
 */

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

/** Everything that should make the ring swell. */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary';

export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Low stiffness and high damping: it should trail, not whip. Overshoot on a
  // cursor reads as lag rather than as personality.
  const sx = useSpring(x, { stiffness: 380, damping: 38, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 380, damping: 38, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    return () => fine.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!enabled || reduce) return;

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visible) setVisible(true);
      const target = event.target as Element | null;
      setActive(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const leave = () => setVisible(false);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [enabled, reduce, visible, x, y]);

  if (!enabled || reduce) return null;

  return (
    <motion.div
      aria-hidden
      // `mix-blend-difference` is what makes one ring work on both halves of
      // the page: it reads light on charcoal and dark on yellow without
      // knowing which tone it is currently over.
      className="pointer-events-none fixed top-0 left-0 z-[200] hidden rounded-full border border-white mix-blend-difference lg:block"
      style={{ x: sx, y: sy }}
      initial={false}
      animate={{
        width: active ? 44 : 22,
        height: active ? 44 : 22,
        opacity: visible ? 1 : 0,
        // Keep it centred on the pointer as it resizes.
        translateX: active ? -22 : -11,
        translateY: active ? -22 : -11,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    />
  );
}
