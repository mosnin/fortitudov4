'use client';

/**
 * Complexity, the closer. A centered header over a three-up grid of raised
 * cards (no animated mockup).
 */

import { ShieldCheck, GitBranch, BarChart3 } from 'lucide-react';
import {
  BlurRise,
  Eyebrow,
  PillGhost,
  Serif,
  Band,
  DISPLAY_M,
  TITLE_S,
  SECTION_Y,
} from './primitives';

const COLUMNS = [
  {
    icon: GitBranch,
    title: 'Routing that thinks',
    desc: 'Projects land with the right senior by specialty and load, or hand-pick and write the brief. Every assignment is logged with the reason.',
  },
  {
    icon: BarChart3,
    title: 'The whole studio, live',
    desc: 'Builds active, drafts pending, reviews due, per builder, read live from the work itself, not a Monday status meeting.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit-ready by design',
    desc: 'Every assignment, revision, and approval is logged with the reason behind it, so the whole build stays honest and reviewable.',
  },
];

export function Complexity() {
  return (
    <Band className={SECTION_Y}>
      <BlurRise>
        <div className="max-w-2xl">
          <Eyebrow>Built for complexity</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            Built to handle the
            <br className="hidden sm:block" /> complexity of a real agency.
          </Serif>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--fx-muted)]">
            One senior team, one way of working. Work routed, progress visible, bottlenecks
            surfaced, every change reviewable. It holds up on a single site and on a multi-year
            software engagement.
          </p>
          <div className="mt-8">
            <PillGhost href="/about">See how the studio runs</PillGhost>
          </div>
        </div>
      </BlurRise>

      <BlurRise delay={0.1}>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {COLUMNS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8 backdrop-blur-sm transition-colors hover:border-[var(--fx-faint)]"
              >
                <Icon className="h-7 w-7" stroke="url(#chippi-grad)" strokeWidth={1.6} />
                <Serif as="h3" className={`mt-6 ${TITLE_S} text-[var(--fx-white)]`}>
                  {c.title}
                </Serif>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--fx-muted)]">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </BlurRise>
    </Band>
  );
}
