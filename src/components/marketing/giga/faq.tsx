'use client';

/**
 * FAQ — carried forward from the previous landing and re-set in the Giga
 * system: hairline accordion rows on the near-black band, serif section
 * title, plus-icon toggles. Content covers the five offerings.
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import { Serif, Eyebrow, BlurRise, Band } from './primitives';

const FAQS = [
  {
    q: 'What does an engagement cost?',
    a: 'Websites start at $1,500, software solutions at $3,500, AI solutions at $3,000, consultations at $500, and digital marketing retainers at $1,200/month. You see your exact fixed quote during onboarding — the price you approve is the price you pay. No hourly billing, no surprise invoices.',
  },
  {
    q: 'How fast can I actually get started?',
    a: 'Same day. Pick a service, run through the Helix onboarding (about five minutes), review your quote, and submit payment. Your project dashboard and build tracker go live immediately, and the team kicks off discovery within one business day.',
  },
  {
    q: 'What does Helix actually do?',
    a: 'Helix works alongside our senior team, not instead of it. It handles scaffolding, boilerplate, test suites, and revision churn — the mechanical hours that inflate agency timelines. Every change it proposes is reviewed and shaped by a senior builder before it lands. You get human judgment on design and architecture, with weeks shaved off delivery.',
  },
  {
    q: 'How do I track my project?',
    a: 'Your dashboard includes a real-time phase tracker — Discovery, Design, Development, Testing, Review, and Launch — plus direct messaging with the team, file sharing, and revision requests, all in one place.',
  },
  {
    q: 'What if I need changes along the way?',
    a: 'Revision rounds are built into every engagement, and you request them right from your dashboard. If scope changes significantly, we re-quote transparently before any extra work starts.',
  },
  {
    q: 'Who owns the work when we’re done?',
    a: 'You do — completely. Full source code, design files, campaign assets, and infrastructure access are handed over at launch. No lock-in, no licensing games.',
  },
];

function Row({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span
          style={{ fontFamily: 'var(--font-sans)' }}
          className="text-[15px] font-medium text-white"
        >
          {q}
        </span>
        <Plus
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
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
            <p className="pb-5 pr-8 text-[13.5px] leading-relaxed text-white/55">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#1b1b1d] py-24 text-white sm:py-32">
      <Band>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.6fr]">
          <BlurRise>
            <Eyebrow>FAQ</Eyebrow>
            <Serif className="mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.06] text-white">
              Questions, answered.
            </Serif>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/55">
              Can&apos;t find what you&apos;re looking for?{' '}
              <a href="/contact" className="text-white underline underline-offset-4 hover:text-white/80">
                Get in touch
              </a>
              .
            </p>
          </BlurRise>
          <BlurRise delay={0.08}>
            <div className="border-t border-white/[0.08]">
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
