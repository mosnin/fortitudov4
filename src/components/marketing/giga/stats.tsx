'use client';

/**
 * Stats, the numbers band (reference-matched).
 *
 * A short statement on the LEFT, then big SANS numbers on the RIGHT with small
 * uppercase mono labels above each and thin vertical hairline dividers between
 * them. No eyebrow, no centered headline, exactly the reference layout.
 */

import { BlurRise, Mono, Band } from './primitives';

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
  { value: '5', label: 'Things we build' },
  { value: '7', label: 'Stages you can track' },
  { value: '100%', label: 'Yours at launch' },
];

export function Stats() {
  return (
    <Band className="py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
        <BlurRise>
          <p className="max-w-lg text-2xl leading-snug text-white/85 sm:text-[2rem] sm:leading-[1.25]">
            Senior hours go to craft, not to status calls. You can see where
            your project stands from day one.
          </p>
        </BlurRise>

        <BlurRise delay={0.1}>
          <div className="grid grid-cols-3 divide-x divide-white/[0.1]">
            {STATS.map((s) => (
              <div key={s.label} className="px-5 first:pl-0 sm:px-10">
                {/* white/60 (6.9:1), not white/40 (3.8:1): the label is what
                    the number means, so it is body text, not an eyebrow. */}
                <Mono className="text-[10px] text-white/60">{s.label}</Mono>
                <span
                  className="mt-3 block text-[2.75rem] font-light leading-none tracking-tight tabular-nums text-white sm:text-[3.5rem] lg:text-[4.25rem]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </BlurRise>
      </div>
    </Band>
  );
}
