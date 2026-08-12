'use client';

/**
 * Complexity, the closer. A centered header over a three-up grid of raised
 * cards (no animated mockup).
 */

import { ShieldCheck, GitBranch, BarChart3 } from 'lucide-react';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from './primitives';
import { DISPLAY_M, SECTION_Y, TITLE_S } from './tokens';

const COLUMNS = [
  {
    icon: GitBranch,
    title: 'The right person gets it',
    desc: 'Your project goes to the senior who does that kind of work. We write down who took it and why.',
  },
  {
    icon: BarChart3,
    title: 'Nothing sits in a queue',
    desc: 'We can see every job in progress and every one waiting. It comes from the work itself, not from a Monday meeting.',
  },
  {
    icon: ShieldCheck,
    title: 'Everything is written down',
    desc: 'Who did what, what changed, and who said yes to it. You can go back and read any of it.',
  },
];

export function Complexity() {
  return (
    <Band className={SECTION_Y}>
      <BlurRise>
        <div className="max-w-2xl">
          <Eyebrow>Big projects too</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            Nothing about your project
            <br className="hidden sm:block" /> gets lost.
          </Serif>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--fx-muted)]">
            One team, one way of working. Every job has a name on it, every change is
            written down, and you can see all of it. That holds for a one-page site and
            for software we build over years.
          </p>
          <div className="mt-8">
            <PillGhost href="/about">See how we work</PillGhost>
          </div>
        </div>
      </BlurRise>

      <BlurRise delay={0.1}>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {COLUMNS.map((c) => {
            const Icon = c.icon;
            return (
              <div data-fx-surface="dark"
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
