'use client';

/**
 * Complexity, the closer. A centered header over a three-up grid of raised
 * cards (no animated mockup).
 */

import { ShieldCheck, GitBranch, BarChart3 } from 'lucide-react';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from './primitives';
import { DISPLAY_M, SECTION_Y, TITLE_S } from './tokens';

/** One icon per column, in the order the dictionary lists them. */
const COLUMN_ICONS = [GitBranch, BarChart3, ShieldCheck];

export function Complexity({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].complexity;
  return (
    <Band className={SECTION_Y}>
      <BlurRise>
        <div className="max-w-2xl">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            {t.headingLine1}
            <br className="hidden sm:block" /> {t.headingLine2}
          </Serif>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--fx-muted)]">
            {t.lead}
          </p>
          <div className="mt-8">
            <PillGhost href="/about">{t.cta}</PillGhost>
          </div>
        </div>
      </BlurRise>

      <BlurRise delay={0.1}>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {t.columns.map((c, i) => {
            const Icon = COLUMN_ICONS[i];
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
