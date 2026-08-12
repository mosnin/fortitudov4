'use client';

/**
 * "Seven stages, one of them lit" — the delivery pipeline, on the logged-out
 * site.
 *
 * The stages are imported from `src/lib/crm.ts` rather than retyped, because
 * they are the same seven columns the client sees on their portal and the same
 * seven the agency drags cards between. A marketing page that lists a
 * different set of stages than the product ships is a page that will be wrong
 * within a quarter.
 *
 * The rail advances on its own so the section has a pulse, but nothing here is
 * a claim about a real engagement — it is a diagram of the pipeline, and the
 * caption says so.
 */

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { CRM_STAGES, STAGE_LABELS } from '@/lib/crm';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { KineticText } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { BODY_S, DISPLAY_M, EYEBROW_TEXT, LEAD, MONO_STYLE, SECTION_Y, TITLE_S } from './tokens';

const DWELL_MS = 2600;

export function Pipeline({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].pipeline;
  /* Typed against CRM_STAGES rather than read loosely off the dictionary, so a
     stage added to the product without a note here is a build error. */
  const stageNotes: Record<(typeof CRM_STAGES)[number], string> = t.stageNotes;
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % CRM_STAGES.length),
      DWELL_MS,
    );
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <BlurRise>
              <Eyebrow>{t.eyebrow}</Eyebrow>
            </BlurRise>
            <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              {/* One string, not two: the mask is per WORD, so the heading
                  still wraps wherever the column tells it to. */}
              <KineticText lines={t.headingLines} />
            </Serif>
            <BlurRise delay={0.28}>
              {/* 14.5px — exactly between two tokens, so the ROLE decides
                  rather than the arithmetic: this is the one paragraph under a
                  section headline, which is what LEAD is for. */}
              <p className={`mt-5 ${LEAD} text-[var(--fx-muted)]`}>
                {t.lead}
              </p>
            </BlurRise>
          </div>

          <BlurRise delay={0.08}>
            <ol className="border-t border-[var(--fx-hairline)]">
              {CRM_STAGES.map((stage, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={stage}
                    className="border-b border-[var(--fx-hairline)]"
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-current={isActive ? 'step' : undefined}
                      className="flex w-full cursor-pointer items-start gap-5 px-1 py-5 text-left"
                    >
                      <span
                        style={MONO_STYLE}
                        /* The inactive number is muted, not faint: it is the
                           step's name, and --fx-faint is 3.6:1. The active
                           state still reads, because it moves to yellow. */
                        className={`mt-[3px] w-8 shrink-0 text-[11px] tracking-[0.22em] transition-colors duration-300 ${
                          isActive
                            ? 'text-[var(--fx-yellow)]'
                            : 'text-[var(--fx-muted)]'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          /* No `tracking-[-0.01em]`: that was tuned against
                             Geist, and the surface runs Inter Tight with the
                             display face's own -0.03em. A third value here was
                             a hand-tune with nothing left to correct. */
                          className={`block ${TITLE_S} font-medium transition-colors duration-300 ${
                            isActive
                              ? 'text-[var(--fx-white)]'
                              : 'text-[var(--fx-muted)]'
                          }`}
                        >
                          {STAGE_LABELS[stage]}
                        </span>
                        {/* Height, not display: collapsing the note would make
                            the whole list jump on every tick. */}
                        <span
                          className={`grid transition-all duration-500 ease-out ${
                            isActive
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <span className="overflow-hidden">
                            <span className={`block pt-2 ${BODY_S} text-[var(--fx-muted)]`}>
                              {stageNotes[stage]}
                            </span>
                          </span>
                        </span>
                      </span>

                      <span
                        aria-hidden
                        className={`mt-[9px] block h-px shrink-0 transition-all duration-500 ease-out ${
                          isActive
                            ? 'w-10 bg-[var(--fx-yellow)]'
                            : 'w-4 bg-[var(--fx-hairline)]'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* The honesty caption. It is the thing that stops the diagram
                reading as a live engagement, so it is content, not chrome. */}
            <p style={MONO_STYLE} className={`mt-5 ${EYEBROW_TEXT}`}>
              {t.caption}
            </p>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
