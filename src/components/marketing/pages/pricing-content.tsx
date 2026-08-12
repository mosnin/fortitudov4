/**
 * The /pricing page body, on the dark cinematic redesign system (layout ported
 * unchanged from the giga marketing kit's pricing page; wording maps to
 * Fortitudo's fixed-quote engagement model).
 *
 * English is the only shipped language, but price AMOUNTS still render via the
 * LocalPrice / PriceText client components so the visitor's geo-resolved
 * display currency applies on top (USD default; server render and first paint
 * show the USD base price — the honest fallback).
 *
 * Server component; stays statically generated (currency hydrates client-side
 * from the cookie — no per-request rendering).
 *
 * The words are in `src/lib/i18n/dictionaries/pricing-page.ts`. `lang`
 * defaults to English because the `[lang]` route tree that will pass a real
 * one has not shipped yet (plans/i18n.md); when it does, both trees render
 * this one component with a different `lang`, so there is never a forked
 * English and Spanish page to drift apart.
 */

import Link from 'next/link';
import { services, projectPhaseNames } from '@/lib/services';
import { LANG_TAG, type Lang } from '@/lib/i18n/markets';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { EngagementPlans } from '@/components/marketing/pages/engagement-plans';
import { LocalPrice, PriceText, CurrencyNote } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { DISPLAY_L, DISPLAY_S, HERO_Y, SECTION_Y_TIGHT, TITLE_S } from '@/components/marketing/giga/tokens';

/** Starting prices for the full service list (mirrors lib/services.ts /
 *  lib/pricing.ts — the checkout source of truth; keep in sync). */
