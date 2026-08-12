/**
 * `/about`, Fortitudo Agency's founding story, on the dark cinematic redesign
 * system (the "About" target in the Company nav menu; layout ported unchanged
 * from the giga marketing kit's company page).
 *
 * One idea: the world moved on; agency work didn't, so we built Fortitudo —
 * senior builders on fixed quotes, working in the open — to close the gap.
 * Hero -> the gap -> beliefs -> the closing CTA.
 */

import { CtaSection } from '@/components/marketing/giga/cta';
import { Band, BlurRise, Eyebrow, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import { DISPLAY_L, DISPLAY_S, HERO_Y, SECTION_Y, TITLE_S } from '@/components/marketing/giga/tokens';

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
      <div className="dark bg-[var(--fx-charcoal)] text-[var(--fx-white)]">
        {/* Hero — the same charcoal treatment every other sub-page uses.
            It used to be a full-bleed stock skyline under two scrims, left
            from the photography-led design; next to /services and /contact it
            read as a different website. */}
        <section className="relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
          />
          <Band className={HERO_Y} innerClassName="relative max-w-3xl">
            <BlurRise trigger="load">
              <Eyebrow>Our story</Eyebrow>
              <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
                Hiring builders deserves to work the way the world already does.
              </Serif>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
                We built Fortitudo because the way agencies work was drawn for a slower
                era. The work should not be the mystery. The work should be the product.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <PillPrimary href="/contact" withArrow>
                  Talk to us
                </PillPrimary>
                <PillGhost href="/services">See what we build</PillGhost>
              </div>
            </BlurRise>
          </Band>
        </section>

        {/* The gap */}
        <Band className={SECTION_Y}>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <BlurRise>
              <Eyebrow>The gap</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                The work moved on.
                <br className="hidden sm:block" /> The agencies did not.
              </Serif>
            </BlurRise>
            <BlurRise delay={0.1}>
              <div className="space-y-6 text-[15px] leading-relaxed text-[var(--fx-muted)] lg:pt-2">
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
        <Band className={SECTION_Y}>
          <BlurRise className="max-w-2xl">
            <Eyebrow>What we believe</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              A few things we will not move on.
            </Serif>
          </BlurRise>
          <div className="mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <BlurRise key={b.title} delay={i * 0.06}>
                {/* 6px, not the ported rounded-3xl: the logged-out site is
                    squared, and one lozenge in a grid of panels reads as an
                    import. */}
                <div className="h-full rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8">
                  <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
                    {b.title}
                  </Serif>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--fx-muted)]">{b.body}</p>
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
