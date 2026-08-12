'use client';

/**
 * `/portfolio` — the work.
 *
 * This page previously listed six case studies with named clients ("Maison
 * Noir", "DataPulse", "GrowthForge"), quantified outcomes ("3x conversion rate
 * increase", "450% ROI on ad spend"), and a stats band claiming 50+ projects
 * delivered, 35+ happy clients and a 4.9-star average rating. None of it came
 * from anywhere — it was template filler, and on a live agency site it reads as
 * client proof. Invented outcomes attached to invented company names is the
 * kind of thing that is a problem for the agency, not just for the page, so it
 * is gone rather than restyled.
 *
 * What is here instead is the structure, waiting for real entries. Add them to
 * CASE_STUDIES below as engagements complete and the empty state disappears on
 * its own. Every field is required precisely so a half-filled entry cannot
 * quietly become filler again.
 */

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Band,
  BlurRise,
  Eyebrow,
  PillPrimary,
  Serif,
  MONO_STYLE,
  EYEBROW_TEXT,
  DISPLAY_L,
  DISPLAY_S,
  TITLE_L,
  HERO_Y,
  SECTION_Y,
} from '@/components/marketing/giga/primitives';
import { CtaSection } from '@/components/marketing/giga/cta';

type CaseStudy = {
  /** The engagement, in the client's words where possible. */
  title: string;
  /** The client's real name, or the sector if they are under NDA. */
  client: string;
  /** One of the five offerings. */
  service: string;
  /** A measured outcome you could show the client and have them agree. */
  result: string;
  description: string;
  tags: string[];
  href?: string;
};

/**
 * Real engagements only. An entry here is a public claim about a client — if
 * you cannot point at where the number came from, it does not go in.
 */
const CASE_STUDIES: CaseStudy[] = [];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${HERO_Y}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
        />
        <Band innerClassName="relative max-w-3xl">
          <BlurRise trigger="load">
            <Eyebrow>Portfolio</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Work that speaks{' '}
              <span className="text-[var(--fx-yellow)]">for itself.</span>
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              Builds we have shipped, what they were for, and what changed
              afterwards — with the client&apos;s name on them.
            </p>
          </BlurRise>
        </Band>
      </section>

      <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
        <Band>
          {CASE_STUDIES.length === 0 ? (
            /* The honest empty state. It says what is missing and gives the
               visitor the next best thing, rather than filling the grid with
               work nobody did. */
            <BlurRise className="max-w-2xl">
              <div className="rounded-[6px] border border-dashed border-[var(--fx-hairline)] p-10 sm:p-14">
                <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                  Nothing published yet
                </p>
                <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                  We&apos;d rather show you nothing than show you someone
                  else&apos;s work.
                </Serif>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--fx-muted)]">
                  Case studies go up here once the client has signed off on
                  them, with their name and the numbers they agreed to. Until
                  then, ask us directly — we&apos;ll walk you through recent
                  builds on a call, including the parts that went sideways.
                </p>
                <PillPrimary href="/contact" className="mt-8" withArrow>
                  Ask about recent work
                </PillPrimary>
              </div>
            </BlurRise>
          ) : (
            <div className="grid grid-cols-1 gap-px border-r border-b border-[var(--fx-hairline)] md:grid-cols-2 lg:grid-cols-3">
              {CASE_STUDIES.map((study, index) => (
                <motion.article
                  key={study.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="group flex h-full flex-col border-t border-l border-[var(--fx-hairline)] p-7 transition-colors duration-300 hover:bg-[var(--fx-charcoal-raised)]"
                >
                  <div className="flex items-start justify-between">
                    <span
                      style={MONO_STYLE}
                      className={`rounded-[4px] border border-[var(--fx-hairline)] px-2.5 py-1 ${EYEBROW_TEXT}`}
                    >
                      {study.service}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--fx-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <Serif as="h2" className={`mt-6 ${TITLE_L} text-[var(--fx-white)]`}>
                    {study.title}
                  </Serif>
                  {/* Muted, not faint: the client name is content, and
                      --fx-faint measures 3.57:1 on charcoal — under the 4.5:1
                      body-text floor. --fx-muted is 6.5:1. */}
                  <p className="mt-1 text-[13px] text-[var(--fx-muted)]">
                    {study.client}
                  </p>
                  <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                    {study.description}
                  </p>

                  <div className="mt-6 border-t border-[var(--fx-hairline)] pt-4">
                    <p className="text-[14px] font-medium text-[var(--fx-yellow)]">
                      {study.result}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {study.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[4px] bg-[var(--fx-charcoal-deep)] px-2 py-1 text-[10.5px] leading-none text-[var(--fx-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </Band>
      </section>

      <CtaSection />
    </>
  );
}
