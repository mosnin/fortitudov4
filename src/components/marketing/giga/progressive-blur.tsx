/**
 * Progressive Blur — the CSS-only resource: each viewport edge carries eight
 * overlapping, masked `backdrop-filter` layers whose blur doubles layer to
 * layer, so page content grades from crisp into a strong edge blur as it
 * scrolls under. Fixed, pointer-transparent, zero JavaScript.
 *
 * Rendered ONCE, by the marketing layout, as a direct child of the shell —
 * outside the FooterReveal wrapper so no ancestor can ever gain a transform
 * and re-anchor `position: fixed`. The styles live in globals.css, prefixed
 * with `[data-marketing-shell]` so the generic `.layer` / `.blur-*` class
 * names cannot leak into the product surface; the selector relationships,
 * blur values and mask stops are the resource's, untouched. It has no colours
 * of its own — the masks' #000 stops are opacity, not paint — so it works
 * over the charcoal and the yellow tone bands alike.
 *
 * Both containers must keep exactly eight ordered `.blur-1`…`.blur-8`
 * children; do not thin the stack (a single masked blur fades one strength,
 * it does not step through eight).
 */

const LAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function BlurStack() {
  return (
    <>
      {LAYERS.map((n) => (
        <div key={n} className={`layer blur-${n}`} />
      ))}
    </>
  );
}

export function ProgressiveBlur() {
  return (
    <>
      <div className="progressive-blur top-blur" aria-hidden="true">
        <BlurStack />
      </div>
      <div className="progressive-blur bottom-blur" aria-hidden="true">
        <BlurStack />
      </div>
    </>
  );
}
