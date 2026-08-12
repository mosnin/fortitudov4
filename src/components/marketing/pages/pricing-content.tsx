/**
 * The /pricing page body, on the dark cinematic redesign system (layout ported
 * from the giga marketing kit's pricing page; wording maps to Fortitudo's
 * fixed-quote engagement model).
 *
 * NO PRICES. The page kept its route, its nav entry and its promise — one
 * fixed price, agreed before work starts, no hourly billing, no surprise
 * invoices — and every figure is gone. It answers HOW pricing works and ends
 * at the contact form. Three things went with the numbers:
 *
 *  - the `LocalPrice` / `PriceText` / `CurrencyNote` client components, and
 *    with them the last consumer of `src/components/marketing/local-price.tsx`,
 *    which is deleted;
 *  - `CurrencyRing`, a band of eleven orbiting currency codes whose whole copy
 *    was "this page shows the price in your money". With no price on the page
 *    it advertised something the site no longer does;
 *  - the offering price list, which is now the same five offerings each
 *    pointing at the form.
 *
 * The real amounts live in `src/lib/pricing.ts` and are what the product
 * invoices clients from. Nothing here reads them.
 *
 * Server component; stays statically generated.
 *
 * The words are in `src/lib/i18n/dictionaries/pricing-page.ts`. `lang`
 * defaults to English because the `[lang]` route tree that will pass a real
 * one has not shipped yet (plans/i18n.md); when it does, both trees render
 * this one component with a different `lang`, so there is never a forked
 * English and Spanish page to drift apart.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { services, projectPhaseNames } from '@/lib/services';
import { LANG_TAG, type Lang } from '@/lib/i18n/markets';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { EngagementPlans } from '@/components/marketing/pages/engagement-plans';
import { Band, BlurRise, Eyebrow, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import {
  BODY,
  BODY_S,
  DISPLAY_S,
  EYEBROW_TEXT,
  MONO_STYLE,
  LEAD,
  SECTION_Y_TIGHT,
  TITLE_S,
} from '@/components/marketing/giga/tokens';

/**
 * Days of help after launch, included with every engagement.
 *
 * DUPLICATED. The same figure is stated in the always-included list on
 * /services and in the /faq answers, and nothing owns it — it is not in
 * `src/lib/services.ts` beside the offerings it applies to, which is where it
 * belongs. Centralise it there; until then, changing it means changing it in
 * all four places. It is a number, so it never sits inside a dictionary
 * string: the copy carries `{days}` and this fills it.
 */
const SUPPORT_DAYS = 30;

