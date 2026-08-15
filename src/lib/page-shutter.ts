/**
 * The shutter page transition — Page Transition 06/07, adapted to the
 * App Router.
 *
 * Both source resources are Swup transitions, and both carry the same
 * compatibility boundary: do NOT force Swup into a project with a
 * framework-native client router — adapt the effect to that router's own
 * lifecycle instead. This module is that adaptation. What Swup provided —
 * intercepting same-origin links, covering the page, swapping content,
 * revealing — the App Router already does, so the Swup machinery is replaced
 * by `router.push` and a pathname watch (see `page-shutter.tsx`), while
 * everything visual is kept from the resource:
 *
 *  - the generated persistent `.transition-shutter` overlay, appended to
 *    `document.body` outside anything the router swaps (this helper is the
 *    spec's `pageTransition07()`, near-verbatim);
 *  - the horizontal `.transition-shutter__panel` rows with per-panel `--i`
 *    stagger, `--shutter-count` and `--shutter-color` written by the helper;
 *  - the `html.is-changing` / `.is-animating` / `.is-rendering` state classes
 *    and their CSS (globals.css), including the pointer-events block while a
 *    navigation is in flight.
 *
 * The panel colour is the racing yellow rather than the demo's near-black:
 * yellow is this site's surface colour, and the shutter is a surface.
 *
 * There is no `#swup` container: the router swaps the route subtree, and the
 * marketing shell already gives it an opaque background, which is all the
 * container's CSS existed to guarantee.
 */

const DIRECTIONS = new Set([
  'left-to-right',
  'left-to-left',
  'right-to-left',
  'right-to-right',
]);

const PANEL_COUNT = 8;
const SHUTTER_COLOR = '#f8cd02'; // --fx-yellow — read as a literal because the
// overlay hangs off <body>, outside [data-marketing-shell]'s token scope.
const DURATION_MS = 700; // keep in sync with --shutter-duration in globals.css
const STAGGER_MS = 45; //  … and --shutter-stagger
/** Time for the full cover (or reveal): last panel's delay + its transition. */
export const SHUTTER_MS = DURATION_MS + (PANEL_COUNT - 1) * STAGGER_MS;

/** The resource's `pageTransition07()` helper, kept near-verbatim: creates
 *  (or reuses) the fixed overlay and generates the panel rows. */
export function ensureShutterOverlay({
  count = PANEL_COUNT,
  color = SHUTTER_COLOR,
  direction = 'left-to-right',
} = {}): HTMLElement {
  const panelCount = Math.max(1, Math.floor(Number(count)) || 1);
  let overlay = document.querySelector<HTMLElement>('.transition-shutter');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'transition-shutter';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  overlay.dataset.shutterTransition = DIRECTIONS.has(direction)
    ? direction
    : 'left-to-right';
  overlay.style.setProperty('--shutter-count', String(panelCount));
  overlay.style.setProperty('--shutter-color', color);
  if (overlay.childElementCount !== panelCount) {
    overlay.replaceChildren(
      ...Array.from({ length: panelCount }, (_, index) => {
        const panel = document.createElement('span');
        panel.className = 'transition-shutter__panel';
        panel.style.setProperty('--i', String(index));
        return panel;
      }),
    );
  }

  return overlay;
}

/* Swup's state classes, driven by us. `covering` guards double-starts;
   module-level so the state survives a layout handoff (marketing → auth
   mounts a different PageShutter instance mid-transition). */
let covering = false;
let revealTimer: ReturnType<typeof setTimeout> | null = null;

export function isShutterActive(): boolean {
  return covering || document.documentElement.classList.contains('is-changing');
}

/** Panels slide in and cover the viewport. Resolves when fully covered. */
export function coverPage(): Promise<void> {
  const html = document.documentElement;
  covering = true;
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  ensureShutterOverlay();
  html.classList.add('is-changing');
  // Reflow so the enter position commits before the transition class lands —
  // the same trick the resource leans on Swup to perform.
  void html.offsetHeight;
  html.classList.add('is-animating');
  return new Promise((resolve) => {
    setTimeout(resolve, SHUTTER_MS + 40);
  });
}

/** Panels slide out and reveal the new page, then all state clears. */
export function revealPage(): void {
  const html = document.documentElement;
  if (!html.classList.contains('is-changing')) return;
  covering = false;
  html.classList.remove('is-animating');
  html.classList.add('is-rendering');
  revealTimer = setTimeout(() => {
    html.classList.remove('is-changing', 'is-rendering');
    revealTimer = null;
  }, SHUTTER_MS + 40);
}

/** Abandon-ship path: clears every state class instantly (used if a
 *  navigation never lands, so the page can never be left covered). */
export function resetShutter(): void {
  covering = false;
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  document.documentElement.classList.remove('is-changing', 'is-animating', 'is-rendering');
}
