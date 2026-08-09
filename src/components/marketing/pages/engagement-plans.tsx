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
 */

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { type Lang } from '@/lib/i18n/markets';
import { localizePrice, formatMoney } from '@/lib/i18n/currency';
import { useDisplayCurrency } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow } from '@/components/marketing/giga/primitives';

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
    featured?: boolean;
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
    featured: true,
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
    featured: true,
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
    <div
      className={
        'flex h-full flex-col rounded-3xl border p-8 ' +
        (p.featured
          ? 'border-[#ff7a45]/30 bg-gradient-to-b from-[#ff7a45]/[0.08] to-white/[0.02]'
          : 'border-white/[0.08] bg-white/[0.02]')
      }
    >
      <div className="flex items-center justify-between">
        <h3 style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
          {p.label}
        </h3>
        {p.featured ? (
          <span className="rounded-full bg-[#ff7a45]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#ff9a6e]">
            Most popular
          </span>
        ) : null}
      </div>

      <p className="mt-4 flex items-baseline gap-2">
        <span
          className="text-[2.5rem] font-light leading-none tracking-tight tabular-nums text-white"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {formatMoney(localPrice, currency, lang)}
        </span>
        <span className="text-sm text-white/45">/ project</span>
      </p>
      <p className="mt-1.5 text-[12px] text-white/40">
        starting price — fixed quote before kickoff
      </p>
      <p className="mt-2.5 text-[12.5px] text-white/45">{p.scopeLine}</p>
      <p className="mt-4 text-[13px] leading-relaxed text-white/55">{p.blurb}</p>

      <div className="mt-6 border-t border-white/[0.08] pt-5">
        <p>
          <span className="text-xl font-semibold tabular-nums text-white">{p.delivery}</span>{' '}
          <span className="text-[13px] text-white/45">{p.deliveryLabel}</span>
        </p>
        <p className="mt-1.5 text-[12px] text-white/40">{p.revisionsLine}</p>
      </div>

      <ul className="mt-6 space-y-2.5">
        {p.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-[13px] text-white/70">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#ff9a6e]" />
            {h}
          </li>
        ))}
      </ul>

      <Link
        href={p.href}
        className={
          'mt-7 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition-all duration-200 active:scale-[0.98] ' +
          (p.featured
            ? 'bg-white text-black hover:bg-white/90'
            : 'border border-white/20 text-white hover:bg-white/[0.05]')
        }
      >
        {p.cta}
      </Link>
    </div>
  );
}

function Toggle({ cycle, setCycle }: { cycle: Cycle; setCycle: (c: Cycle) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.03] p-1">
      <button
        type="button"
        onClick={() => setCycle('monthly')}
        className={
          'rounded-full px-4 py-1.5 text-[13px] transition-colors ' +
          (cycle === 'monthly' ? 'bg-white font-medium text-black' : 'text-white/60 hover:text-white')
        }
      >
        One-time build
      </button>
      <button
        type="button"
        onClick={() => setCycle('annual')}
        className={
          'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] transition-colors ' +
          (cycle === 'annual' ? 'bg-white font-medium text-black' : 'text-white/60 hover:text-white')
        }
      >
        Ongoing retainer
        <span
          className={
            'rounded-full px-1.5 py-0.5 text-[10px] font-medium ' +
            (cycle === 'annual' ? 'bg-[#ff7a45]/20 text-[#c2410c]' : 'bg-[#ff7a45]/15 text-[#ff9a6e]')
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
          <BlurRise className="flex justify-center">
            <Toggle cycle={cycle} setCycle={setCycle} />
          </BlurRise>
        </Band>
      )}

      {/* Validating & launching */}
      <Band className="pb-8 pt-10">
        <BlurRise className="text-center">
          <Eyebrow className="justify-center">For validating and launching</Eyebrow>
        </BlurRise>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {CARD_ORDER.individual.map((id, i) => (
            <BlurRise key={id} delay={i * 0.06}>
              <PlanCard id={id} lang={lang} />
            </BlurRise>
          ))}
        </div>
      </Band>

      {/* Products & operations */}
      <Band className="py-16 sm:py-20">
        <BlurRise className="text-center">
          <Eyebrow className="justify-center">For scaling products and operations</Eyebrow>
        </BlurRise>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
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
