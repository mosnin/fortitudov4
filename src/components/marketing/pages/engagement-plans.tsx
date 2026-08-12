'use client';

/**
 * EngagementPlans — the engagement cards for /pricing, on the giga plan-card
 * layout (visual structure ported unchanged from the marketing kit's
 * PricingPlans; the wording maps to Fortitudo's project engagements).
 *
 * Client component (holds the toggle state). Starting prices mirror
 * lib/services.ts / lib/pricing.ts (the checkout source of truth); amounts
 * render in the visitor's display currency (useDisplayCurrency), clean-rounded
 * from the USD base price — USD by default.
 *
 * Engagements are fixed-quote projects, not subscriptions, so the price is the
 * same in both toggle states: the toggle is pure wording ("One-time build" vs
 * "Ongoing retainer" — the same starting prices apply either way; retainers are
 * scoped from the same build). It renders only when `toggleEnabled` is passed
 * by the server page.
 *
 * No card is featured. Two of them carried `featured: true`, so "Most popular"
 * rendered on two cards at once — a claim that contradicts itself, and one we
 * have no data behind. It also put two yellow CTAs on one screen, which is the
 * one thing the palette rule forbids. Every card now takes the ghost treatment
 * and the page's single yellow action is the closing ask.
 */

import { useState } from 'react';
import { Check } from 'lucide-react';
import { type Lang } from '@/lib/i18n/markets';
import { localizePrice, formatMoney } from '@/lib/i18n/currency';
import { useDisplayCurrency } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow, PillGhost, Serif } from '@/components/marketing/giga/primitives';
import { SECTION_Y_TIGHT, TITLE_S } from '@/components/marketing/giga/tokens';

type Cycle = 'monthly' | 'annual';
type CardId = 'websites' | 'digital_marketing' | 'software_solutions' | 'ai_solutions';

/** Starting prices mirror lib/services.ts (`startingPrice`) and lib/pricing.ts
 *  (amountCents) — keep in sync with those files, never edit here alone. */
const ENGAGEMENTS: Record<
  CardId,
  {
    label: string;
    priceUsd: number;
    scopeLine: string;
    blurb: string;
    delivery: string;
    deliveryLabel: string;
    revisionsLine: string;
    highlights: string[];
    cta: string;
    href: string;
  }
> = {
  websites: {
    label: 'Websites',
    priceUsd: 1500,
    scopeLine: 'For marketing sites & storefronts',
    blurb: 'A site that sells — designed, built, and launched fast, with checkout when you need it.',
    delivery: '14 days',
    deliveryLabel: 'typical delivery, kickoff to launch',
    revisionsLine: '+2 rounds of revisions included',
    highlights: [
      'Custom design & build',
      'Ecommerce & checkout',
      'SEO fundamentals',
      'Analytics wired in',
    ],
    cta: 'Start a website',
    href: '/sign-up',
  },
  digital_marketing: {
    label: 'Digital Marketing',
    priceUsd: 1200,
    scopeLine: 'Monthly — funnels & campaigns',
    blurb: 'Funnels, campaigns, and conversion work that turn traffic into revenue, measured end to end.',
    delivery: 'Ongoing',
    deliveryLabel: 'monthly retainer, cancel anytime',
    revisionsLine: '+continuous testing & iteration',
    highlights: [
      'Funnels & landing pages',
      'Email & SMS sequences',
      'A/B testing',
      'Campaign analytics',
    ],
    cta: 'Start marketing',
    href: '/contact',
  },
  software_solutions: {
    label: 'Software Solutions',
    priceUsd: 3500,
    scopeLine: 'For applications & internal tools',
    blurb: 'A custom application built to grow — portals, platforms, and the tools your team runs on.',
    delivery: '21 days',
    deliveryLabel: 'typical delivery, kickoff to launch',
    revisionsLine: '+3 rounds of revisions included',
    highlights: [
      'Product architecture',
      'Custom UI/UX',
      'Auth, database & APIs',
      'Deployment & support',
    ],
    cta: 'Scope my build',
    href: '/sign-up',
  },
  ai_solutions: {
    label: 'AI Solutions',
    priceUsd: 3000,
    scopeLine: 'For agents & automation',
    blurb: 'Put AI to work on your operations — agents, automated workflows, and content pipelines.',
    delivery: '30 days',
    deliveryLabel: 'typical delivery, kickoff to launch',
    revisionsLine: '+3 rounds of revisions included',
    highlights: [
      'Custom AI agents',
      'Workflow automation',
      'Data pipelines',
      'Deployed on your stack',
    ],
    cta: 'Scope my AI',
    href: '/contact',
  },
};

