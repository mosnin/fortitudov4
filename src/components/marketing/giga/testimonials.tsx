'use client';

/**
 * "What clients say" — the proof band.
 *
 * Adapted from a reference layout, translated to charcoal and racing yellow:
 * the reference's white highlight card becomes the yellow one, because yellow
 * is this system's surface colour and this is the card meant to be read first.
 *
 * It ships EMPTY on purpose. Fill `TESTIMONIALS` and `METRICS` below and the
 * section switches to the real layout on its own; until then every slot is
 * drawn as a dashed placeholder that says what belongs in it.
 *
 * Three things from the reference are deliberately not reproduced, even as
 * placeholders, because a placeholder that looks like content is just content:
 *
 *  - The five filled stars. A rating with no reviewers behind it is a number
 *    we made up. Empty slots render hollow stars; a real entry renders only as
 *    many filled as its `rating` says.
 *  - The Unsplash headshots. Those are photographs of real people being passed
 *    off as clients of ours. Placeholders get a neutral tile, and a real entry
 *    only shows a face if you give it one.
 *  - "4.6s average page load", "18+ countries", "72% conversion improvement".
 *    Invented metrics presented as measured ones. The slots are here; the
 *    numbers have to come from somewhere.
 */

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Lang } from '@/lib/i18n/markets';
import { HOME, type HomeDict } from '@/lib/i18n/dictionaries/home';
import { fill } from '@/lib/i18n/dictionaries/pricing';
import { Band, BlurRise, Serif } from './primitives';
import { BODY, BODY_S, DISPLAY_M, EYEBROW_TEXT, LEAD, MONO_STYLE, SECTION_Y } from './tokens';

/** This section's slice of the home dictionary, handed down to the cards. */
type Copy = HomeDict['testimonials'];

export type Testimonial = {
  /** What they actually said, in their words. */
  quote: string;
  /** Their real name — or their role and sector if they are under NDA. */
  name: string;
  /** Title and company, e.g. "CTO, Acme". */
  title: string;
  /** 1–5. Omit unless they actually gave one. */
  rating?: number;
  /** Path under /public. Omit and the initial is used instead. */
  avatar?: string;
};

/**
 * Real quotes only, and only ones the client has agreed to have published
 * with their name on them. Three reads best; the layout takes any number.
 */
export const TESTIMONIALS: Testimonial[] = [];

export type ProofMetric = {
  value: string;
  label: string;
};

/** Measured numbers only. If you cannot point at where it came from, leave it out. */
export const METRICS: ProofMetric[] = [];

/* The slot copy — what belongs in each empty card — lives in the home
   dictionary (`testimonials.slots` / `testimonials.metricSlots`) with the rest
   of the section's words. It is copy an editor reads, so it translates like
   any other line, and it stays a description of what is missing: filling it in
   with an invented quote is the exact thing this section was cleared of. */

