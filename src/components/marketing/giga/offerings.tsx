'use client';

/**
 * Offerings — the "what we build" section, carried forward from the previous
 * landing's journey-package cards and re-set in the Giga system: near-black
 * band, serif card titles, mono price lines, hairline cards, and the rotating
 * capability chips (the one mechanic kept from the old design, re-tinted for
 * the dark shell).
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { services } from '@/lib/services';
import { Serif, Eyebrow, BlurRise, Band } from './primitives';

const SANS = { fontFamily: 'var(--font-sans)' } as const;
const MONO = { fontFamily: 'var(--font-mono)' } as const;

export function Offerings() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#1b1b1d] py-24 text-white sm:py-32">
      <Band>
        <BlurRise className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">What we build</Eyebrow>
          <Serif className="mt-5 text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.06] text-white">
            Five ways we can build with you.
          </Serif>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed text-white/55">
            Websites, software, AI, consultation, and digital marketing — every
            engagement on a fixed quote, tracked live, with Helix accelerating
            the build under senior review.
          </p>
        </BlurRise>

        <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <BlurRise key={service.id} delay={0.06 * (i % 3)}>
              <Link
                href={`/services#${service.id.replace(/_/g, '-')}`}
                className="group flex h-full flex-col rounded-[6px] border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.04]"
              >
                <service.icon className="h-5 w-5" stroke="url(#chippi-grad)" strokeWidth={1.75} />
                <Serif as="h3" className="mt-4 text-[26px] leading-none text-white">
                  {service.name}
                </Serif>
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-white/50">
                  {service.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      style={SANS}
                      className="rounded-md bg-white/[0.05] px-2 py-1 text-[10.5px] leading-none text-white/60 transition-[background-color,transform] duration-300 ease-out group-hover:bg-white/[0.08] hover:rotate-[6deg]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                  {/* A price is content. white/60 is 6.9:1; white/45 was
                      4.45:1, just under the 4.5:1 body floor. */}
                  <span style={MONO} className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                    {service.startingPrice}
                  </span>
                  <span className="flex items-center gap-1 text-[12.5px] font-medium text-white/70 transition-colors group-hover:text-white">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </BlurRise>
          ))}

          {/* Sixth cell — the "something else" card, from the old grid's dark slot */}
          <BlurRise delay={0.12}>
            <Link
              href="/contact"
              className="group flex h-full flex-col justify-between rounded-[6px] border border-dashed border-white/[0.12] bg-transparent p-6 transition-colors duration-200 hover:border-white/[0.24]"
            >
              <div>
                <Serif as="h3" className="text-[26px] leading-none text-white">
                  Something else?
                </Serif>
                <p className="mt-2.5 text-[13px] leading-relaxed text-white/50">
                  Migrations, integrations, rescue projects — if it ships to a
                  browser, we&apos;ve probably built it. Tell us what you need.
                </p>
              </div>
              <span className="mt-5 flex items-center gap-1 text-[12.5px] font-medium text-white/70 transition-colors group-hover:text-white">
                Talk to us
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
