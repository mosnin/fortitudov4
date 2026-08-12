'use client';

/**
 * Offerings — the "what we build" section, carried forward from the previous
 * landing's journey-package cards and re-set in the Giga system: near-black
 * band, display-face card titles, mono price lines, hairline cards, and the
 * capability chips carried over from the old design, re-tinted for the dark
 * shell.
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
import { KineticText, StaggerGrid } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { DISPLAY_M, MONO_STYLE, SECTION_Y, TITLE_L } from './tokens';

export function Offerings() {
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="max-w-3xl">
          <BlurRise>
            <Eyebrow>What we build</Eyebrow>
          </BlurRise>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            <KineticText lines={['Five things we build for you.']} />
          </Serif>
          <BlurRise delay={0.28}>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
              Every one has a fixed price, agreed before we start. Senior
              people do the work. You can watch it happen.
            </p>
          </BlurRise>
        </div>

        <StaggerGrid
          className="mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
          columns={3}
        >
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services#${service.id.replace(/_/g, '-')}`}
              className="group flex h-full flex-col rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-6 transition-colors duration-200 hover:border-[var(--fx-faint)]"
            >
              <service.icon className="h-5 w-5" stroke="url(#chippi-grad)" strokeWidth={1.75} />
              <Serif as="h3" className={`mt-4 ${TITLE_L} text-[var(--fx-white)]`}>
                {service.name}
              </Serif>
              <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-[var(--fx-muted)]">
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
                {/* A price is content, so it reads at --fx-muted's 6.5:1. */}
                <span
                  style={MONO_STYLE}
                  className="text-[11px] uppercase tracking-[0.22em] text-[var(--fx-muted)]"
                >
                  {service.startingPrice}
                </span>
                <span className="flex items-center gap-1 text-[12.5px] font-medium text-[var(--fx-muted)] transition-colors group-hover:text-[var(--fx-white)]">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}

          {/* Sixth cell — the "something else" card, from the old grid's dark slot */}
          <Link
            key="something-else"
            href="/contact"
            className="group flex h-full flex-col justify-between rounded-[6px] border border-dashed border-[var(--fx-hairline)] bg-transparent p-6 transition-colors duration-200 hover:border-[var(--fx-faint)]"
          >
            <div>
              <Serif as="h3" className={`${TITLE_L} text-[var(--fx-white)]`}>
                Something else?
              </Serif>
              <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--fx-muted)]">
                Moving an old site. Joining two tools together. Finishing a
                build someone else left. Tell us what you need.
              </p>
            </div>
            <span className="mt-5 flex items-center gap-1 text-[12.5px] font-medium text-[var(--fx-muted)] transition-colors group-hover:text-[var(--fx-white)]">
              Talk to us
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </StaggerGrid>
      </Band>
    </section>
  );
}
