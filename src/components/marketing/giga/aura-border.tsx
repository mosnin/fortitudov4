'use client';

/**
 * AuraBorder — React mount for the vendored Aurora Glow
 * (`src/components/originkit/flair/aurora-glow.ts`).
 *
 * WHERE IT LIVES AND WHY: the "get started" ask. The header's "Get a price"
 * and the hero CTA both land on /contact, and the form card there is the
 * container the glow frames — a dark surface (the effect renders an opaque
 * near-charcoal canvas, so only a dark card can host it). Arriving on the
 * page is what a get-started click produces, so the glow activates when the
 * card enters the viewport, ripples from the submit button
 * (`data-aura-origin`), and `pulse()` re-fires once per submitted request —
 * exactly the resource's intended rhythm.
 *
 * The IntersectionObserver doubles as this site's frame-budget rule: the
 * glow's rAF loop runs only while the card is actually on screen (idle and
 * off-screen states cost zero frames; the browser parks rAF in hidden tabs).
 * Reduced-motion snapping is handled inside the vendored function itself.
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { auraBorder } from '@/components/originkit/flair/aurora-glow';

/** The resource's hosted blue-noise dither — kept by contract; a missing
 *  texture only costs slight banding, never a failure. */
const DITHER_SRC =
  'https://www.details.so/vault-previews/aurora-glow/_astro/dither.DYfTq7JB.png';

interface AuraInstance {
  setActive(active: boolean): void;
  pulse(): void;
  setPalette(name: string): void;
  destroy(): void;
}

export function AuraBorder({
  children,
  className,
  pulseSignal = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Increment to fire one extra ripple (one per request is the rhythm). */
  pulseSignal?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    auraBorder(root);
    const instance = (root as unknown as { __auraBorder?: AuraInstance }).__auraBorder;
    if (!instance) return; // WebGL unavailable → data-state="unsupported", card renders plain

    const io = new IntersectionObserver(
      ([entry]) => instance.setActive(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      instance.destroy();
    };
  }, []);

  useEffect(() => {
    if (pulseSignal <= 0) return;
    const root = rootRef.current as unknown as { __auraBorder?: AuraInstance } | null;
    root?.__auraBorder?.pulse();
  }, [pulseSignal]);

  return (
    <div
      ref={rootRef}
      data-aura-border
      data-dither-src={DITHER_SRC}
      data-state="off"
      data-palette="spectrum"
      // The positioning contract: relative + isolate on the root, canvas
      // absolute underneath, host content stacked above.
      className={cn('relative isolate overflow-hidden', className)}
    >
      <canvas
        data-aura-canvas
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
