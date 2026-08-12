'use client';

/**
 * `/faq` — the questions founders actually ask.
 *
 * Moved into the `(marketing)` group and rebuilt on the racing-yellow system;
 * it used to carry its own `<Header/>`/`<Footer/>` on the old orange template.
 *
 * The answers sell only what `src/lib/services.ts` lists: five offerings, no
 * plan tiers. Answers that quoted Starter/Professional/Enterprise revision
 * allowances, enterprise payment plans, funnel timelines and a 7–90 day support
 * window were describing a product that does not exist — every number here is
 * now traceable to `services.ts`, `crm.ts` or the terms of service, and the
 * ones that were not have been replaced with what we actually commit to.
 *
 * The four headings and sixteen answers now live in
 * `src/lib/i18n/dictionaries/faq-page.ts`, along with the `metadata` the
 * sibling `layout.tsx` renders. This file is structure and behaviour only, and
 * takes a `lang` so the `[lang]` tree can render it without a second copy.
 */

import { ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { Band, BlurRise, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { BODY, DISPLAY_S, EYEBROW_TEXT, LEAD, MONO_STYLE, SECTION_Y, TITLE_S } from '@/components/marketing/giga/tokens';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { CtaSection } from '@/components/marketing/giga/cta';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { FAQ } from '@/lib/i18n/dictionaries/faq-page';
import type { Lang } from '@/lib/i18n/markets';

export default function FAQPage({ lang = 'en' }: { lang?: Lang }) {
  const t = FAQ[lang];

  return (
    <>
      {/* Hero. No `cta`: the page's ask is the "still stuck" band further down,
          which already carries the one yellow pill. */}
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {t.hero.titleLead}{' '}
            <span className="text-[var(--fx-yellow)]">{t.hero.titleAccent}</span>
          </>
        }
        lead={t.hero.body}
        seed={5}
      />

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is directly under the hero, which is the whole pitch this
          page has: four words of promise, and then sixteen answers. Everything
          below the hero is the substance, so the substance is what turns
          yellow.

          The obvious alternative — splitting after the questions, the way the
          homepage splits before its proof — was tried and rejected. The
          section that follows the accordions paints `--fx-charcoal-deep`,
          which inverts to black, so the flip would land on a black band and
          the page would show no yellow at all until the closing ask. A tone
          shift that produces no tone is not one. */}
      <ToneShift>
        {/* Questions, by category */}
        <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
          <Band innerClassName="max-w-3xl">
            <div className="space-y-16">
              {t.categories.map((category) => (
                <BlurRise key={category.category}>
                  <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                    {category.category}
                  </p>

                  <Accordion.Root
                    type="single"
                    collapsible
                    className="mt-5 border-t border-[var(--fx-hairline)]"
                  >
                    {category.questions.map((item, i) => (
                      <Accordion.Item
                        key={item.q}
                        value={`${category.category}-${i}`}
                        className="border-b border-[var(--fx-hairline)]"
                      >
                        <Accordion.Trigger className={`group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left ${TITLE_S} font-medium text-[var(--fx-white)] transition-colors [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-[var(--fx-yellow)]`}>
                          {item.q}
                          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--fx-muted)] transition-transform duration-200" />
                        </Accordion.Trigger>
                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                          <div className={`pb-5 ${BODY} text-[var(--fx-muted)]`}>
                            {item.a}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </BlurRise>
              ))}
            </div>
          </Band>
        </section>

        {/* Still stuck. `--fx-charcoal-deep` inverts to black, so this band is
            a full-width black plate on the yellow and its ink has to flip
            back — hence the surface mark. */}
        <section
          data-fx-surface="dark"
          className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)] ${SECTION_Y}`}
        >
          <Band innerClassName="max-w-2xl">
            <BlurRise>
              <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.still.title}
              </Serif>
              <p className={`mt-4 ${LEAD} text-[var(--fx-muted)]`}>
                {t.still.body}
              </p>
              <PillPrimary href="/contact" className="mt-8" withArrow>
                {t.still.cta}
              </PillPrimary>
            </BlurRise>
          </Band>
        </section>

        <CtaSection />
      </ToneShift>
    </>
  );
}
