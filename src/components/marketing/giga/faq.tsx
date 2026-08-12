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
import type { ServiceType } from '@/lib/services';
import { formatUsd, getPricing } from '@/lib/pricing';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_M, SECTION_Y, TITLE_S } from './tokens';

/**
 * The price tokens the answers interpolate, read from the table checkout
 * charges from (`src/lib/pricing.ts`) rather than typed into the sentence —
 * a figure written into prose is a figure that will disagree with the invoice,
 * three languages at a time.
 *
 * A service that somehow has no pricing row contributes no value, so `fill()`
 * leaves its `{token}` standing: visible in review, where a silently vanished
 * price is not.
 */
const PRICE_TOKENS: Record<string, string> = (
  [
    ['websites', 'websites'],
    ['software', 'software_solutions'],
    ['ai', 'ai_solutions'],
    ['consultation', 'consultation'],
    ['marketing', 'digital_marketing'],
  ] as [string, ServiceType][]
).reduce<Record<string, string>>((tokens, [token, service]) => {
  const pricing = getPricing(service);
  if (pricing) tokens[token] = formatUsd(pricing.amountCents);
  return tokens;
}, {});

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

export function Faq({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].faq;
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.6fr]">
          <BlurRise>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
              {t.heading}
            </Serif>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[var(--fx-muted)]">
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
                <Row key={faq.q} q={faq.q} a={fill(faq.a, PRICE_TOKENS)} />
              ))}
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
