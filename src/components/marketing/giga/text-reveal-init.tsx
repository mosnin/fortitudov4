'use client';

/**
 * Mounts Text Reveal 03 (`src/lib/text-reveal-03.ts`) for the logged-out site.
 *
 * THE ARMING SCRIPT. `[data-reveal-03]` elements must be hidden BEFORE first
 * paint or the text flashes, but a CSS rule that always hides them would blank
 * the page for no-JS visitors — this site has shipped one invisible-text bug
 * and does not ship another. So the hidden-state rule in globals.css is gated
 * on `html[data-tr03]`, and that attribute is set by the inline script below,
 * which streams with the server HTML and runs on parse, before hydration.
 * No JS → no attribute → the text simply shows. The script also refuses to
 * arm under `prefers-reduced-motion`, so a visitor who asked for stillness
 * never sees their copy dimmed to 10% while a wave they opted out of plays.
 *
 * PER-NAVIGATION RE-INIT. The component lives in the marketing layout and
 * survives client-side navigations, but each new page brings new opted-in
 * elements, so the effect re-runs on every pathname change. Each run is
 * wrapped in a `gsap.context` and reverted on cleanup, so the outgoing page's
 * SplitText instances and ScrollTriggers die with it instead of accumulating
 * dead listeners.
 *
 * `document.fonts.ready` gates the split — SplitText measures line breaks,
 * and splitting against fallback metrics puts `.line` wrappers in the wrong
 * places once Inter Tight arrives.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';

const ARM_SCRIPT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-tr03','')}}catch(e){}`;

export function TextRevealInit() {
  const reduce = useReducedMotionSafe();
  const pathname = usePathname();

  useEffect(() => {
    if (reduce) {
      // The attribute may have been armed at parse time before the preference
      // flipped (or the safe hook settled) — disarm so nothing stays hidden.
      document.documentElement.removeAttribute('data-tr03');
      return;
    }
    if (!document.documentElement.hasAttribute('data-tr03')) return;

    let cancelled = false;
    let revert: (() => void) | null = null;

    Promise.all([
      import('gsap'),
      import('@/lib/text-reveal-03'),
      document.fonts.ready,
    ]).then(([{ default: gsap }, { textReveal03 }]) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        textReveal03(document, 0.1);
      });
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reduce, pathname]);

  return (
    // Streams with the SSR HTML and runs on parse — before hydration, before
    // first paint of the copy it guards.
    <script dangerouslySetInnerHTML={{ __html: ARM_SCRIPT }} />
  );
}
