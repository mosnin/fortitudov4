import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards the hydration rule documented in `use-reduced-motion-safe.ts`.
 *
 * Motion's `useReducedMotion()` reads the media query in a `useState`
 * initialiser, so it is `true` on the first client render and `false` on the
 * server. React does not repair attribute mismatches during hydration, so a
 * component that BRANCHES ITS MARKUP on that value keeps whichever inline
 * styles the server wrote — and a static reduced-motion branch inherits the
 * animated branch's `opacity: 0` and is invisible forever, for exactly the
 * readers who asked for less motion.
 *
 * That shipped once, across all nine marketing pages. A type error cannot see
 * it and a screenshot only catches it if the screenshot is taken with the
 * preference on, so the invariant is pinned here instead: motion's hook may
 * only be called from files on the list below, each of which reads it inside
 * an effect or an event handler where it never reaches the SSR markup.
 * Everything else uses `useReducedMotionSafe`.
 *
 * The list is three three.js canvases and nothing else, deliberately. Several
 * other files read the preference for something harmless — a transition
 * duration, a `whileTap` — and those were moved to the safe hook anyway rather
 * than listed here, because a file allowed to call motion's hook for a harmless
 * reason is a file where tomorrow's markup branch passes this test. Only the
 * canvases keep it, and they keep it for a reason the safe hook cannot serve:
 * their `still` flag is a constructor argument, so a post-hydration change of
 * mind tears the scene down and rebuilds it. Motion's hook is right there
 * precisely because it answers on the first client render.
 *
 * Adding a file here is a claim you have to be able to defend: that the value
 * changes no rendered attribute. If it decides between two trees, or feeds an
 * `initial`/`style`/`variants` prop, it is not effect-only and the answer is
 * `useReducedMotionSafe` instead.
 */
const EFFECT_ONLY_CALLERS: Record<string, string> = {
  'src/components/marketing/giga/page-hero.tsx':
    'Passed as the `still` flag to the three.js dot-matrix inside an effect.',
  'src/components/marketing/giga/home-hero.tsx':
    'Passed as the `still` flag to the three.js corridor inside an effect.',
  'src/components/marketing/giga/pipeline.tsx':
    'Read inside the effect that drives the ruled ground; an early return, not a prop.',
};

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, found);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) found.push(path);
  }
  return found;
}

describe("motion's useReducedMotion is confined to effect-only readers", () => {
  // The IMPORT, not the identifier: `useReducedMotion` appears in prose in a
  // couple of docblocks (including the one explaining why not to use it), and
  // a scan that counts those is a scan people learn to work around. `\b` after
  // the name is what keeps `useReducedMotionSafe` from matching.
  const IMPORTS_MOTIONS_HOOK =
    /import[\s\S]{0,200}?\buseReducedMotion\b[\s\S]{0,200}?from\s*['"]motion\/react['"]/;

  const callers = sourceFiles('src')
    .filter((path) => !path.includes('use-reduced-motion-safe'))
    .filter((path) => IMPORTS_MOTIONS_HOOK.test(readFileSync(path, 'utf8')))
    .map((path) => path.split('\\').join('/'))
    .sort();

  it('has no caller outside the documented list', () => {
    const undocumented = callers.filter((path) => !(path in EFFECT_ONLY_CALLERS));
    expect(
      undocumented,
      `These files call motion's useReducedMotion(). If the value decides what is RENDERED, ` +
        `switch to useReducedMotionSafe() — otherwise add the file to EFFECT_ONLY_CALLERS with ` +
        `the reason it is effect-only. See src/hooks/use-reduced-motion-safe.ts.`,
    ).toEqual([]);
  });

  it('keeps the list honest — every documented file still calls it', () => {
    const stale = Object.keys(EFFECT_ONLY_CALLERS).filter((path) => !callers.includes(path));
    expect(stale, 'Documented as an effect-only caller but no longer calls it.').toEqual([]);
  });
});

describe('the safe hook', () => {
  const source = readFileSync('src/hooks/use-reduced-motion-safe.ts', 'utf8');

  it('reports false for the server snapshot', () => {
    // The load-bearing line. If the server snapshot ever reports the real
    // preference (it cannot — there is no matchMedia) or `true`, the first
    // client render disagrees with the server again and the whole bug returns.
    expect(source).toMatch(/getServerSnapshot\s*=\s*\(\)\s*=>\s*false/);
  });

  it('subscribes rather than sampling once', () => {
    // useSyncExternalStore is what makes React schedule a post-hydration
    // update when the snapshots differ. A useState/useEffect pair would work
    // too; a bare useState initialiser is precisely the bug being guarded.
    expect(source).toContain('useSyncExternalStore');
  });
});
