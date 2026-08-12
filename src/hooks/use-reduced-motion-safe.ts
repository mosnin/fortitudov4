'use client';

/**
 * `prefers-reduced-motion`, in a form that is safe to branch a component's
 * markup on.
 *
 * Motion's own `useReducedMotion()` is NOT, and the failure is silent and
 * total. Read its source (framer-motion 12.38,
 * `utils/reduced-motion/use-reduced-motion.mjs`): the media query is read in a
 * `useState` **initialiser**, so the value is already `true` on the very first
 * client render. On the server the same hook returns `false`, because there is
 * no `matchMedia`. That is a hydration mismatch — and React does not repair
 * attribute mismatches during hydration. It reconciles the tree, warns in dev,
 * and leaves the server's DOM attributes exactly where they are.
 *
 * So a component written the obvious way:
 *
 *     const reduce = useReducedMotion();
 *     if (reduce) return <div className={className}>{children}</div>;
 *     return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} … />
 *
 * server-renders `<div style="opacity:0">`, client-renders `<div>` with no
 * style at all, and the `opacity:0` is never cleared. The element is invisible
 * forever — for exactly the readers who asked for less motion, and on every
 * section of the site at once. That was a real bug here, not a hypothetical:
 * under `prefers-reduced-motion: reduce` the homepage hero's badge, lead, both
 * calls to action and the strip below them rendered as empty space, and so did
 * every `BlurRise` on all nine marketing pages.
 *
 * `useSyncExternalStore` is the fix and the reason is specific: React renders
 * `getServerSnapshot` during hydration, then compares it against
 * `getSnapshot` and schedules an ordinary update if they differ. An ordinary
 * update is not hydration, so React clears the stale inline style. The cost is
 * one frame of animation-shaped markup before it settles, which is invisible in
 * practice — the alternative is a permanently blank page. As a bonus the
 * subscription means a reader who flips the OS setting gets the change live;
 * motion's hook has a `TODO` where that behaviour should be.
 *
 * Use this everywhere a reduced-motion branch changes what is RENDERED.
 * Motion's own hook is still correct for a value that is only ever read inside
 * an effect or an event handler (`useMagnetic`'s pointer maths, `Counter`'s
 * animation, the three.js canvases' `still` flag), because nothing about those
 * reaches the SSR markup.
 */

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** The server cannot know, so it guesses "no" — and so must the first client
 *  render, or the two disagree and the mismatch is never repaired. */
const getServerSnapshot = () => false;

export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
