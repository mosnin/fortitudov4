'use client';

/**
 * CtaSection, the closing ask: contained width, display headline on the left, a
 * muted paragraph on the right with the "Talk to us" button directly below it.
 *
 * It used to carry a light and a dark treatment. The logged-out site is
 * charcoal in both themes now, so the light half was dead weight that would
 * only ever have shown up as a bug.
 */

import { motion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { TextFlip } from '@/components/ui/text-flip';
import { Eyebrow, PillPrimary, Serif } from './primitives';
import { DISPLAY_S, LEAD, SECTION_Y } from './tokens';

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

export function CtaSection({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].cta;
  return (
    <section
      /* `Band`'s gutter, written out rather than composed: the brand bloom
         below is absolutely positioned against this section, and `Band` puts
         every child inside its centred inner element, which would crop the
         bloom to the content column. The three steps must stay equal to
         `Band`'s — at `sm:px-8` alone this section sat 8px proud of every other
         one from 1024px up. */
      className={`relative overflow-hidden bg-[var(--fx-charcoal)] px-5 sm:px-8 lg:px-10 ${SECTION_Y}`}
    >
      {/* Brand bloom (adapted from pixel-perfect gradient-glow-fade: behind
          content, brand hues, both themes) — a soft radial lift under the
          closing ask so the page ends warm instead of flat. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:radial-gradient(90%_70%_at_50%_110%,rgba(248,205,2,0.10),transparent_65%)]"
      />
      <div className="grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div {...reveal} transition={{ duration: 0.7, ease: EASE_OUT }}>
          {/* The kit's eyebrow, not a local copy of it: this section had its
              own hand-rolled version, which is how the dot and the tracking
              drifted apart from every other eyebrow on the site. */}
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
            {t.headingLead}
            {/* The second line flips through what we actually build.
                Left-aligned headline, punctuation inside each item — no
                trailing-character jitter as widths change. */}
            <TextFlip as={motion.span} interval={2.8} className="block">
              {t.headingFlips}
            </TextFlip>
          </Serif>
        </motion.div>

        <motion.div {...reveal} transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }} className="lg:pt-3">
          <p className={`max-w-sm ${LEAD} text-[var(--fx-muted)]`}>
            {t.lead}
          </p>
          {/* The kit's pill, not a local copy of it. This section hand-rolled
              the same yellow block with `transition-all` on it — which is the
              thing `PillPrimary`'s docstring warns about: the press is a spring
              on `whileTap`, and a CSS `transition-all` smears every frame of it
              through a 200ms curve. It also missed the magnetic pull every
              other primary CTA on the surface has. */}
          <PillPrimary href="/contact" withArrow className="mt-6">
            {t.button}
          </PillPrimary>
        </motion.div>
      </div>
    </section>
  );
}
