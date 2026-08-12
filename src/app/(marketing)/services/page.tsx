'use client';

/**
 * `/services` — the five offerings in detail.
 *
 * Moved into the `(marketing)` route group and rebuilt on the racing-yellow
 * system. It used to live at `src/app/services` with its own `<Header/>` and
 * `<Footer/>`, on the old orange template: clicking "Services" in the nav took
 * you from the charcoal homepage to a different-looking site. The group's
 * layout supplies the chrome now, so this file is only the page.
 *
 * The per-service content is read from `src/lib/services.ts` — the same module
 * the product prices and routes from.
 */

import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { services } from '@/lib/services';
import {
  Band,
  BlurRise,
  Eyebrow,
  PillGhost,
  PillPrimary,
  Serif,
  MONO_STYLE,
  EYEBROW_TEXT,
  DISPLAY_L,
  DISPLAY_S,
  HERO_Y,
  SECTION_Y,
} from '@/components/marketing/giga/primitives';
import { CtaSection } from '@/components/marketing/giga/cta';

/** What every engagement includes, whichever of the five you buy. */
const ALWAYS_INCLUDED = [
  'Project discovery & requirements',
  'Custom UI/UX design',
  'Full development & integration',
  'Quality assurance & testing',
  'Deployment & launch support',
  '30-day post-launch support',
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${HERO_Y}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
        />
        <Band innerClassName="relative max-w-3xl">
          <BlurRise trigger="load">
            <Eyebrow>Our services</Eyebrow>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Everything you need to{' '}
              <span className="text-[var(--fx-yellow)]">launch &amp; grow.</span>
            </Serif>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--fx-muted)]">
              From concept to deployment, we build digital solutions that drive
              results. Pick the service that fits — we handle the rest.
            </p>
          </BlurRise>
        </Band>
      </section>

      {/* One band per offering, alternating sides */}
      {services.map((service, index) => {
        const Icon = service.icon;
        const isEven = index % 2 === 0;
        return (
          <section
            key={service.id}
            id={service.id.replace(/_/g, '-')}
            className={`border-b border-[var(--fx-hairline)] ${SECTION_Y} ${
              isEven
                ? 'bg-[var(--fx-charcoal)]'
                : 'bg-[var(--fx-charcoal-deep)]'
            }`}
          >
            <Band>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
              >
                <div className={isEven ? '' : 'lg:order-2'}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]">
                      <Icon
                        className="h-5 w-5 text-[var(--fx-yellow)]"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span
                      style={MONO_STYLE}
                      className={`rounded-[4px] border border-[var(--fx-hairline)] px-2.5 py-1 ${EYEBROW_TEXT}`}
                    >
                      {service.startingPrice}
                    </span>
                  </div>

                  <Serif as="h2" className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                    {service.name}
                  </Serif>
                  <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--fx-muted)]">
                    {service.description}
                  </p>

                  <ul className="mt-7 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-[var(--fx-yellow)]" />
                        <span className="text-[14px] text-[var(--fx-muted)]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <PillPrimary
                    href={`/onboarding?service=${service.id}`}
                    className="mt-9"
                    withArrow
                  >
                    Start with {service.name}
                  </PillPrimary>
                </div>

                {/* What's included — the same list for every offering, which is
                    the point: the floor does not move with the price. */}
                <div className={isEven ? '' : 'lg:order-1'}>
                  <div className="rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)] p-8 sm:p-10">
                    <p style={MONO_STYLE} className={EYEBROW_TEXT}>
                      Included either way
                    </p>
                    <div className="mt-6 space-y-4">
                      {ALWAYS_INCLUDED.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 border-b border-[var(--fx-hairline)] pb-4 text-[14px] text-[var(--fx-white)] last:border-0 last:pb-0"
                        >
                          <Check className="h-4 w-4 shrink-0 text-[var(--fx-yellow)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Band>
          </section>
        );
      })}

      {/* Bottom ask */}
      <section className={`border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
        <Band innerClassName="max-w-2xl">
          <BlurRise>
            <Serif className={`${DISPLAY_S} text-[var(--fx-white)]`}>
              Not sure which one you need?
            </Serif>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--fx-muted)]">
              Book a free consultation and we&apos;ll help you pick the path
              that actually fits — including telling you when the answer is
              &ldquo;not yet&rdquo;.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillPrimary href="/contact" withArrow>
                Book a consultation
              </PillPrimary>
              <PillGhost href="/pricing">View pricing</PillGhost>
            </div>
          </BlurRise>
        </Band>
      </section>

      <CtaSection />
    </>
  );
}
