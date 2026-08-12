'use client';

/**
 * EngagementPlans — the engagement cards for /pricing, on the giga plan-card
 * layout (visual structure ported unchanged from the marketing kit's
 * PricingPlans; the wording maps to Fortitudo's project engagements).
 *
 * Client component: prices render in the visitor's display currency
 * (useDisplayCurrency), clean-rounded from the USD base price — USD by
 * default. Starting prices mirror lib/services.ts / lib/pricing.ts (the
 * checkout source of truth). The words are in
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
 * one thing the palette rule forbids. Every card now takes the ghost treatment
 * and the page's single yellow action is the closing ask.
 *
 * For the same reason the cards no longer quote a delivery time or a revision
 * count. They advertised "14 days / 21 days / 30 days typical delivery" and
 * "+2 / +3 rounds of revisions included", figures that appear nowhere in
 * services.ts, pricing.ts or crm.ts — we have not measured a delivery time and
 * we do not sell revision allowances. The band under the price now carries the
 * commitments we can source: the post-launch support every engagement
 * includes, and revisions inside the scope the client approves before kickoff
 * (`Scope & fixed quote approved`, lib/crm.ts).
 */

import { Check } from 'lucide-react';
import { type Lang } from '@/lib/i18n/markets';
import { localizePrice, formatMoney } from '@/lib/i18n/currency';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { useDisplayCurrency } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from '@/components/marketing/giga/primitives';
import { SECTION_Y_TIGHT, TITLE_S } from '@/components/marketing/giga/tokens';

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

/** The numbers and the destinations. Starting prices mirror lib/services.ts
 *  (`startingPrice`) and lib/pricing.ts (amountCents) — keep in sync with
 *  those files, never edit here alone. The words are in the dictionary. */
const ENGAGEMENTS: Record<CardId, { priceUsd: number; href: string }> = {
  websites: { priceUsd: 1500, href: '/sign-up' },
  digital_marketing: { priceUsd: 1200, href: '/contact' },
  software_solutions: { priceUsd: 3500, href: '/sign-up' },
  ai_solutions: { priceUsd: 3000, href: '/contact' },
};

/** The two groups name what is in them. They were headed "For validating and
 *  launching" and "For scaling products and operations" — the source template's
 *  Validate and Scale tiers, kept as headings after the tiers themselves went. */
const CARD_ORDER: { sites: CardId[]; platforms: CardId[] } = {
  sites: ['websites', 'digital_marketing'],
  platforms: ['software_solutions', 'ai_solutions'],
};

function PlanCard({ id, lang }: { id: CardId; lang: Lang }) {
  const currency = useDisplayCurrency();
  const t = PRICING_PAGE[lang].plans;
  const p = ENGAGEMENTS[id];
  const c = t.cards[id];

  const localPrice = localizePrice(p.priceUsd, currency);

  return (
    <div className="flex h-full flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8">
      <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
        {c.label}
      </Serif>

      <p className="mt-4 flex items-baseline gap-2">
        <Serif
          as="span"
          className="text-[2.5rem] font-light leading-none tabular-nums text-[var(--fx-white)]"
        >
          {formatMoney(localPrice, currency, lang)}
        </Serif>
        <span className="text-sm text-[var(--fx-muted)]">{t.perProject}</span>
      </p>
      <p className="mt-1.5 text-[12px] text-[var(--fx-muted)]">
        {t.startingNote}
      </p>
      <p className="mt-2.5 text-[12.5px] text-[var(--fx-muted)]">{c.scopeLine}</p>
      <p className="mt-4 text-[13px] leading-relaxed text-[var(--fx-muted)]">{c.blurb}</p>

      <div className="mt-6 border-t border-[var(--fx-hairline)] pt-5">
        <p>
          <span className="text-xl font-semibold tabular-nums text-[var(--fx-white)]">
            {fill(c.figure, { days: SUPPORT_DAYS })}
          </span>{' '}
          <span className="text-[13px] text-[var(--fx-muted)]">{c.figureLabel}</span>
        </p>
        <p className="mt-1.5 text-[12px] text-[var(--fx-muted)]">{c.subLine}</p>
      </div>

      <ul className="mt-6 space-y-2.5">
        {c.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-[13px] text-[var(--fx-muted)]">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--fx-yellow)]" />
            {h}
          </li>
        ))}
      </ul>

      <PillGhost href={p.href} className="mt-7 w-full">
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
      <Band className="pb-8 pt-10">
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
