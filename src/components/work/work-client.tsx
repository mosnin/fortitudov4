'use client';

/**
 * The /work stage. Mounts the vendored ring carousel inside a 100svh section,
 * and swaps to a static grid in the two worlds the ring cannot serve:
 *
 *  - prefers-reduced-motion: the carousel IS motion — a spinning ring with a
 *    load choreography — so a visitor who asked for stillness gets the same
 *    ten projects as a plain grid of links instead of a paused canvas.
 *  - no WebGL: the vendored component fails loudly and calls `onFallback`;
 *    the grid takes over rather than leaving a blank stage.
 *
 * Opening a case runs through the site's shutter transition: the carousel's
 * click isn't an anchor, so the PageShutter listener never sees it — the
 * cover is driven here explicitly with the same module.
 */

import { useCallback, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import { coverPage, revealPage } from '@/lib/page-shutter';
import { WORK_PROJECTS } from '@/lib/work-projects';
import { Band, Eyebrow } from '@/components/marketing/giga/primitives';
import { BODY_S, EYEBROW_TEXT, MONO_STYLE, SECTION_Y, TITLE_S } from '@/components/marketing/giga/tokens';

// The ring is three.js + shaders — client-only, and only when it will mount.
const Carousel = dynamic(() => import('./carousel'), { ssr: false });

interface RingProject {
  slug?: string;
  name?: string;
}

function WorkGrid() {
  return (
    <section className={`bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
      <Band>
        <Eyebrow>Our work</Eyebrow>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_PROJECTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className="group overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] transition-colors hover:border-[var(--fx-faint)]"
            >
              <div className="aspect-[3/2] overflow-hidden">
                {/* Same atlas art the ring deals — placeholder tiles until the
                    owner supplies imagery. Decorative next to the name below. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.art}
                  alt=""
                  loading={i < 3 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3 px-4 py-3.5">
                <span className={`${TITLE_S} text-[var(--fx-white)]`}>{p.name}</span>
                <span style={MONO_STYLE} className={`${EYEBROW_TEXT} shrink-0`}>
                  {p.service}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className={`mt-8 max-w-md ${BODY_S} text-[var(--fx-muted)]`}>
          Project imagery is on its way — every name here is a real client.
        </p>
      </Band>
    </section>
  );
}

export function WorkClient() {
  const reduce = useReducedMotionSafe();
  const router = useRouter();
  const [webglFailed, setWebglFailed] = useState(false);

  const openProject = useCallback(
    (p: RingProject) => {
      if (!p?.slug) return;
      const href = `/work/${p.slug}`;
      coverPage().then(() => {
        router.push(href);
        // The PageShutter instance in the layout reveals on the pathname
        // change; this is only the belt for the unlikely case it unmounted.
        setTimeout(() => revealPage(), 4000);
      });
    },
    [router],
  );

  const onFallback = useCallback(() => setWebglFailed(true), []);

  if (reduce || webglFailed) return <WorkGrid />;

  return (
    // The ring owns wheel and swipe inside this stage (that is the resource's
    // interaction model), so the section is exactly one viewport tall and the
    // rest of the site is reachable through the header and the drawer.
    <section aria-label="Our work — project carousel" className="relative h-[100svh] overflow-hidden">
      <Carousel onOpen={openProject} onFallback={onFallback} />
    </section>
  );
}
