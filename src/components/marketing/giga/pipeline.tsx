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
import { KineticText } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_M, EYEBROW_TEXT, MONO_STYLE, SECTION_Y } from './tokens';

/** What the client actually gets to see at each stage, in their own words. */
const STAGE_NOTES: Record<(typeof CRM_STAGES)[number], string> = {
  onboarding: 'You tell us what you want. We set up your checklist and get the access we need.',
  discovery: 'We dig into it properly. Then we tell you what we found, and what it will cost.',
  design: 'You see the real screens, not a slide deck.',
  build: 'We build it. You watch the task list move. A senior builder checks every change.',
  client_review: 'Your turn. You leave your notes on the work itself.',
  launched: 'It goes live. You get the files, the logins, and notes on how it all works.',
  retained: 'If you want us to, we keep working on it after launch.',
};

const DWELL_MS = 2600;

export function Pipeline() {
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
              <Eyebrow>How a project runs</Eyebrow>
            </BlurRise>
            <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              {/* One string, not two: the mask is per WORD, so the heading
                  still wraps wherever the column tells it to. */}
              <KineticText lines={['Seven stages. You can see which one you’re in.']} />
            </Serif>
            <BlurRise delay={0.28}>
              <p className="mt-5 text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
                No Friday status email. We run your project on the same seven
                stages you see, so &ldquo;where are we?&rdquo; is a page you
                open, not a question you have to ask.
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
                          className={`block text-[17px] font-medium tracking-[-0.01em] transition-colors duration-300 ${
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
                            <span className="block pt-2 text-[13px] leading-relaxed text-[var(--fx-muted)]">
                              {STAGE_NOTES[stage]}
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
              A drawing of the stages — not a real project
            </p>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