export function PricingContent({ lang = 'en' }: { lang?: Lang }) {
  const t = PRICING_PAGE[lang];

  /**
   * What every engagement commits to. This band used to read "The engagement,
   * by the numbers" and present a 14–30 day delivery window and 1–3 revision
   * rounds as measured facts; neither had a source anywhere in the codebase,
   * and a measurement we have not taken is a fabrication. Each entry now
   * traces to one: the stage count to `projectPhaseNames` in lib/services.ts
   * (the same stages the dashboard tracker and the FAQ name), the support
   * window to the always-included list on /services, and revisions to the
   * approved scope the CRM checklist gates kickoff on (`Scope & fixed quote
   * approved`, lib/crm.ts).
   *
   * The figures are built here, not in the dictionary: two of the three are
   * numbers, and a number written into translated prose is a number that
   * silently disagrees with itself one language over.
   */
  const commitments = [
    {
      id: 'phases',
      label: t.commitments.phases.label,
      figure: String(projectPhaseNames.length),
      line: t.commitments.phases.line,
    },
    {
      id: 'revisions',
      label: t.commitments.revisions.label,
      figure: t.commitments.revisions.figure,
      line: t.commitments.revisions.line,
    },
    {
      id: 'support',
      label: t.commitments.support.label,
      figure: String(SUPPORT_DAYS),
      line: t.commitments.support.line,
    },
  ];

  /** The four questions, in render order. */
  const faqs = [t.faq.fixed, t.faq.from, t.faq.afterLaunch, t.faq.payments];

  return (
    <div lang={LANG_TAG[lang]} className="bg-[var(--fx-charcoal)] text-[var(--fx-white)]">
      {/* Hero — the same dot-matrix field every other sub-page now opens on. It
          used to be a full-bleed stock photograph under two scrims, left from
          the photography-led design, and it made /pricing look like a different
          site to the page it links from.

          No `cta`: the engagement cards directly below are the ask, and each
          one carries its own button. The vertical step is `PageHero`'s own
          `HERO_Y`. */}
      <PageHero
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.body}
        seed={1}
      />

      {/* Engagement cards */}
      <EngagementPlans lang={lang} />

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is after the engagement cards. Above it the page says what
          you can buy; below it, everything is how buying works — the two
          specialist engagements, how a quote is arrived at, what every project
          includes, the four questions people ask, and the ask itself. A
          visitor still reading past the cards has decided they want something,
          and the colour marks that they crossed.

          `text-[var(--fx-white)]` is restated here because the charcoal
          wrapper above computed it to white; inside the flip the same token
          resolves to black, so inherited ink follows the ground. */}
      <ToneShift className="text-[var(--fx-white)]">
        {/* Specialist engagements (consultation + retainer) */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-3xl">
            <div>
              <Eyebrow>{t.specialists.eyebrow}</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.specialists.title}
              </Serif>
              <p className={`mt-5 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>
                {t.specialists.body}
              </p>
            </div>
            {/* Both cards paint `--fx-charcoal-raised`, which inverts to
                black; the surface mark flips their ink back. Each used to
                carry an amount under its heading — a localized consultation
                price and the word "Custom". Both are the contact link now. */}
            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              {[t.specialists.consultation, t.specialists.retainer].map((card) => (
                <div
                  key={card.title}
                  data-fx-surface="dark"
                  className="flex flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6"
                >
                  <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                    {card.title}
                  </Serif>
                  <p className={`mt-1.5 ${BODY_S} text-[var(--fx-muted)]`}>{card.scopeLine}</p>
                  <p className={`mt-4 flex-1 ${BODY_S} text-[var(--fx-muted)]`}>{card.note}</p>
                  <Link
                    href="/contact"
                    className={`mt-5 inline-flex items-center gap-1.5 ${BODY} font-medium text-[var(--fx-white)] underline-offset-4 transition-colors hover:text-[var(--fx-yellow)] hover:underline`}
                  >
                    {t.specialists.cardCta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
            <p className={`mt-6 ${BODY} text-[var(--fx-muted)]`}>
              {t.specialists.biggerLead}{' '}
              <Link href="/contact" className="font-medium text-[var(--fx-yellow)] hover:underline">
                {t.specialists.biggerLink}
              </Link>
              .
            </p>
          </BlurRise>
        </Band>

        {/* How a price is arrived at, then the five offerings */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-3xl">
            <div>
              <Eyebrow>{t.howPricing.eyebrow}</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.howPricing.title}
              </Serif>
              <p className={`mt-5 ${LEAD} text-[var(--fx-muted)]`}>
                {t.howPricing.body}
              </p>
            </div>

            {/* The three steps. This band used to be a price list — five rows,
                five "from $x" figures. It is the process now, because that is
                what the page has left to explain and it is the part a buyer
                actually wants to know. */}
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.howPricing.steps.map((step, i) => (
                <li
                  key={step.title}
                  data-fx-surface="dark"
                  className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-5"
                >
                  <p style={MONO_STYLE} className={EYEBROW_TEXT}>{String(i + 1).padStart(2, '0')}</p>
                  <p className={`mt-3 ${BODY} font-medium text-[var(--fx-white)]`}>{step.title}</p>
                  <p className={`mt-1.5 ${BODY_S} text-[var(--fx-muted)]`}>{step.body}</p>
                </li>
              ))}
            </ol>

            {/* The five offerings, each a way into the same form. `services.ts`
                is the same list the product and the admin side read. */}
            <p className="mt-10">
              <Eyebrow>{t.howPricing.listHeading}</Eyebrow>
            </p>
            <ul
              data-fx-surface="dark"
              className="mt-5 divide-y divide-[var(--fx-hairline)] overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]"
            >
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href="/contact"
                    className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[var(--fx-charcoal-deep)]"
                  >
                    <span className={`${BODY} text-[var(--fx-white)]`}>{s.name}</span>
                    <span
                      className={`flex items-center gap-1.5 ${BODY_S} text-[var(--fx-muted)] transition-colors group-hover:text-[var(--fx-white)]`}
                    >
                      {t.howPricing.listCta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-10">
              <Eyebrow>{t.commitments.eyebrow}</Eyebrow>
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {commitments.map((fact) => (
                <div
                  key={fact.id}
                  data-fx-surface="dark"
                  className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-5"
                >
                  <p className={`${BODY} font-medium text-[var(--fx-white)]`}>{fact.label}</p>
                  <Serif
                    as="p"
                    className="mt-2 text-2xl font-light tabular-nums text-[var(--fx-white)]"
                  >
                    {fact.figure}
                  </Serif>
                  <p className={`mt-1 ${BODY_S} text-[var(--fx-muted)]`}>{fact.line}</p>
                </div>
              ))}
            </div>
          </BlurRise>
        </Band>

        {/* FAQ. `{days}` is the only token left in these answers — the two
            price tokens went with the figures. */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-3xl">
            <Eyebrow>{t.faq.eyebrow}</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              {t.faq.title}
            </Serif>
          </BlurRise>
          <ul className="mt-12 max-w-3xl divide-y divide-[var(--fx-hairline)]">
            {faqs.map((item, i) => (
              <BlurRise key={item.q} delay={i * 0.04}>
                <li className="py-7">
                  <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                    {item.q}
                  </Serif>
                  <p className={`mt-2.5 ${BODY} text-[var(--fx-muted)]`}>
                    {fill(item.a, { days: SUPPORT_DAYS })}
                  </p>
                </li>
              </BlurRise>
            ))}
          </ul>
        </Band>

        {/* Closing CTA. The primary used to send you to /sign-up to see a
            price; the price is the form now. */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-2xl">
            <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
              {t.cta.title}
            </Serif>
            <p className={`mt-5 max-w-md ${LEAD} text-[var(--fx-muted)]`}>
              {t.cta.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillPrimary href="/contact" withArrow>
                {t.cta.primary}
              </PillPrimary>
              <PillGhost href="/services">{t.cta.secondary}</PillGhost>
            </div>
          </BlurRise>
        </Band>
      </ToneShift>
    </div>
  );
}
