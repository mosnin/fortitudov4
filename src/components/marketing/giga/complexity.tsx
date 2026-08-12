'use client';

/**
 * Complexity, the closer. A centered header over a three-up grid of raised
 * cards (no animated mockup).
 */

import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from './primitives';
import { BODY, DISPLAY_M, LEAD, SECTION_Y, TITLE_S } from './tokens';

/* The three columns used to open on a lucide glyph stroked with the brand
   gradient. That is the "decorative chip above a heading" pattern AGENTS.md
   rules out by name, and it took the last consumer of the `chippi-grad` SVG
   gradient with it when it went. */

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
          <p className={`mt-6 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>
            {t.lead}
          </p>
          <div className="mt-8">
            <PillGhost href="/about">{t.cta}</PillGhost>
          </div>
        </div>
      </BlurRise>

      <BlurRise delay={0.1}>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {t.columns.map((c) => (
            <div data-fx-surface="dark"
              key={c.title}
              className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8 backdrop-blur-sm transition-colors hover:border-[var(--fx-faint)]"
            >
              <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
                {c.title}
              </Serif>
              <p className={`mt-2.5 ${BODY} text-[var(--fx-muted)]`}>{c.desc}</p>
            </div>
          ))}
        </div>
      </BlurRise>
    </Band>
  );
}
