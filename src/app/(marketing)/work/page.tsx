import type { Metadata } from 'next';
import { WorkClient } from '@/components/work/work-client';

export const metadata: Metadata = {
  title: 'Our Work — Fortitudo',
  description:
    'Client projects by Fortitudo Agency — websites, software and AI solutions, shown as they are.',
};

/**
 * /work — the client-work carousel (see `src/components/work/`): every card
 * on the ring is a real client, and clicking the front card opens its case
 * page at /work/[slug]. Reduced-motion and no-WebGL visitors get the same
 * projects as a static grid.
 */
export default function WorkPage() {
  return <WorkClient />;
}