function Stars({ rating, copy }: { rating?: number; copy: Copy }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={rating ? fill(copy.ratingLabel, { rating }) : copy.noRatingLabel}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-3 w-3"
          fill={rating && i <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={rating && i <= rating ? 0 : 1.25}
          aria-hidden
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

/** The double-quote glyph the reference uses as a card mark. */
function QuoteMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M7 7h3v10H5V9a2 2 0 0 1 2-2Zm9 0h3v10h-5V9a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function TestimonialCard({
  testimonial,
  highlight,
  copy,
}: {
  testimonial: Testimonial;
  highlight: boolean;
  copy: Copy;
}) {
  return (
    <article
      data-fx-surface="dark"
      className={`flex h-full flex-col p-7 ${
        highlight
          ? 'bg-[var(--fx-yellow)] text-[var(--fx-on-yellow)]'
          : 'bg-[var(--fx-charcoal-deep)] text-[var(--fx-white)]'
      }`}
    >
      <QuoteMark className={highlight ? 'opacity-70' : 'opacity-60'} />
      <div className="mt-4">
        <Stars rating={testimonial.rating} copy={copy} />
      </div>
      <p className={`mt-5 flex-1 ${LEAD}`}>
        {testimonial.quote}
      </p>
      <div className="mt-7 flex items-center justify-between gap-4">
        <div>
          <div className={`${BODY} font-medium`}>{testimonial.name}</div>
          <div
            className={`mt-1 ${BODY_S} ${
              highlight ? 'text-[var(--fx-on-yellow)]/70' : 'text-[var(--fx-muted)]'
            }`}
          >
            {testimonial.title}
          </div>
        </div>
        {testimonial.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              highlight
                ? 'bg-[var(--fx-on-yellow)]/10 text-[var(--fx-on-yellow)]'
                : 'bg-[var(--fx-charcoal-raised)] text-[var(--fx-white)]'
            }`}
          >
            {testimonial.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </article>
  );
}

function PlaceholderCard({ slot, index, copy }: { slot: string; index: number; copy: Copy }) {
  return (
    <article data-fx-surface="dark" className="flex h-full flex-col bg-[var(--fx-charcoal-deep)] p-7">
      <div className="flex h-full flex-col rounded-[4px] border border-dashed border-[var(--fx-hairline)] p-6">
        <div className="flex items-center justify-between">
          <QuoteMark className="text-[var(--fx-faint)]" />
          <span style={MONO_STYLE} className={EYEBROW_TEXT}>
            {fill(copy.slotLabel, { n: String(index + 1).padStart(2, '0') })}
          </span>
        </div>
        {/* Hollow stars: the shape of a rating without asserting one. */}
        <div className="mt-4 text-[var(--fx-faint)]">
          <Stars copy={copy} />
        </div>
        <p className={`mt-5 flex-1 ${BODY} text-[var(--fx-muted)]`}>
          {slot}
        </p>
        <div className="mt-7 flex items-center gap-3">
          <span
            aria-hidden
            className="h-9 w-9 shrink-0 rounded-full border border-dashed border-[var(--fx-hairline)]"
          />
          {/* Says what belongs in the slot, so it is read, not decoration. */}
          <span className={`${BODY_S} text-[var(--fx-muted)]`}>
            {copy.slotAttribution}
          </span>
        </div>
      </div>
    </article>
  );
}

export function Testimonials({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].testimonials;
  const hasQuotes = TESTIMONIALS.length > 0;
  const hasMetrics = METRICS.length > 0;
  /* The middle card is the highlight, exactly as in the reference. With two or
     fewer entries there is no middle, so nothing is highlighted rather than
     promoting an arbitrary one. */
  const highlightIndex = TESTIMONIALS.length >= 3 ? 1 : -1;

  return (
    <section
      className={`border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}
    >
      <Band narrow="max-w-6xl">
        {/* Meta row */}
        <BlurRise>
          <div
            style={MONO_STYLE}
            className={`flex items-center justify-between ${EYEBROW_TEXT} text-[var(--fx-white)]`}
          >
            <span>{t.eyebrow}</span>
            {/* Counts what is actually published, so it cannot go stale. */}
            <span className="text-[var(--fx-muted)]">
              ({String(TESTIMONIALS.length).padStart(2, '0')})
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-[var(--fx-hairline)]" />
        </BlurRise>

        {/* Header */}
        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <BlurRise className="lg:col-span-7">
            {/* Sentence case at the standard section step. Uppercase is the
                eyebrow's treatment on this surface; a headline wearing it read
                as a second, competing voice. */}
            <Serif as="h2" className={`${DISPLAY_M} text-[var(--fx-white)]`}>
              {t.heading}
            </Serif>
          </BlurRise>

          <BlurRise delay={0.08} className="lg:col-span-5">
            <p className={`max-w-md ${LEAD} text-[var(--fx-muted)]`}>
              {hasQuotes ? t.leadWithQuotes : t.leadEmpty}
            </p>
            <Link
              href="/contact"
              data-fx-surface="dark"
              className="group mt-6 inline-flex items-center gap-3 rounded-[4px] border border-[var(--fx-faint)] bg-[var(--fx-charcoal-raised)] p-2 transition-colors duration-200 hover:border-[var(--fx-yellow)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--fx-yellow)] text-[var(--fx-on-yellow)]">
                <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="px-3 text-sm font-medium text-[var(--fx-white)]">
                {t.cta}
              </span>
            </Link>
          </BlurRise>
        </div>

        {/* Cards + metrics, sharing one hairline frame */}
        <BlurRise delay={0.12} className="mt-12">
          <div className="overflow-hidden rounded-[6px] border border-[var(--fx-hairline)]">
            <div className="grid grid-cols-1 gap-px bg-[var(--fx-hairline)] lg:grid-cols-3">
              {hasQuotes
                ? TESTIMONIALS.map((testimonial, i) => (
                    <TestimonialCard
                      key={`${testimonial.name}-${i}`}
                      testimonial={testimonial}
                      highlight={i === highlightIndex}
                      copy={t}
                    />
                  ))
                : t.slots.map((slot, i) => (
                    <PlaceholderCard key={slot} slot={slot} index={i} copy={t} />
                  ))}
            </div>

            <div className="grid grid-cols-1 gap-px border-t border-[var(--fx-hairline)] bg-[var(--fx-hairline)] sm:grid-cols-3">
              {hasMetrics
                ? METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      data-fx-surface="dark"
                      className="bg-[var(--fx-charcoal-deep)] p-7"
                    >
                      <Serif
                        as="p"
                        className="text-3xl font-light tabular-nums text-[var(--fx-white)] sm:text-4xl"
                      >
                        {metric.value}
                      </Serif>
                      <div className={`mt-2 ${BODY_S} text-[var(--fx-muted)]`}>
                        {metric.label}
                      </div>
                    </div>
                  ))
                : t.metricSlots.map((label, i) => (
                    <div
                      key={i}
                      data-fx-surface="dark"
                      className="bg-[var(--fx-charcoal-deep)] p-7"
                    >
                      <div className="rounded-[4px] border border-dashed border-[var(--fx-hairline)] px-4 py-5">
                        {/* Decorative: an em-dash pair standing in for a
                            number nobody has measured yet. --fx-faint is
                            correct here precisely because it says nothing. */}
                        <div className="text-3xl font-light text-[var(--fx-faint)] sm:text-4xl">
                          &mdash;&mdash;
                        </div>
                        <div style={MONO_STYLE} className={`mt-3 ${EYEBROW_TEXT}`}>
                          {label}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </BlurRise>
      </Band>
    </section>
  );
}
