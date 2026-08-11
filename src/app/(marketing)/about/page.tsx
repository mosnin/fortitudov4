/**
 * `/about`, Fortitudo Agency's founding story, on the dark cinematic redesign
 * system (the "About" target in the Company nav menu; layout ported unchanged
 * from the giga marketing kit's company page).
 *
 * One idea: the world moved on; agency work didn't, so we built Fortitudo —
 * senior builders on fixed quotes, working in the open — to close the gap.
 * Hero -> the gap -> beliefs -> the adaptive closing CTA. Cinematic sections
 * live in a forced-dark wrapper; the CTA stays light/dark-adaptive like the
 * rest of the redesign.
 */

import { CtaSection } from '@/components/marketing/giga/cta';
import {
  Band,
  BlurRise,
  Eyebrow,
  EyebrowPill,
  Serif,
  PillPrimary,
  PillGhost,
} from '@/components/marketing/giga/primitives';

export const metadata = {
  title: 'Our story · Fortitudo Agency',
  description:
    'Hiring an agency deserves to work the way the rest of the world already does. We built Fortitudo to close the gap between what is now possible and what clients actually get.',
};

/* Beliefs, the things we will not move on. */
const BELIEFS = [
  {
    title: 'A fixed quote is a promise.',
    body: 'Hourly meters and drifting estimates are admissions the team could not scope. Scoping is the work. The quote you approve is the price you pay, and scope changes only happen with your sign-off.',
  },
  {
    title: 'Nothing ships without a senior’s name on it.',
    body: 'We use AI tooling where it earns its place — scaffolding, boilerplate, the mechanical hours. It never decides anything. A senior builder reviews and shapes every change before it lands. That is where the speed comes from, and where the trust lives.',
  },
  {
    title: 'You watch the build live.',
    body: 'Wherever your project stands, a phase, a revision, a preview, the same dashboard shows it in real time. No status-call theater, no black boxes. It is how you learn to trust the team across every build.',
  },
  {
    title: 'You own everything at launch.',
    body: 'No lock-in headline games. Full source code, design files, and infrastructure are handed over the day you launch. The day we can make ownership even cleaner, we will, and we will say exactly how.',
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="dark bg-[#1b1b1d] text-white">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/company-hero.jpg" alt="" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b1b1d]/82 via-[#1b1b1d]/48 to-[#1b1b1d]" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_38%,transparent_35%,rgba(27,27,29,0.6)_100%)]" />
          </div>
          <Band className="pt-40 pb-24 text-center sm:pt-48 sm:pb-28">
            <BlurRise trigger="load">
              <EyebrowPill>Our story</EyebrowPill>
            </BlurRise>
            <BlurRise trigger="load" delay={0.08}>
              <Serif as="h1" className="mx-auto mt-7 max-w-4xl text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] text-white">
                Hiring builders deserves to work the way the world already does.
              </Serif>
            </BlurRise>
            <BlurRise trigger="load" delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-white/55">
                We built Fortitudo because the way agencies work was drawn for a slower
                era. The work should not be the mystery. The work should be the product.
              </p>
            </BlurRise>
            <BlurRise trigger="load" delay={0.24}>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <PillPrimary href="/contact" withArrow>
                  Talk to us
                </PillPrimary>
                <PillGhost href="/services">See what we build</PillGhost>
              </div>
            </BlurRise>
          </Band>
        </section>

        {/* The gap */}
        <Band className="py-24 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <BlurRise>
              <Eyebrow>The gap</Eyebrow>
              <Serif className="mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white">
                The work moved on.
                <br className="hidden sm:block" /> The agencies did not.
              </Serif>
            </BlurRise>
            <BlurRise delay={0.1}>
              <div className="space-y-6 text-[15px] leading-relaxed text-white/60 lg:pt-2">
                <p>
                  A build&apos;s calendar is mostly waiting: opaque quotes, missed
                  deadlines, status calls, weeks of silence between updates. The actual
                  craft, the judgment and taste and knowing, happens in maybe ten percent
                  of it.
                </p>
                <p>
                  Everywhere else, that other ninety percent has started to run itself. In
                  agency work it still does not. The process is stuck a generation behind
                  what is now possible. That distance, between what could happen and what
                  clients actually get, is the whole reason Fortitudo exists: senior
                  builders, modern tooling, and a build you can watch happen.
                </p>
              </div>
            </BlurRise>
          </div>
        </Band>

        {/* Beliefs */}
        <Band className="py-24 sm:py-28">
          <BlurRise className="mx-auto max-w-2xl text-center">
            <Eyebrow className="justify-center">What we believe</Eyebrow>
            <Serif className="mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] text-white">
              A few things we will not move on.
            </Serif>
          </BlurRise>
          <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <BlurRise key={b.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
                  <h3 style={{ fontFamily: 'var(--font-sans)' }} className="text-[16px] font-semibold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/55">{b.body}</p>
                </div>
              </BlurRise>
            ))}
          </div>
        </Band>
      </div>
      <CtaSection />
    </>
  );
}
