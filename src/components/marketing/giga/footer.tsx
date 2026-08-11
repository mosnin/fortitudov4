'use client';

/**
 * SiteFooter — the closing panel.
 *
 * A single inset card on the charcoal ground: an oversized display headline,
 * three real actions, then the link grid and the legal line. Adapted from a
 * reference layout, with three things deliberately not carried over:
 *
 *  - A follower count ("2,843"). We do not have one to show.
 *  - Five social links pointing at `#`. The previous footer shipped two of
 *    these aimed at /contact, and they were removed for naming a destination
 *    the link did not go to. Re-adding them with no destination at all would
 *    be the same bug wearing a bigger row. `SOCIALS` is empty and the column
 *    it feeds does not render until it isn't.
 *  - A city. We are remote-first; inventing a head office to sound established
 *    is the cheapest kind of lie and the easiest to catch.
 *
 * The reference's 40px radius is squared to the system's 6px. Everything else
 * on this surface is drawn with hairlines and square corners, and one pill-card
 * at the bottom of every page would read as an import rather than a flourish.
 *
 * Also gone: the "Access / Audit / Privacy" badges that sat under a green dot
 * labelled "Security controls". Circular badges under a status light read as
 * attestations, and we have no audit to link.
 */

import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';

const MONO = { fontFamily: 'var(--font-mono)' } as const;

/** Where the nav actually goes. Every href here is a route that exists. */
const EXPLORE = [
  { label: 'Our work', href: '/portfolio' },
  { label: 'What we do', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sign in', href: '/sign-in' },
];

const FINE_PRINT = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Notice', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Real handles only. Add `{ label, href }` entries and the "Follow along"
 * column appears on its own; leave it empty and the row stays a two-up.
 */
const SOCIALS: { label: string; href: string }[] = [];

const EMAIL = 'hello@fortitudo.agency';

export function SiteFooter() {
  return (
    <footer className="bg-[var(--fx-charcoal)] px-4 pb-16 sm:px-6">
      <div className="mx-auto mt-8 w-full max-w-7xl sm:mt-10">
        <div className="relative overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)] p-6 text-[var(--fx-white)] shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:p-8">
          {/* Texture: two soft corner lifts and a fine dot grid. Kept white
              rather than yellow — the accent is for what you press, and a
              yellow wash this large would make the one CTA below compete with
              its own background. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_120%,rgba(255,255,255,0.05),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] opacity-[0.15] [background-size:20px_20px]" />
          </div>

          <div className="relative">
            {/* Clamped rather than a bare vw: at 9vw an ultrawide monitor puts
                this past 200px and the second line stops fitting. */}
            <h2 className="text-[clamp(2rem,7vw,6.25rem)] leading-[0.9] font-semibold tracking-tighter">
              <span className="block">Tell us what you&apos;re building.</span>
              <span className="block text-white/60">
                We&apos;ll tell you what it costs.
              </span>
            </h2>

            {/* Three actions, all of which do something. */}
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                  Get started
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-3 inline-flex items-center gap-3 text-xl font-medium tracking-tight text-[var(--fx-white)] transition-colors hover:text-[var(--fx-yellow)] sm:text-2xl"
                >
                  <svg
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 flex-shrink-0"
                  >
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>
                  <span className="break-all">{EMAIL}</span>
                </a>
              </div>

              <div>
                <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                  Schedule a call
                </p>
                {/* The one yellow thing in the footer. */}
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-2 rounded-[4px] bg-[var(--fx-yellow)] px-5 py-3 text-sm font-medium tracking-tight text-[var(--fx-on-yellow)] transition-colors duration-200 hover:bg-[var(--fx-yellow-hover)]"
                >
                  <svg
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  Book a meeting
                </Link>
              </div>

              {SOCIALS.length > 0 ? (
                <div>
                  <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                    Follow along
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {SOCIALS.map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-[4px] border border-[var(--fx-hairline)] px-4 py-3 text-sm font-medium tracking-tight text-[var(--fx-white)] transition-colors duration-200 hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)]"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                    Or skip the call
                  </p>
                  <Link
                    href="/onboarding"
                    className="mt-3 inline-flex items-center gap-2 rounded-[4px] border border-[var(--fx-hairline)] px-5 py-3 text-sm font-medium tracking-tight text-[var(--fx-white)] transition-colors duration-200 hover:border-[var(--fx-yellow)] hover:text-[var(--fx-yellow)]"
                  >
                    Start a project
                    <svg
                      aria-hidden
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-10 border-t border-[var(--fx-hairline)]" />

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                  Explore
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
                  {EXPLORE.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="font-medium tracking-tight text-[var(--fx-white)] transition-colors hover:text-[var(--fx-yellow)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p style={MONO} className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                  Fine print
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm">
                  {FINE_PRINT.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="font-medium tracking-tight text-[var(--fx-white)] transition-colors hover:text-[var(--fx-yellow)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 border-t border-[var(--fx-hairline)] pt-6 sm:flex-row sm:justify-between">
              <span className="flex items-center">
                {/* Empty alt: the wordmark beside it already says "Fortitudo",
                    and naming the mark too makes a screen reader say it twice. */}
                <BrandMark className="h-5 text-[var(--fx-yellow)]" />
                <span className="ml-2 text-sm font-medium tracking-tight text-[var(--fx-white)]">
                  Fortitudo
                </span>
              </span>
              <p className="text-xs text-white/60">
                &copy; {new Date().getFullYear()} Fortitudo Agency — remote-first,
                serving clients worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
