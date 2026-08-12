'use client';

/**
 * `/services` — the five offerings in detail.
 *
 * Moved into the `(marketing)` route group and rebuilt on the racing-yellow
 * system. It used to live at `src/app/services` with its own `<Header/>` and
 * `<Footer/>`, on the old orange template: clicking "Services" in the nav took
 * you from the charcoal homepage to a different-looking site. The group's
 * layout supplies the chrome now, so this file is only the page.
 *
 * The per-service content is read from `src/lib/services.ts` — the same module
 * the product prices and routes from. The page's own words are in
 * `src/lib/i18n/dictionaries/services-page.ts`.
 *
 * English is pinned here rather than taken as a prop: this IS the route, and a
 * route segment's default export is typed by Next against `params` /
 * `searchParams`, not against arbitrary props. The `[lang]` tree that will
 * render the other two languages does not exist yet (plans/i18n.md); when it
 * lands, the body below moves into a content component that takes `lang`, the
 * way `/pricing` already splits.
 */

import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { services } from '@/lib/services';
import { DEFAULT_LANG } from '@/lib/i18n/markets';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { SERVICES_PAGE } from '@/lib/i18n/dictionaries/services-page';
import { Band, BlurRise, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { BODY, DISPLAY_S, EYEBROW_TEXT, LEAD, MONO_STYLE, SECTION_Y } from '@/components/marketing/giga/tokens';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { CtaSection } from '@/components/marketing/giga/cta';
import { ToneShift } from '@/components/marketing/giga/tone-shift';

/**
 * Days of help after launch, included with every engagement.
 *
 * DUPLICATED. The same figure is stated on /pricing (twice, in
 * pricing-content.tsx) and in the /faq answers, and nothing owns it — it is
 * not in `src/lib/services.ts` beside the offerings it applies to, which is
 * where it belongs. Centralise it there; until then, changing it means
 * changing it in all four places.
 */
const SUPPORT_DAYS = 30;

export default function ServicesPage() {
  const t = SERVICES_PAGE[DEFAULT_LANG];

  /** What every engagement includes, whichever of the five you buy. */
  const alwaysIncluded = [
    t.alwaysIncluded.discovery,
    t.alwaysIncluded.design,
    t.alwaysIncluded.build,
    t.alwaysIncluded.testing,
    t.alwaysIncluded.launch,
    fill(t.alwaysIncluded.support, { days: SUPPORT_DAYS }),
  ];

  return (
    <>
      {/* Hero. No `cta`: every offering band below carries its own yellow
          "Start with …" pill, and one screen gets one primary action. */}
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {t.hero.titleLead}{' '}
            <span className="text-[var(--fx-yellow)]">{t.hero.titleAccent}</span>
          </>
        }
        lead={t.hero.body}
        seed={0}
      />

      {/* One band per offering, alternating sides */}
      {services.map((service, index) => {
        const isEven = index % 2 === 0;
        return (
          <section
            key={service.id}
            id={service.id.replace(/_/g, '-')}
            className={`border-b border-[var(--fx-hairline)] ${SECTION_Y} ${
              isEven
                ? 'bg-[var(--fx-charcoal)]'
                : 'bg-[var(--fx-charcoal-deep)]'
            }`}
          >
            <Band>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
              >
                <div className={isEven ? '' : 'lg:order-2'}>
                  {/* The band opens on its heading now. A chip above it used
                      to carry the offering's starting price — and before that,
                      an icon in a tinted square, the badge pattern AGENTS.md
                      rules out by name. The site advertises no price, and the
                      ask that replaced it is a control, so it belongs in the
                      row of controls below rather than in the eyebrow slot:
                      the section rhythm is eyebrow → headline → one paragraph
                      → the CTA, and a button up here breaks it. */}
                  <Serif as="h2" className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                    {service.name}
                  </Serif>
                  <p className={`mt-4 max-w-lg ${LEAD} text-[var(--fx-muted)]`}>
                    {service.description}
                  </p>

                  <ul className="mt-7 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-[var(--fx-yellow)]" />
                        <span className={`${BODY} text-[var(--fx-muted)]`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* One yellow action per screen: the ghost beside it is
                      where the price went. */}
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <PillPrimary
                      href={`/onboarding?service=${service.id}`}
                      withArrow
                    >
                      {fill(t.offering.startWith, { service: service.name })}
                    </PillPrimary>
                    <PillGhost href="/contact">{t.offering.priceCta}</PillGhost>
                  </div>
                </div>

                {/* What's included — the same list for every offering, which is
                    the point: the floor does not move with the price. */}
                <div className={isEven ? '' : 'lg:order-1'}>
                  <div className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8 sm:p-10">
                    <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                      {t.offering.includedHeading}
                    </p>
                    <div className="mt-6 space-y-4">
                      {alwaysIncluded.map((item) => (
                        <div
                          key={item}
                          className={`flex items-center gap-3 border-b border-[var(--fx-hairline)] pb-4 ${BODY} text-[var(--fx-white)] last:border-0 last:pb-0`}
                        >
                          <Check className="h-4 w-4 shrink-0 text-[var(--fx-yellow)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Band>
          </section>
        );
      })}

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is after the fifth offering because that is where the page
          stops describing and starts asking. The five bands are the catalogue,
          and a visitor reads them one at a time; the two sections below are
          addressed to whoever reached the end of the list without picking. The
          colour marks that change of address. Splitting anywhere inside the
          list would cut the catalogue in half, which is the one thing this
          page's structure will not take. */}
      <ToneShift>
        {/* Bottom ask */}
        <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
          <Band narrow="max-w-2xl">
            <BlurRise>
              <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.notSure.title}
              </Serif>
              <p className={`mt-4 ${LEAD} text-[var(--fx-muted)]`}>
                {t.notSure.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillPrimary href="/contact" withArrow>
                  {t.notSure.ask}
                </PillPrimary>
                <PillGhost href="/pricing">{t.notSure.pricing}</PillGhost>
              </div>
            </BlurRise>
          </Band>
        </section>

        <CtaSection />
      </ToneShift>
    </>
  );
}
