'use client';

/**
 * Stats, the numbers band (reference-matched).
 *
 * A short statement on the LEFT, then big SANS numbers on the RIGHT with small
 * uppercase mono labels above each and thin vertical hairline dividers between
 * them. No eyebrow, no centered headline, exactly the reference layout.
 *
 * Motion: the figures roll up once as the band enters (`Counter`), and that is
 * the whole of it. The counter reserves the width of its finished value first,
 * so "100%" does not shove its own divider around on the way up.
 */

import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { Counter } from './motion-kit';
import { Band, BlurRise, Mono, Serif } from './primitives';
import { DISPLAY_XS, SECTION_Y } from './tokens';

/**
 * Three numbers, and every one of them has to be answerable when a client asks
 * where it came from. Measurements nobody took ("94% of boilerplate handled",
 * "< 5 min average first response") have no baseline and no log behind them, so
 * they are not here. What is left are facts the codebase itself settles: the
 * offering list is five long (`src/lib/services.ts`), the delivery pipeline the
 * client's portal reads from is seven stages (`CRM_STAGES` in `src/lib/crm.ts`),
 * and handover at launch is total — the promise the beliefs and the FAQ make.
 *
 * The figures stay here rather than in the dictionary: they are the same in
 * every language, and a number a translator can edit is a number that will
 * disagree with the codebase it came from. Only the labels are translated.
 */
const FIGURES = [
  { value: 5, suffix: '' },
  { value: 7, suffix: '' },
  { value: 100, suffix: '%' },
];

export function Stats({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].stats;
  return (
    <Band className={SECTION_Y}>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <BlurRise>
          {/* A DISPLAY step, not a body one. This line measured 32px — the
              largest paragraph on the site, at no step of any ladder, hand-set
              with its own responsive bump and its own leading. It is not body
              copy and no body token fits it: it is the band's headline, sitting
              where a section would put its `h2`, so it takes the display
              ladder's smallest step and the display face's weight and tracking
              (one family on this surface, so only the weight moves). */}
          <Serif as="p" className={`max-w-lg ${DISPLAY_XS} text-[var(--fx-white)]`}>
            {t.statement}
          </Serif>
        </BlurRise>

        {/* The numbers ARE this band's motion: they roll up once, on entry.
            Nothing else here animates — a count-up underneath a blur-rise
            underneath a stagger is three arrivals for three figures. */}
        <div className="grid grid-cols-3 divide-x divide-[var(--fx-hairline)]">
          {FIGURES.map((s, i) => (
            <div key={t.labels[i]} className="px-5 first:pl-0 sm:px-10">
              {/* --fx-muted (6.5:1), not --fx-faint: the label is what the
                  number means, so it is body text, not an eyebrow. */}
              <Mono className="text-[11px] text-[var(--fx-muted)]">{t.labels[i]}</Mono>
              <Serif
                as="span"
                className="mt-3 block text-[2.75rem] font-light leading-none tabular-nums text-[var(--fx-white)] sm:text-[3.5rem] lg:text-[4.25rem]"
              >
                <Counter value={s.value} suffix={s.suffix} />
              </Serif>
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
}
