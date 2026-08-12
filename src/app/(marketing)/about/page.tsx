/**
 * `/about`, Fortitudo Agency's founding story, on the dark cinematic redesign
 * system (the "About" target in the Company nav menu; layout ported unchanged
 * from the giga marketing kit's company page).
 *
 * One idea: the world moved on; agency work didn't, so we built Fortitudo —
 * senior builders on fixed quotes, working in the open — to close the gap.
 * Hero -> the gap -> beliefs -> the closing CTA.
 *
 * Every word of it lives in `src/lib/i18n/dictionaries/about.ts`, including the
 * `metadata` below. This file is structure only, and takes a `lang` so the
 * `[lang]` tree can render it without a second copy of the page.
 */

import { CtaSection } from '@/components/marketing/giga/cta';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { Band, BlurRise, Eyebrow, Serif } from '@/components/marketing/giga/primitives';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { DISPLAY_S, SECTION_Y, TITLE_S } from '@/components/marketing/giga/tokens';
import { ABOUT } from '@/lib/i18n/dictionaries/about';
import type { Lang } from '@/lib/i18n/markets';

/**
 * English by necessity, not by choice: `metadata` is a module-level export and
 * cannot see the component's `lang` prop. It reads the same dictionary as the
 * page so the title cannot drift from the copy under it; the `[lang]` tree will
 * export a `generateMetadata` off `ABOUT[lang].meta` when it lands.
 *
 * This page is a Server Component, so its metadata stays here — unlike
 * /contact, /faq and /portfolio, which are Client Components and carry a
 * sibling `layout.tsx` for exactly this export.
 */
export const metadata = {
  title: ABOUT.en.meta.title,
  description: ABOUT.en.meta.description,
};

export default function AboutPage({ lang = 'en' }: { lang?: Lang }) {
  const t = ABOUT[lang];

  return (
    <>
      <div className="dark bg-[var(--fx-charcoal)] text-[var(--fx-white)]">
        {/* Hero — the same dot-matrix field every other sub-page now opens on.
            It used to be a full-bleed stock skyline under two scrims, left
            from the photography-led design; next to /services and /contact it
            read as a different website.

            The only sub-page hero that keeps a pair of buttons: nothing below
            it competes for the primary action until the closing ask. */}
        <PageHero
          eyebrow={t.hero.eyebrow}
          title={t.hero.title}
          lead={t.hero.body}
          cta={{ label: t.hero.ctaPrimary, href: '/contact' }}
          secondaryCta={{ label: t.hero.ctaSecondary, href: '/services' }}
          seed={3}
        />

        {/* The gap */}
        <Band className={SECTION_Y}>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <BlurRise>
              <Eyebrow>{t.problem.eyebrow}</Eyebrow>
              <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.problem.titleLead}
                {/* The space belongs to this text node, not to a separate
                    `{' '}` child: two adjacent text children would render an
                    extra separator comment where the original markup had one
                    node, and this refactor has to leave the DOM untouched. */}
                <br className="hidden sm:block" />
                {` ${t.problem.titleRest}`}
              </Serif>
            </BlurRise>
            <BlurRise delay={0.1}>
              <div className="space-y-6 text-[15px] leading-relaxed text-[var(--fx-muted)] lg:pt-2">
                <p>{t.problem.para1}</p>
                <p>{t.problem.para2}</p>
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
            <Eyebrow>{t.beliefs.eyebrow}</Eyebrow>
            <Serif className={`mt-5 ${DISPLAY_S} text-[var(--fx-white)]`}>
              {t.beliefs.title}
            </Serif>
          </BlurRise>
          <div className="mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
            {t.beliefs.items.map((b, i) => (
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
