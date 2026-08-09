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
import {
  Band,
  BlurRise,
  Eyebrow,
  Serif,
  EyebrowPill,
  PillPrimary,
  PillGhost,
} from '@/components/marketing/giga/primitives';

/** Starting prices for the full service list (mirrors lib/services.ts /
 *  lib/pricing.ts — the checkout source of truth; keep in sync). */
const SERVICE_STARTING_USD: Record<string, number> = {
  web_application: 2500,
  ecommerce_store: 1800,
  funnels: 1200,
  ai_automation: 3000,
  open_claw_deployment: 2000,
};

/** The engagement, by the numbers — figures match the plan cards above. */
const ENGAGEMENT_FACTS = [
  { id: 'delivery', label: 'Typical delivery', figure: '14–30', line: 'days from kickoff to launch' },
  { id: 'revisions', label: 'Revisions', figure: '1–3', line: 'rounds included, by engagement' },
  { id: 'support', label: 'Post-launch support', figure: '30', line: 'days included on Scale builds' },
] as const;

export function PricingContent({ lang }: { lang: Lang }) {
  return (
    <div lang={LANG_TAG[lang]} className="dark bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/hero-bg.jpg" alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/82 via-[#0a0a0a]/48 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_38%,transparent_35%,rgba(10,10,10,0.6)_100%)]" />
        </div>
        <Band className="pt-40 pb-16 text-center sm:pt-48 sm:pb-20">
          <BlurRise trigger="load">
            <EyebrowPill>Pricing</EyebrowPill>
          </BlurRise>
          <BlurRise trigger="load" delay={0.08}>
            <Serif as="h1" className="mx-auto mt-7 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] text-white">
              Fixed quotes. No surprises.
            </Serif>
          </BlurRise>
          <BlurRise trigger="load" delay={0.16}>
            <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-white/55">
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
        <CurrencyNote lang={lang} className="text-center text-[12px] text-white/35" />
      </Band>

      {/* Specialist engagements (Open Claw + retainer) */}
      <Band className="py-16 sm:py-20">
        <BlurRise className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow className="justify-center">Specialist engagements</Eyebrow>
            <Serif className="mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white">
              Two more ways we can build with you.
            </Serif>
            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-white/55">
              Beyond the core builds, we deploy and operate Open Claw instances, and we
              stay on after launch when you want us to — same fixed-quote transparency,
              same live tracking.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
                Open Claw Deployment
              </p>
              <p className="mt-1 text-[12.5px] text-white/45">
                Instance setup, deployment pipeline & monitoring
              </p>
              <p className="mt-4">
                <span style={{ fontFamily: 'var(--font-sans)' }} className="text-2xl font-light tabular-nums text-white">
                  <LocalPrice usd={SERVICE_STARTING_USD.open_claw_deployment} lang={lang} />
                </span>
                <span className="text-[13px] text-white/45"> / deployment, starting</span>
              </p>
              <p className="mt-1 text-[12px] text-white/40">
                + scaling infrastructure & ongoing support
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
                Ongoing retainer
              </p>
              <p className="mt-1 text-[12.5px] text-white/45">
                Support & iteration after launch
              </p>
              <p className="mt-4">
                <span style={{ fontFamily: 'var(--font-sans)' }} className="text-2xl font-light tabular-nums text-white">
                  Custom
                </span>
                <span className="text-[13px] text-white/45"> / month, scoped to your build</span>
              </p>
              <p className="mt-1 text-[12px] text-white/40">
                + priority support & a dedicated point of contact
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-[13px] text-white/45">
            Running something bigger?{' '}
            <Link href="/contact" className="font-medium text-[#ff9a6e] hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </BlurRise>
      </Band>

      {/* Every service, one fixed quote + the engagement by the numbers */}
      <Band className="py-16 sm:py-20">
        <BlurRise className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow className="justify-center">How pricing works</Eyebrow>
            <Serif className="mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white">
              Every engagement starts with a fixed quote.
            </Serif>
            <p className="mt-5 text-[14px] leading-relaxed text-white/55">
              Pick a service, get a scoped quote up front, and watch the build move phase by
              phase in your dashboard. Starting prices below — your quote is fixed before
              kickoff and never moves without your sign-off.
            </p>
          </div>
          <ul className="mt-8 divide-y divide-white/[0.06] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-[13.5px] text-white/80">{s.name}</span>
                <span className="text-[13px] tabular-nums text-white/45">
                  from <LocalPrice usd={SERVICE_STARTING_USD[s.id] ?? 0} lang={lang} />
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-center">
            <Eyebrow className="justify-center">The engagement, by the numbers</Eyebrow>
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {ENGAGEMENT_FACTS.map((fact) => (
              <div key={fact.id} className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-[13.5px] font-medium text-white">{fact.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white">
                  {fact.figure}
                </p>
                <p className="mt-1 text-[12px] text-white/45">{fact.line}</p>
              </div>
            ))}
          </div>
        </BlurRise>
      </Band>

      {/* FAQ */}
      <Band className="py-16 sm:py-20">
        <BlurRise className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">Questions</Eyebrow>
          <Serif className="mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white">
            What people ask first.
          </Serif>
        </BlurRise>
        <ul className="mx-auto mt-12 max-w-3xl divide-y divide-white/[0.08]">
          {[
            {
              q: 'Is the price really fixed?',
              a: 'Yes. Every engagement starts with a scoped, written quote. Once you approve it, that is the price — scope changes are quoted separately and only happen with your sign-off. No hourly meters, no surprise invoices.',
            },
            {
              q: 'What does "from {validate}" mean?',
              a: 'The starting price for the simplest version of that engagement. Your exact quote depends on scope — pages, integrations, and features — and is fixed before kickoff. Most projects land at or near the starting price.',
            },
            {
              q: 'What happens after launch?',
              a: 'You own everything: full source code, design files, and infrastructure are handed over — no lock-in. Builds include post-launch support, and if you want us to stay on, an ongoing retainer is scoped to your build.',
            },
            {
              q: 'How do payments work?',
              a: 'You approve the fixed quote, pay to kick off, and track the build live through every phase — for example, a Scale web application starts at {scale}. Invoices itemize exactly what you approved, and revisions within scope are included.',
            },
          ].map((item, i) => (
            <BlurRise key={item.q} delay={i * 0.04}>
              <li className="py-7">
                <p style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
                  <PriceText
                    template={item.q}
                    tokens={{ validate: SERVICE_STARTING_USD.funnels }}
                    lang={lang}
                  />
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-white/55">
                  {/* Prices in prose localize with the visitor's currency */}
                  <PriceText
                    template={item.a}
                    tokens={{
                      validate: SERVICE_STARTING_USD.funnels,
                      scale: SERVICE_STARTING_USD.web_application,
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
      <Band className="pb-28 pt-4 sm:pb-36">
        <BlurRise className="mx-auto max-w-2xl text-center">
          <Serif className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.06] text-white">
            Get a fixed quote for your build.
          </Serif>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
            Tell us what you are building and get a scoped quote — then watch Helix and our
            senior builders take it from kickoff to launch.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
