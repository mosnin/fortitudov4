/**
 * EngagementPlans — the engagement cards for /pricing, on the giga plan-card
 * layout (visual structure ported unchanged from the marketing kit's
 * PricingPlans; the wording maps to Fortitudo's project engagements).
 *
 * NO PRICES, and no client-side currency any more. Each card used to lead with
 * a starting amount rendered in the visitor's display currency. The public site
 * does not advertise a price: the amount line is now the promise that replaced
 * it — one fixed price, agreed before we start — and every card's button goes
 * to the contact form. The real amounts still live in `src/lib/pricing.ts`,
 * which is what the product invoices from.
 *
 * With the currency gone this is a plain server-rendered component; it carried
 * `'use client'` only for `useDisplayCurrency`. The words are in
 * `src/lib/i18n/dictionaries/pricing-page.ts`.
 *
 * A billing-cycle toggle used to sit above the cards — "One-time build" vs
 * "We keep going after launch", behind a `toggleEnabled` prop. Engagements are
 * fixed-quote projects, not subscriptions, so both states showed the same
 * price and the toggle was pure wording; no caller ever passed the prop, so it
 * had never rendered. It went out with this extraction rather than being
 * carried into three languages: translating a control nobody can reach is
 * translation budget spent on nothing.
 *
 * No card is featured. Two of them carried `featured: true`, so "Most popular"
 * rendered on two cards at once — a claim that contradicts itself, and one we
 * have no data behind. It also put two yellow CTAs on one screen, which is the
 * one thing the palette rule forbids. Every card takes the ghost treatment and
 * the page's single yellow action is the closing ask.
 *
 * For the same reason the cards quote no delivery time or revision count. They
 * advertised "14 days / 21 days / 30 days typical delivery" and "+2 / +3 rounds
 * of revisions included", figures that appear nowhere in services.ts,
 * pricing.ts or crm.ts — we have not measured a delivery time and we do not
 * sell revision allowances. The band under the promise carries the commitments
 * we can source: the post-launch support every engagement includes, and
 * revisions inside the scope the client approves before kickoff (`Scope &
 * fixed quote approved`, lib/crm.ts).
 */

import { Check } from 'lucide-react';
import { type Lang } from '@/lib/i18n/markets';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from '@/components/marketing/giga/primitives';
import { BODY, BODY_S, SECTION_Y_TIGHT, TITLE_L, TITLE_S } from '@/components/marketing/giga/tokens';

type CardId = 'websites' | 'digital_marketing' | 'software_solutions' | 'ai_solutions';

/**
 * Days of help after launch, included with every engagement.
 *
 * DUPLICATED. The same figure is stated on /pricing (in pricing-content.tsx),
 * in the always-included list on /services, and in the /faq answers, and
 * nothing owns it — it is not in `src/lib/services.ts` beside the offerings it
 * applies to, which is where it belongs. Centralise it there; until then,
 * changing it means changing it in all four places. It is a number, so it
 * never sits inside a dictionary string: the copy carries `{days}` and this
 * fills it.
 */
const SUPPORT_DAYS = 30;

/** Every card asks the same thing, so every card points at the same form. This
 *  used to be a per-card `{ priceUsd, href }` map that mirrored lib/pricing.ts
 *  — the amounts went with the advertised prices. */
const CONTACT_HREF = '/contact';

/** The two groups name what is in them. They were headed "For validating and
 *  launching" and "For scaling products and operations" — the source template's
 *  Validate and Scale tiers, kept as headings after the tiers themselves went. */
const CARD_ORDER: { sites: CardId[]; platforms: CardId[] } = {
  sites: ['websites', 'digital_marketing'],
  platforms: ['software_solutions', 'ai_solutions'],
};

function PlanCard({ id, lang }: { id: CardId; lang: Lang }) {
  const t = PRICING_PAGE[lang].plans;
  const c = t.cards[id];

  return (
    <div className="flex h-full flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8">
      <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
        {c.label}
      </Serif>

      {/* Where the amount was. The card still needs one line the eye lands on,
          and this is the thing the price was proof of. */}
      <Serif as="p" className={`mt-4 ${TITLE_L} text-[var(--fx-white)]`}>
        {t.quoteLine}
      </Serif>
      <p className={`mt-2.5 ${BODY_S} text-[var(--fx-muted)]`}>{c.scopeLine}</p>
      <p className={`mt-4 ${BODY} text-[var(--fx-muted)]`}>{c.blurb}</p>

      <div className="mt-6 border-t border-[var(--fx-hairline)] pt-5">
        <p>
          <span className="text-xl font-semibold tabular-nums text-[var(--fx-white)]">
            {fill(c.figure, { days: SUPPORT_DAYS })}
          </span>{' '}
          <span className={`${BODY_S} text-[var(--fx-muted)]`}>{c.figureLabel}</span>
        </p>
        <p className={`mt-1.5 ${BODY_S} text-[var(--fx-muted)]`}>{c.subLine}</p>
      </div>

      <ul className="mt-6 space-y-2.5">
        {c.highlights.map((h) => (
          <li key={h} className={`flex items-start gap-2.5 ${BODY_S} text-[var(--fx-muted)]`}>
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--fx-yellow)]" />
            {h}
          </li>
        ))}
      </ul>

      {/* Pushed to the foot of the card so four cards of different lengths
          still line their buttons up. */}
      <PillGhost href={CONTACT_HREF} className="mt-7 w-full">
        {c.cta}
      </PillGhost>
    </div>
  );
}

export function EngagementPlans({ lang = 'en' }: { lang?: Lang }) {
  const t = PRICING_PAGE[lang].plans;
  return (
    <>
      {/* Sites & campaigns */}
      <Band className={SECTION_Y_TIGHT}>
        <BlurRise>
          <Eyebrow>{t.sitesHeading}</Eyebrow>
        </BlurRise>
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {CARD_ORDER.sites.map((id, i) => (
            <BlurRise key={id} delay={i * 0.06}>
              <PlanCard id={id} lang={lang} />
            </BlurRise>
          ))}
        </div>
      </Band>

      {/* Applications & automation */}
      <Band className={SECTION_Y_TIGHT}>
        <BlurRise>
          <Eyebrow>{t.appsHeading}</Eyebrow>
        </BlurRise>
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {CARD_ORDER.platforms.map((id, i) => (
            <BlurRise key={id} delay={i * 0.06}>
              <PlanCard id={id} lang={lang} />
            </BlurRise>
          ))}
        </div>
      </Band>
    </>
  );
}
