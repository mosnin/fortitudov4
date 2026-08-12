'use client';

/**
 * FAQ — carried forward from the previous landing and re-set in the Giga
 * system: hairline accordion rows on the near-black band, display-face section
 * title, plus-icon toggles. Content covers the five offerings.
 *
 * The cost answer used to interpolate all five starting prices out of
 * `src/lib/pricing.ts`. The public site does not advertise a price any more —
 * you tell us what you need and we send you a fixed one — so the answers carry
 * no tokens and this file no longer reads the checkout table.
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { BODY, BODY_S, DISPLAY_M, SECTION_Y, TITLE_S } from './tokens';

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
            <p className={`pb-5 pr-8 ${BODY_S} text-[var(--fx-muted)]`}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].faq;
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.6fr]">
          <BlurRise>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              {t.heading}
            </Serif>
            <p className={`mt-5 max-w-xs ${BODY} text-[var(--fx-muted)]`}>
              {t.helpText}{' '}
              <a
                href="/contact"
                className="text-[var(--fx-white)] underline underline-offset-4 hover:text-[var(--fx-yellow)]"
              >
                {t.helpLink}
              </a>
              .
            </p>
          </BlurRise>
          <BlurRise delay={0.08}>
            <div className="border-t border-[var(--fx-hairline)]">
              {t.items.map((faq) => (
                <Row key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
