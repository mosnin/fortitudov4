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

import { Counter } from './motion-kit';
import { Band, BlurRise, Mono, Serif } from './primitives';
import { SECTION_Y } from './tokens';

/**
 * Three numbers, and every one of them has to be answerable when a client asks
 * where it came from. Measurements nobody took ("94% of boilerplate handled",
 * "< 5 min average first response") have no baseline and no log behind them, so
 * they are not here. What is left are facts the codebase itself settles: the
 * offering list is five long (`src/lib/services.ts`), the delivery pipeline the
 * client's portal reads from is seven stages (`CRM_STAGES` in `src/lib/crm.ts`),
 * and handover at launch is total — the promise the beliefs and the FAQ make.
 */
const STATS = [
  { value: 5, suffix: '', label: 'Things we build' },
  { value: 7, suffix: '', label: 'Stages you can track' },
  { value: 100, suffix: '%', label: 'Yours at launch' },
];

export function Stats() {
  return (
    <Band className={SECTION_Y}>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <BlurRise>
          <p className="max-w-lg text-2xl leading-snug text-[var(--fx-white)] sm:text-[2rem] sm:leading-[1.25]">
            Senior hours go to craft, not to status calls. You can see where
            your project stands from day one.
          </p>
        </BlurRise>

        {/* The numbers ARE this band's motion: they roll up once, on entry.
            Nothing else here animates — a count-up underneath a blur-rise
            underneath a stagger is three arrivals for three figures. */}
        <div className="grid grid-cols-3 divide-x divide-[var(--fx-hairline)]">
          {STATS.map((s) => (
            <div key={s.label} className="px-5 first:pl-0 sm:px-10">
              {/* --fx-muted (6.5:1), not --fx-faint: the label is what the
                  number means, so it is body text, not an eyebrow. */}
              <Mono className="text-[11px] text-[var(--fx-muted)]">{s.label}</Mono>
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
