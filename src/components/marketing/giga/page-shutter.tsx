'use client';

/**
 * PageShutter — mounts the shutter transition (see `src/lib/page-shutter.ts`)
 * on a logged-out layout. Mounted by BOTH the (marketing) and (auth) layouts,
 * because a sign-in click starts the transition inside one layout and finishes
 * it inside the other: the overlay itself is a singleton on `document.body`
 * and the state classes live on <html>, so the handoff is seamless — the
 * instance that mounts mid-cover simply performs the reveal.
 *
 * WHAT REPLACES SWUP (its own spec forbids using it under a framework
 * router): a capture-phase click listener catches same-origin link clicks,
 * covers the page, then hands the URL to `router.push`; the reveal fires when
 * `usePathname` reports the new route has rendered — which also means the
 * shutter naturally holds over any server-render gap instead of showing a
 * blank page. `e.preventDefault()` is enough to stand down both the browser
 * and <Link> (Link checks `defaultPrevented`), so links need no changes.
 *
 * Interception is skipped for: modified clicks, non-left buttons, targeted /
 * download / external / mailto links, hash-only moves on the same path, and
 * ANY click under prefers-reduced-motion — reduced-motion visitors navigate
 * plainly and the global reduced-motion guard flattens the panel transitions
 * besides. A watchdog force-clears the cover if a navigation never lands.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import {
  coverPage,
  ensureShutterOverlay,
  isShutterActive,
  resetShutter,
  revealPage,
} from '@/lib/page-shutter';

/** How long a covered page waits for the next route before giving up. */
const WATCHDOG_MS = 8000;

export function PageShutter() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotionSafe();
  const pendingRef = useRef(false);

  // Reveal on arrival: covers both the same-layout case (pathname changed) and
  // the cross-layout case (this instance mounted while the page was covered).
  useEffect(() => {
    if (isShutterActive()) {
      pendingRef.current = false;
      revealPage();
    }
  }, [pathname]);

  useEffect(() => {
    if (reduce) return;
    ensureShutterOverlay();

    let watchdog: ReturnType<typeof setTimeout> | null = null;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.origin !== window.location.origin) return;
      const samePage =
        anchor.pathname === window.location.pathname &&
        anchor.search === window.location.search;
      if (samePage) return; // hash moves and self-links animate nothing
      if (isShutterActive()) {
        // A second click mid-transition: swallow it, the first one is driving.
        event.preventDefault();
        return;
      }

      event.preventDefault();
      pendingRef.current = true;
      const href = anchor.pathname + anchor.search + anchor.hash;
      coverPage().then(() => {
        router.push(href);
        if (watchdog) clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          // The route never rendered (error, offline). Never leave the page
          // under an opaque overlay.
          if (pendingRef.current) {
            pendingRef.current = false;
            resetShutter();
          }
        }, WATCHDOG_MS);
      });
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (watchdog) clearTimeout(watchdog);
    };
  }, [reduce, router]);

  return null;
}