const SERVICE_STARTING_USD: Record<string, number> = {
  websites: 1500,
  software_solutions: 3500,
  ai_solutions: 3000,
  consultation: 500,
  digital_marketing: 1200,
};

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
    <div lang={LANG_TAG[lang]} className="dark bg-[var(--fx-charcoal)] text-[var(--fx-white)]">
      {/* Hero — the same charcoal treatment every other sub-page uses. It used
          to be a full-bleed stock photograph under two scrims, left from the
          photography-led design, and it made /pricing look like a different
          site to the page it links from. */}
      <section className="relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
        />
        <Band className={HERO_Y} innerClassName="relative max-w-3xl">
          <BlurRise trigger="load">
            <Eyebrow>{t.hero.eyebrow}</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              {t.hero.title}
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              {t.hero.body}
            </p>
          </BlurRise>
        </Band>
      </section>

      {/* Engagement cards */}
      <EngagementPlans lang={lang} />
      <Band className="pb-2">
        {/* A billing-currency disclosure is content, not chrome: --fx-muted's
            6.5:1, not the 3.1:1 it was set in. */}
        <CurrencyNote lang={lang} className="text-[12px] text-[var(--fx-muted)]" />
      </Band>

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is after the engagement cards and the currency note that
          belongs to them. Above it the page answers "what does this cost";
          below it, everything is qualification — the two specialist
          engagements, how a quote is arrived at, the four questions people ask
          before they commit, and the ask. A visitor who is still reading past
          the prices has already accepted the number, and the colour marks that
          they crossed. Splitting between the cards and their currency note
          would separate a price from its own disclosure.

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
              <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--fx-muted)]">
                {t.specialists.body}
              </p>
            </div>
            {/* Both cards paint `--fx-charcoal-raised`, which inverts to
                black; the surface mark flips their ink back. */}
            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              <div
                data-fx-surface="dark"
                className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6"
              >
                <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  {t.specialists.consultation.title}
                </Serif>
                <p className="mt-1 text-[12.5px] text-[var(--fx-muted)]">
                  {t.specialists.consultation.scopeLine}
                </p>
                <p className="mt-4">
                  <Serif as="span" className="text-2xl font-light tabular-nums text-[var(--fx-white)]">
                    <LocalPrice usd={SERVICE_STARTING_USD.consultation} lang={lang} />
                  </Serif>
                  <span className="text-[13px] text-[var(--fx-muted)]">{t.specialists.consultation.unit}</span>
                </p>
                <p className="mt-1 text-[12px] text-[var(--fx-muted)]">
                  {t.specialists.consultation.note}
                </p>
              </div>
              <div
                data-fx-surface="dark"
                className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6"
              >
                <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  {t.specialists.retainer.title}
                </Serif>
                <p className="mt-1 text-[12.5px] text-[var(--fx-muted)]">
                  {t.specialists.retainer.scopeLine}
                </p>
                <p className="mt-4">
                  <Serif as="span" className="text-2xl font-light tabular-nums text-[var(--fx-white)]">
                    {t.specialists.retainer.figure}
                  </Serif>
                  <span className="text-[13px] text-[var(--fx-muted)]">{t.specialists.retainer.unit}</span>
                </p>
                {/* A custom retainer cannot promise fixed inclusions; scope is
                    what it agrees. It used to advertise priority support and a
                    dedicated point of contact, neither of which we define. */}
                <p className="mt-1 text-[12px] text-[var(--fx-muted)]">
                  {t.specialists.retainer.note}
                </p>
              </div>
            </div>
            <p className="mt-6 text-[13px] text-[var(--fx-muted)]">
              {t.specialists.biggerLead}{' '}
              <Link href="/contact" className="font-medium text-[var(--fx-yellow)] hover:underline">
                {t.specialists.biggerLink}
              </Link>
              .
            </p>
          </BlurRise>
        </Band>

        {/* Every service, one fixed quote + the engagement by the numbers */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-3xl">
            <div>
              <Eyebrow>{t.howPricing.eyebrow}</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.howPricing.title}
              </Serif>
              <p className="mt-5 text-[14px] leading-relaxed text-[var(--fx-muted)]">
                {t.howPricing.body}
              </p>
            </div>
            {/* The price list is a raised panel, so it is a black plate on the
                yellow and its rows need the light ink back. */}
            <ul
              data-fx-surface="dark"
              className="mt-8 divide-y divide-[var(--fx-hairline)] overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]"
            >
              {services.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[13.5px] text-[var(--fx-white)]">{s.name}</span>
                  <span className="text-[13px] tabular-nums text-[var(--fx-muted)]">
                    {t.howPricing.fromPrefix}
                    <LocalPrice usd={SERVICE_STARTING_USD[s.id] ?? 0} lang={lang} />
                  </span>
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
                  <p className="text-[13.5px] font-medium text-[var(--fx-white)]">{fact.label}</p>
                  <Serif
                    as="p"
                    className="mt-2 text-2xl font-light tabular-nums text-[var(--fx-white)]"
                  >
                    {fact.figure}
                  </Serif>
                  <p className="mt-1 text-[12px] text-[var(--fx-muted)]">{fact.line}</p>
                </div>
              ))}
            </div>
          </BlurRise>
        </Band>

        {/* FAQ */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-3xl">
            <Eyebrow>{t.faq.eyebrow}</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              {t.faq.title}
            </Serif>
          </BlurRise>
          {/* Price tokens are named for the offering they resolve to. They were
              `validate` and `scale` — the source template's plan tiers, which we
              do not sell and which leaked into the copy as "a Scale web
              application".

              `{days}` is filled here, before <PriceText/> fills the price
              tokens: fill() leaves a token it has no value for alone, so the
              two passes compose and an unfilled one stays visible in review. */}
          <ul className="mt-12 max-w-3xl divide-y divide-[var(--fx-hairline)]">
            {faqs.map((item, i) => (
              <BlurRise key={item.q} delay={i * 0.04}>
                <li className="py-7">
                  <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                    <PriceText
                      template={fill(item.q, { days: SUPPORT_DAYS })}
                      tokens={{ websites: SERVICE_STARTING_USD.websites }}
                      lang={lang}
                    />
                  </Serif>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--fx-muted)]">
                    {/* Prices in prose localize with the visitor's currency */}
                    <PriceText
                      template={fill(item.a, { days: SUPPORT_DAYS })}
                      tokens={{
                        websites: SERVICE_STARTING_USD.websites,
                        software: SERVICE_STARTING_USD.software_solutions,
                      }}
                      lang={lang}
                    />
                  </p>
                </li>
              </BlurRise>
            ))}
          </ul>
        </Band>

        {/* Closing CTA */}
        <Band className={SECTION_Y_TIGHT}>
          <BlurRise className="max-w-2xl">
            <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
              {t.cta.title}
            </Serif>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--fx-muted)]">
              {t.cta.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillPrimary href="/sign-up" withArrow>
                {t.cta.primary}
              </PillPrimary>
              <PillGhost href="/contact">{t.cta.secondary}</PillGhost>
            </div>
          </BlurRise>
        </Band>
      </ToneShift>
    </div>
  );
}
