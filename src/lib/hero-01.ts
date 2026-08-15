/**
 * Hero 01 — the first-load media reveal from the resource: the media layer
 * opens from a narrow vertical clip window to a wider window to the full
 * rectangle while the layer inside it (`.hero-01__image`) scales down and
 * back up, and the overlay fades in after the expansion. Ported verbatim —
 * polygons, durations, eases and timeline positions are the resource's.
 *
 * HOST MAPPING (the markup around it, not the animation): on this site the
 * "media" is the homepage hero's framed panel (`section-hero.tsx`), the
 * `.hero-01__image` class rides on the panel's inner wrapper (canvases and
 * copy scale as one, the way the demo's photograph did), and the field
 * revealed AROUND the narrow window is the racing yellow — the user's swap
 * for the demo's white — painted by a `[data-hero-01-underlay]` the host
 * fades once the expansion lands. The pre-JS initial clip state lives in
 * globals.css gated on `html[data-hero01]`, so the first paint already shows
 * the narrow window instead of flashing the full panel.
 */

import gsap from 'gsap';

export function hero01(scope: Document | Element = document) {
  const mediaWrapper = scope.querySelector('[data-hero-01-media]');
  const image = scope.querySelector('.hero-01__image');
  const overlay = scope.querySelector('[data-hero-01-overlay]');

  if (!mediaWrapper || !image) return;

  gsap.set(mediaWrapper, {
    clipPath: 'polygon(50% 20%, 50% 20%, 50% 80%, 50% 80%)',
  });
  gsap.set(image, { scale: 1 });
  gsap.set(overlay, { autoAlpha: 0 });

  gsap
    .timeline({
      defaults: { ease: 'power3.out' },
    })
    .to(mediaWrapper, {
      clipPath: 'polygon(35% 20%, 65% 20%, 65% 80%, 35% 80%)',
      duration: 1.4,
      ease: 'power2.inOut',
    })
    .to(
      image,
      {
        scale: 0.86,
        duration: 1.4,
        ease: 'power2.inOut',
      },
      '<',
    )
    .to(
      mediaWrapper,
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.65,
        ease: 'power4.inOut',
      },
      '=-.1',
    )
    .to(
      image,
      {
        scale: 1,
        duration: 1.65,
        ease: 'power4.inOut',
      },
      '<',
    )
    .to(
      overlay,
      {
        autoAlpha: 1,
        duration: 1.7,
      },
      '<+=.5',
    );
}
