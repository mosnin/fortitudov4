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
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { DISPLAY_L, DISPLAY_S, HERO_Y, SECTION_Y, TITLE_S } from '@/components/marketing/giga/tokens';

export const metadata = {
  title: 'Our story · Fortitudo Agency',
  description:
    'You should know what your build costs, and how it is going. Most agencies keep both to themselves. We built Fortitudo to do the opposite.',
};

/* Beliefs, the things we will not move on. */
const BELIEFS = [
  {
    title: 'A fixed price is a promise.',
    body: 'An hourly meter means we could not work out what the job was. Working that out is the job. The price you approve is the price you pay, and it only changes if you say so.',
  },
  {
    title: 'Nothing goes out without a senior’s name on it.',
    body: 'We use AI for the repetitive parts — setup, boilerplate, the mechanical hours. It decides nothing. A senior builder checks and shapes every change before it lands. That is where the speed comes from, and where the trust lives.',
  },
  {
    title: 'You watch the build as it happens.',
    body: 'The stage you are in, the change we just made, the preview you can click — it is all on one page, all the time. No status-call theater, and nothing you have to ask for.',
  },
  {
    title: 'You own everything at launch.',
    body: 'The code, the design files, the logins. All handed over the day you go live. Nothing is locked to us, and there are no license games.',
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
                You should know what it costs, and how it is going.
              </Serif>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
                Most agencies keep both of those to themselves. We built Fortitudo to do
                the opposite: one price, agreed up front, and a build you can watch.
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
              <Eyebrow>The problem</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                The work moved on.
                <br className="hidden sm:block" /> The agencies did not.
              </Serif>
            </BlurRise>
            <BlurRise delay={0.1}>
              <div className="space-y-6 text-[15px] leading-relaxed text-[var(--fx-muted)] lg:pt-2">
                <p>
                  Most of a build is waiting. Vague prices. Missed dates. Calls that say
                  nothing. Weeks of silence between updates. The actual thinking and
                  making is a small slice of it.
                </p>
                <p>
                  Everywhere else, that waiting has been squeezed out. In agency work it
                  has not. That gap, between what could happen and what clients actually
                  get, is why Fortitudo exists: senior people, better tools, and a build
                  you can watch happen.
                </p>
              </div>
            </BlurRise>
          </div>
        </Band>
      </div>

      {/* The tone shift. Everything below runs in the inverted scope — racing
          yellow ground, black ink — see `[data-fx-tone="light"]` in
          globals.css.

          The split is between the diagnosis and the commitments. The hero and
          "the gap" argue that agency work is behind; the beliefs are the four
          things we sign up to because of it. That is the page's turn from
          explaining itself to putting something on the record, and a promise
          is the part a visitor comes back to check. Yellow is where the
          promises live.

          `text-[var(--fx-white)]` is restated here because the charcoal
          wrapper above computed it to white; inside the flip the same token
          resolves to black, so inherited ink follows the ground. */}
      <ToneShift className="text-[var(--fx-white)]">
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
                    import. `--fx-charcoal-raised` inverts to black, so the
                    card carries the surface mark and its ink flips back. */}
                <div
                  data-fx-surface="dark"
                  className="h-full rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8"
                >
                  <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
                    {b.title}
                  </Serif>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--fx-muted)]">{b.body}</p>
                </div>
              </BlurRise>
            ))}
          </div>
        </Band>

        <CtaSection />
      </ToneShift>
    </>
  );
}