const CARD_ORDER: { individual: CardId[]; team: CardId[] } = {
  individual: ['websites', 'digital_marketing'],
  team: ['software_solutions', 'ai_solutions'],
};

function PlanCard({ id, lang }: { id: CardId; lang: Lang }) {
  const currency = useDisplayCurrency();
  const p = ENGAGEMENTS[id];

  const localPrice = localizePrice(p.priceUsd, currency);

  return (
    <div className="flex h-full flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8">
      <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
        {p.label}
      </Serif>

      <p className="mt-4 flex items-baseline gap-2">
        <Serif
          as="span"
          className="text-[2.5rem] font-light leading-none tabular-nums text-[var(--fx-white)]"
        >
          {formatMoney(localPrice, currency, lang)}
        </Serif>
        <span className="text-sm text-[var(--fx-muted)]">/ project</span>
      </p>
      <p className="mt-1.5 text-[12px] text-[var(--fx-muted)]">
        starting price — fixed quote before kickoff
      </p>
      <p className="mt-2.5 text-[12.5px] text-[var(--fx-muted)]">{p.scopeLine}</p>
      <p className="mt-4 text-[13px] leading-relaxed text-[var(--fx-muted)]">{p.blurb}</p>

      <div className="mt-6 border-t border-[var(--fx-hairline)] pt-5">
        <p>
          <span className="text-xl font-semibold tabular-nums text-[var(--fx-white)]">
            {p.delivery}
          </span>{' '}
          <span className="text-[13px] text-[var(--fx-muted)]">{p.deliveryLabel}</span>
        </p>
        <p className="mt-1.5 text-[12px] text-[var(--fx-muted)]">{p.revisionsLine}</p>
      </div>

      <ul className="mt-6 space-y-2.5">
        {p.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-[13px] text-[var(--fx-muted)]">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--fx-yellow)]" />
            {h}
          </li>
        ))}
      </ul>

      <PillGhost href={p.href} className="mt-7 w-full">
        {p.cta}
      </PillGhost>
    </div>
  );
}

function Toggle({ cycle, setCycle }: { cycle: Cycle; setCycle: (c: Cycle) => void }) {
  return (
    <div className="inline-flex items-center rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-1">
      <button
        type="button"
        onClick={() => setCycle('monthly')}
        className={
          'rounded-[4px] px-4 py-1.5 text-[13px] transition-colors ' +
          (cycle === 'monthly'
            ? 'bg-[var(--fx-yellow)] font-medium text-[var(--fx-on-yellow)]'
            : 'text-[var(--fx-muted)] hover:text-[var(--fx-white)]')
        }
      >
        One-time build
      </button>
      <button
        type="button"
        onClick={() => setCycle('annual')}
        className={
          'flex items-center gap-1.5 rounded-[4px] px-4 py-1.5 text-[13px] transition-colors ' +
          (cycle === 'annual'
            ? 'bg-[var(--fx-yellow)] font-medium text-[var(--fx-on-yellow)]'
            : 'text-[var(--fx-muted)] hover:text-[var(--fx-white)]')
        }
      >
        Ongoing retainer
        <span
          className={
            'rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium ' +
            (cycle === 'annual'
              ? 'bg-[var(--fx-yellow)]/20 text-[var(--fx-yellow)]'
              : 'bg-[var(--fx-yellow)]/15 text-[var(--fx-yellow)]')
          }
        >
          Same fixed quote
        </span>
      </button>
    </div>
  );
}

export function EngagementPlans({
  toggleEnabled = false,
  lang = 'en',
}: {
  toggleEnabled?: boolean;
  lang?: Lang;
}) {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  return (
    <>
      {toggleEnabled && (
        <Band className="pt-2">
          <BlurRise>
            <Toggle cycle={cycle} setCycle={setCycle} />
          </BlurRise>
        </Band>
      )}

      {/* Validating & launching */}
      <Band className="pb-8 pt-10">
        <BlurRise>
          <Eyebrow>For validating and launching</Eyebrow>
        </BlurRise>
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {CARD_ORDER.individual.map((id, i) => (
            <BlurRise key={id} delay={i * 0.06}>
              <PlanCard id={id} lang={lang} />
            </BlurRise>
          ))}
        </div>
      </Band>

      {/* Products & operations */}
      <Band className={SECTION_Y_TIGHT}>
        <BlurRise>
          <Eyebrow>For scaling products and operations</Eyebrow>
        </BlurRise>
        <div className="mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {CARD_ORDER.team.map((id, i) => (
            <BlurRise key={id} delay={i * 0.06}>
              <PlanCard id={id} lang={lang} />
            </BlurRise>
          ))}
        </div>
      </Band>
    </>
  );
}
