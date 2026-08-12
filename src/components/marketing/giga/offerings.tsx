'use client';

/**
 * Offerings — the "what we build" section, carried forward from the previous
 * landing's journey-package cards and re-set in the Giga system: near-black
 * band, display-face card titles, mono footer lines, hairline cards, and the
 * capability chips carried over from the old design, re-tinted for the dark
 * shell. The mono line that used to carry a starting price now carries the
 * ask that replaced it: we quote every build before it starts, so the card
 * points at the form.
 *
 * Motion: ONE idea — the grid arrives on the diagonal (`StaggerGrid`), so six
 * cards read as a single move across the section rather than six separate
 * entrances. The capability chips used to rotate 6° on hover; that is gone.
 * Six cards, four chips each, every one of them independently tiltable, is a
 * fidget toy sitting underneath a fixed-quote pitch.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { services } from '@/lib/services';
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { KineticText, StaggerGrid } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { BODY_S, DISPLAY_M, LEAD, MONO_STYLE, SECTION_Y, TITLE_L } from './tokens';

export function Offerings({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].offerings;
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="max-w-3xl">
          <BlurRise>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </BlurRise>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            <KineticText lines={t.headingLines} />
          </Serif>
          <BlurRise delay={0.28}>
            <p className={`mt-5 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>
              {t.lead}
            </p>
          </BlurRise>
        </div>

        <StaggerGrid
          className="mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
          columns={3}
        >
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex h-full flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6 transition-colors duration-200 hover:border-[var(--fx-faint)]"
            >
              {/* No glyph above the heading. It was the "decorative chip above
                  a heading" half of the rule AGENTS.md states, and it was also
                  an incoherence: the same five offerings render on /services
                  with no icon, so the homepage was drawing a category mark the
                  detail page does not have. */}
              <Serif as="h3" className={`${TITLE_L} text-[var(--fx-white)]`}>
                {/* The card is one target, drawn with a stretched link rather
                    than an anchor around the whole cell: the "Contact us"
                    control below is itself a link, and an anchor inside an
                    anchor is invalid markup the browser silently unpicks. */}
                <Link
                  href={`/services#${service.id.replace(/_/g, '-')}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {service.name}
                </Link>
              </Serif>
              <p className={`mt-2.5 flex-1 ${BODY_S} text-[var(--fx-muted)]`}>
                {service.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {service.features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="rounded-[4px] bg-[var(--fx-charcoal-deep)] px-2 py-1 text-[10.5px] leading-none text-[var(--fx-muted)]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--fx-hairline)] pt-4">
                {/* Where the starting price used to sit. We quote every build
                    before it starts, so the card sends you to the form that
                    gets you one. `relative` lifts it over the stretched link. */}
                <Link
                  href="/contact"
                  style={MONO_STYLE}
                  className="relative text-[11px] uppercase tracking-[0.22em] text-[var(--fx-muted)] underline-offset-4 transition-colors hover:text-[var(--fx-white)] hover:underline"
                >
                  {t.cardPriceCta}
                </Link>
                <span className="flex items-center gap-1 text-[13px] font-medium text-[var(--fx-muted)] transition-colors group-hover:text-[var(--fx-white)]">
                  {t.cardCta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}

          {/* Sixth cell — the "something else" card, from the old grid's dark slot */}
          <Link
            key="something-else"
            href="/contact"
            className="group flex h-full flex-col justify-between rounded-[6px] border border-dashed border-[var(--fx-hairline)] bg-transparent p-6 transition-colors duration-200 hover:border-[var(--fx-faint)]"
          >
            <div>
              <Serif as="h3" className={`${TITLE_L} text-[var(--fx-white)]`}>
                {t.somethingElseTitle}
              </Serif>
              <p className={`mt-2.5 ${BODY_S} text-[var(--fx-muted)]`}>
                {t.somethingElseDesc}
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1 text-[13px] font-medium text-[var(--fx-muted)] transition-colors group-hover:text-[var(--fx-white)]">
              {t.somethingElseCta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </StaggerGrid>
      </Band>
    </section>
  );
}
