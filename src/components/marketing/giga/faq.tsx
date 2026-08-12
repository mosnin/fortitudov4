'use client';

/**
 * FAQ — carried forward from the previous landing and re-set in the Giga
 * system: hairline accordion rows on the near-black band, display-face section
 * title, plus-icon toggles. Content covers the five offerings.
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_M, SECTION_Y, TITLE_S } from './tokens';

const FAQS = [
  {
    q: 'What does it cost?',
    a: 'Websites start at $1,500. Software Solutions at $3,500. AI Solutions at $3,000. A Consultation is $500. Digital Marketing is $1,200 a month. You see your own price before you pay anything, and it does not move. No hourly billing. No surprise bills.',
  },
  {
    q: 'How soon can I start?',
    a: 'Today. Pick what you want, answer a few questions about it, check your price, and pay. Your project page opens straight away, and we start digging into the work the next working day.',
  },
  {
    q: 'Do you use AI?',
    a: 'Yes, on the dull parts — setup, boilerplate, test code, and the small repeated changes. It decides nothing. A senior builder checks and shapes every change before it lands, so the judgement calls are still made by people.',
  },
  {
    q: 'How do I see how it is going?',
    a: 'Your project page shows the stage you are in: Discovery, Design, Development, Testing, Review, and Launch. You can message us, send files, and ask for changes in the same place.',
  },
  {
    q: 'What if I want changes?',
    a: 'Ask for them on your project page. Changes inside what we agreed to build cost you nothing. If you want something bigger than that, we price it first and you decide.',
  },
  {
    q: 'Who owns it at the end?',
    a: 'You do. All of it. The code, the design files, the campaign work, and the logins are handed to you at launch. Nothing is locked to us.',
  },
];

function Row({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--fx-hairline)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <Serif as="span" className={`${TITLE_S} text-[var(--fx-white)]`}>
          {q}
        </Serif>
        <Plus
          className={`h-4 w-4 shrink-0 text-[var(--fx-muted)] transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-[13.5px] leading-relaxed text-[var(--fx-muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.6fr]">
          <BlurRise>
            <Eyebrow>FAQ</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              Questions, answered.
            </Serif>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[var(--fx-muted)]">
              Can&apos;t find what you&apos;re looking for?{' '}
              <a
                href="/contact"
                className="text-[var(--fx-white)] underline underline-offset-4 hover:text-[var(--fx-yellow)]"
              >
                Get in touch
              </a>
              .
            </p>
          </BlurRise>
          <BlurRise delay={0.08}>
            <div className="border-t border-[var(--fx-hairline)]">
              {FAQS.map((faq) => (
                <Row key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
