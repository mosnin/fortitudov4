'use client';

/**
 * CtaSection, the closing ask: contained width, display headline on the left, a
 * muted paragraph on the right with the "Talk to us" button directly below it.
 *
 * It used to carry a light and a dark treatment. The logged-out site is
 * charcoal in both themes now, so the light half was dead weight that would
 * only ever have shown up as a bug.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import { TextFlip } from '@/components/ui/text-flip';
import { Eyebrow, Serif } from './primitives';
import { DISPLAY_M, SECTION_Y } from './tokens';

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

export function CtaSection() {
  return (
    <section
      className={`relative overflow-hidden bg-[var(--fx-charcoal)] px-5 sm:px-8 ${SECTION_Y}`}
    >
      {/* Brand bloom (adapted from pixel-perfect gradient-glow-fade: behind
          content, brand hues, both themes) — a soft radial lift under the
          closing ask so the page ends warm instead of flat. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:radial-gradient(90%_70%_at_50%_110%,rgba(248,205,2,0.10),transparent_65%)]"
      />
      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div {...reveal} transition={{ duration: 0.7, ease: EASE_OUT }}>
          {/* The kit's eyebrow, not a local copy of it: this section had its
              own hand-rolled version, which is how the dot and the tracking
              drifted apart from every other eyebrow on the site. */}
          <Eyebrow>Get a demo</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            Ready to build
            {/* The second line flips through what we actually build.
                Left-aligned headline, punctuation inside each item — no
                trailing-character jitter as widths change. */}
            <TextFlip as={motion.span} interval={2.8} className="block">
              <>something real?</>
              <>your website?</>
              <>your software?</>
              <>your next launch?</>
            </TextFlip>
          </Serif>
        </motion.div>

        <motion.div {...reveal} transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }} className="lg:pt-3">
          <p className="max-w-sm text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
            Senior builders, a fixed quote, and a tracker you can watch from kickoff to
            launch — and you own everything the day it ships.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] bg-[var(--fx-yellow)] px-6 text-[14px] font-medium text-[var(--fx-on-yellow)] transition-all duration-200 hover:bg-[var(--fx-yellow-hover)] active:scale-[0.98]"
          >
            Talk to us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
