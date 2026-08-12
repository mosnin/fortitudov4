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
 */

import Link from 'next/link';
import { services } from '@/lib/services';
import { LANG_TAG, type Lang } from '@/lib/i18n/markets';
import { EngagementPlans } from '@/components/marketing/pages/engagement-plans';
import { LocalPrice, PriceText, CurrencyNote } from '@/components/marketing/local-price';
import { Band, BlurRise, Eyebrow, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
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
 * What every engagement commits to. This band used to read "The engagement, by
 * the numbers" and present a 14–30 day delivery window and 1–3 revision rounds
 * as measured facts; neither had a source anywhere in the codebase, and a
 * measurement we have not taken is a fabrication. Each entry now traces to one:
 * the phase count to `projectPhaseNames` in lib/services.ts (the same phases
 * the dashboard tracker and the FAQ name), the support window to the
 * always-included list on /services, and revisions to the approved scope the
 * CRM checklist gates kickoff on (`Scope & fixed quote approved`, lib/crm.ts).
 */
const ENGAGEMENT_COMMITMENTS = [
  { id: 'phases', label: 'Tracked live', figure: '6', line: 'phases, discovery to launch' },
  { id: 'revisions', label: 'Revisions', figure: 'In scope', line: 'rounds set in the quote you approve' },
  { id: 'support', label: 'Post-launch support', figure: '30', line: 'days included with every engagement' },
] as const;

export function PricingContent({ lang }: { lang: Lang }) {
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
            <Eyebrow>Pricing</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Fixed quotes. No surprises.
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              Every engagement is a scoped project with a fixed quote approved before work
              begins. You watch the build move phase by phase, and you own everything at
              launch — the price you approve is the price you pay.
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

      {/* Specialist engagements (consultation + retainer) */}
      <Band className={SECTION_Y_TIGHT}>
        <BlurRise className="max-w-3xl">
          <div>
            <Eyebrow>Specialist engagements</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              Two more ways we can build with you.
            </Serif>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-[var(--fx-muted)]">
              Beyond the core builds, we offer senior consultation engagements, and we
              stay on after launch when you want us to — same fixed-quote transparency,
              same live tracking.
            </p>
          </div>
          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6">
              <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                Consultation
              </Serif>
              <p className="mt-1 text-[12.5px] text-[var(--fx-muted)]">
                Roadmap, architecture & AI strategy sessions
              </p>
              <p className="mt-4">
                <Serif as="span" className="text-2xl font-light tabular-nums text-[var(--fx-white)]">
                  <LocalPrice usd={SERVICE_STARTING_USD.consultation} lang={lang} />
                </Serif>
                <span className="text-[13px] text-[var(--fx-muted)]"> / engagement, starting</span>
              </p>
              <p className="mt-1 text-[12px] text-[var(--fx-muted)]">
                + a written action plan you keep
              </p>
            </div>
            <div className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6">
              <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                Ongoing retainer
              </Serif>
              <p className="mt-1 text-[12.5px] text-[var(--fx-muted)]">
                Support & iteration after launch
              </p>
              <p className="mt-4">
                <Serif as="span" className="text-2xl font-light tabular-nums text-[var(--fx-white)]">
                  Custom
                </Serif>
                <span className="text-[13px] text-[var(--fx-muted)]"> / month, scoped to your build</span>
              </p>
              {/* A custom retainer cannot promise fixed inclusions; scope is
                  what it agrees. It used to advertise priority support and a
                  dedicated point of contact, neither of which we define. */}
              <p className="mt-1 text-[12px] text-[var(--fx-muted)]">
                + scope and response times agreed up front
              </p>
            </div>
          </div>
          <p className="mt-6 text-[13px] text-[var(--fx-muted)]">
            Running something bigger?{' '}
            <Link href="/contact" className="font-medium text-[var(--fx-yellow)] hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </BlurRise>
      </Band>

      {/* Every service, one fixed quote + the engagement by the numbers */}
      <Band className={SECTION_Y_TIGHT}>
        <BlurRise className="max-w-3xl">
          <div>
            <Eyebrow>How pricing works</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              Every engagement starts with a fixed quote.
            </Serif>
            <p className="mt-5 text-[14px] leading-relaxed text-[var(--fx-muted)]">
              Pick a service, get a scoped quote up front, and watch the build move phase by
              phase in your dashboard. Starting prices below — your quote is fixed before
              kickoff and never moves without your sign-off.
            </p>
          </div>
          <ul className="mt-8 divide-y divide-[var(--fx-hairline)] overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13.5px] text-[var(--fx-white)]">{s.name}</span>
                <span className="text-[13px] tabular-nums text-[var(--fx-muted)]">
                  from <LocalPrice usd={SERVICE_STARTING_USD[s.id] ?? 0} lang={lang} />
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10">
            <Eyebrow>What every engagement includes</Eyebrow>
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {ENGAGEMENT_COMMITMENTS.map((fact) => (
              <div
                key={fact.id}
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
          <Eyebrow>Questions</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
            What people ask first.
          </Serif>
        </BlurRise>
        {/* Price tokens are named for the offering they resolve to. They were
            `validate` and `scale` — the source template's plan tiers, which we
            do not sell and which leaked into the copy as "a Scale web
            application". */}
        <ul className="mt-12 max-w-3xl divide-y divide-[var(--fx-hairline)]">
          {[
            {
              q: 'Is the price really fixed?',
              a: 'Yes. Every engagement starts with a scoped, written quote. Once you approve it, that is the price — scope changes are quoted separately and only happen with your sign-off. No hourly meters, no surprise invoices.',
            },
            {
              q: 'What does "from {websites}" mean?',
              a: 'The starting price for the simplest version of that engagement. Your exact quote depends on scope — pages, integrations, and features — and is fixed before kickoff.',
            },
            {
              q: 'What happens after launch?',
              a: 'You own everything: full source code, design files, and infrastructure are handed over — no lock-in. Every engagement includes 30 days of post-launch support, and if you want us to stay on, an ongoing retainer is scoped to your build.',
            },
            {
              q: 'How do payments work?',
              a: 'You approve the fixed quote, pay to kick off, and track the build live through every phase — a software solutions build, for example, starts at {software}. Invoices itemize exactly what you approved, and revisions within scope are included.',
            },
          ].map((item, i) => (
            <BlurRise key={item.q} delay={i * 0.04}>
              <li className="py-7">
                <Serif as="p" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  <PriceText
                    template={item.q}
                    tokens={{ websites: SERVICE_STARTING_USD.websites }}
                    lang={lang}
                  />
                </Serif>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--fx-muted)]">
                  {/* Prices in prose localize with the visitor's currency */}
                  <PriceText
                    template={item.a}
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
            Get a fixed quote for your build.
          </Serif>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--fx-muted)]">
            Tell us what you are building and get a scoped quote — then watch it move from
            kickoff to launch.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillPrimary href="/sign-up" withArrow>
              Start your project
            </PillPrimary>
            <PillGhost href="/contact">Talk to us</PillGhost>
          </div>
        </BlurRise>
      </Band>
    </div>
  );
}
