'use client';

/**
 * Control — the platform section.
 *
 * Every agency now claims an AI. The only claim worth making is the one that
 * is hard to copy, so this section says the specific thing: Helix works while
 * nobody is watching, and nothing it changes reaches your business until
 * someone approves it.
 *
 * Staged as the approval queue itself rather than an abstract diagram. The
 * product's own mechanism is the most persuasive artwork available, and a
 * stock illustration of a robot would be less true and less interesting.
 */

import { motion, useReducedMotion } from 'motion/react';
import { Serif, Eyebrow, BlurRise, Band, ACCENT } from './primitives';
import { EASE_OUT } from '@/lib/motion';

interface QueuedChange {
  summary: string;
  detail: string;
  weight: 'routine' | 'significant';
}

/** Written as the queue actually reads — plain sentences, before → after. */
const QUEUE: QueuedChange[] = [
  {
    summary: 'Move Northwind to Client review',
    detail: 'Build → Client review',
    weight: 'routine',
  },
  {
    summary: 'Add "Compress hero video" to the checklist',
    detail: 'Unassigned · due Friday',
    weight: 'routine',
  },
  {
    summary: 'Message the client about the launch date',
    detail: 'Outward-facing — read it in full',
    weight: 'significant',
  },
  {
    summary: 'Record $3,500 setup fee from Meridian',
    detail: 'Counts toward revenue once approved',
    weight: 'significant',
  },
];

export function Control() {
  const reduced = useReducedMotion();

  return (
    <Band className="border-t border-white/10 py-24 sm:py-32 lg:py-40">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="max-w-xl">
          <BlurRise>
            <Eyebrow>The platform</Eyebrow>
          </BlurRise>

          <BlurRise delay={0.06}>
            <Serif as="h2" className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)]">
              It works while you sleep.
              <br />
              Nothing ships without you.
            </Serif>
          </BlurRise>

          <BlurRise delay={0.12}>
            <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-white/60">
              Most tools make you choose: an assistant that asks permission for
              every step and gets nothing done, or one you let run and quietly
              stop trusting. Helix does neither. It works straight through —
              reading your projects, drafting the update, moving the
              checklist — and every change it makes waits in one queue for a
              person to take or drop.
            </p>
          </BlurRise>

          <BlurRise delay={0.18}>
            <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-white/60">
              It starts each piece of work able to touch nothing at all. You
              hand it a client, and that is all it can reach. Everything it
              reads and everything it changes is written down as it happens —
              so the record of your agency is a by-product of the work, not
              something anyone has to remember to write.
            </p>
          </BlurRise>

          <BlurRise delay={0.24}>
            <p className="mt-8 text-[13px] text-white/40">
              No agency software on the market works this way.
            </p>
          </BlurRise>
        </div>

        {/* The queue, staged. */}
        <BlurRise delay={0.1}>
          <div className="overflow-hidden rounded-[6px] border border-white/10 bg-white/[0.02]">
            <div className="flex items-baseline justify-between border-b border-white/10 px-5 py-4">
              <span
                style={{
                  fontFamily: 'var(--font-mono-display), ui-monospace, monospace',
                }}
                className="text-[10px] tracking-[0.14em] text-white/40 uppercase"
              >
                Waiting for you
              </span>
              <span className="text-[11px] tabular-nums text-white/40">
                4 changes · 2 significant
              </span>
            </div>

            <ul className="divide-y divide-white/[0.07]">
              {QUEUE.map((change, index) => (
                <motion.li
                  key={change.summary}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{
                    duration: 0.5,
                    ease: EASE_OUT,
                    delay: 0.12 + index * 0.08,
                  }}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] leading-snug text-white/85">
                      {change.summary}
                    </p>
                    <p className="mt-1 text-[11.5px] text-white/40">
                      {change.detail}
                    </p>
                  </div>
                  {change.weight === 'significant' && (
                    <span
                      className="mt-0.5 shrink-0 rounded-[4px] border px-2 py-0.5 text-[10px] tracking-wide"
                      style={{
                        borderColor: `${ACCENT}55`,
                        color: '#f8cd02',
                      }}
                    >
                      Significant
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
              <span className="text-[11.5px] text-white/40">
                Approve the routine ones together. Read the two that matter.
              </span>
              <span className="rounded-[4px] bg-[var(--fx-yellow)] px-3.5 py-1.5 text-[11.5px] font-medium text-[var(--fx-on-yellow)]">
                Approve
              </span>
            </div>
          </div>
        </BlurRise>
      </div>
    </Band>
  );
}
