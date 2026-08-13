'use client';

/**
 * The Fortitudo mark as a particle field — the vendored OriginKit
 * SVG-particle canvas (`components/originkit/flair/particle-image.tsx`)
 * configured for this site: it samples `public/brand/fortitudo-mark.png`
 * (same-origin, so `getImageData` never taints) and draws each pixel as a
 * dot in the mark's own yellow. The cursor pushes dots aside; they settle
 * home. Hover-scatter stays OFF — the mark should read as the mark, not
 * dissolve when a pointer wanders past.
 *
 * Reduced motion renders the mark itself as a plain image instead: the
 * vendored loop has no still mode, and a brand mark is the one thing on the
 * page that must never be missing. The swap happens via the safe hook, post
 * hydration, so SSR markup and the first client render always agree.
 */

import Image from 'next/image';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import ParticleImage from '@/components/originkit/flair/particle-image';

export function ParticleMark() {
  const reduce = useReducedMotionSafe();

  if (reduce) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Image
          src="/brand/fortitudo-mark.png"
          alt=""
          width={220}
          height={220}
          className="h-40 w-40 object-contain opacity-90 sm:h-48 sm:w-48"
        />
      </div>
    );
  }

  return (
    <ParticleImage
      imageConfig={{ image: '/brand/fortitudo-mark.png', mode: 'fit', scale: 5 }}
      particleCount={50}
      particleSize={4}
      particleColor="original"
      hoverEnabled={false}
      repulsionEnabled
      repulsionConfig={{ repulsionMode: 'outside', repulsionForce: 30, repulsionRadius: 40 }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
