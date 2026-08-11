'use client';

/**
 * SiteFooter, light/dark-adaptive footer (reference-matched): the twirling
 * shader-gradient band on top, then the Chippi wordmark + security-practice badges on
 * the left and three link columns on the right, with a © / social meta row.
 */

import Link from 'next/link';
import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';

const columns: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Services', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Onboarding', href: '/onboarding' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'See a demo', href: '/contact' },
    { label: 'Sign in', href: '/sign-in' },
  ],
  Resources: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Sign up', href: '/sign-up' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

const SECURITY_PRACTICES = ['Access', 'Audit', 'Privacy'];
const MONO = { fontFamily: 'var(--font-mono)' } as const;

export function SiteFooter() {
  return (
    <footer className="relative bg-white dark:bg-[#1b1b1d]">
      {/* Warm gradient band (Chippi orange / pink / yellow), anchored toward the
          footer and revealing as it scrolls into view. A wide, flat ellipse so
          it reads as a soft wash rather than a tight radial. Fades UP into the
          CTA above and out at the very bottom. */}
      <div className="relative h-60 w-full overflow-hidden sm:h-72">
        <AnimatedGradientBackground
          revealOnScroll
          Breathing
          startingGap={185}
          topOffset={-115}
          breathingRange={6}
          animationSpeed={0.02}
          gradientOrigin="50% 92%"
          gradientColors={['#f8cd02', '#dcb602', '#dcb602', 'rgba(248,205,2,0)']}
          gradientStops={[0, 38, 72, 100]}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white dark:to-[#1b1b1d]" />
      </div>

      <div className="relative">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
            {/* Left: logo + security practices. Avoid certification claims unless
                the corresponding audit or attestation can be linked publicly. */}
            <div>
              <span className="flex items-center">
                {/* Empty alt: the wordmark next to it already says
                    "Fortitudo", and naming the mark too makes a screen reader
                    announce the brand twice. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/fortitudo-mark.png"
                  alt=""
                  width={320}
                  height={320}
                  className="h-5 w-auto"
                />
                <span className="ml-2 text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                  Fortitudo
                </span>
              </span>
              {/* white/60 is 6.9:1 on charcoal; white/40 was 3.8:1, under the
                  4.5:1 floor these small labels are held to. */}
              <span style={MONO} className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-white/60">
                <span aria-hidden className="inline-block size-1.5 rounded-full bg-emerald-500" />
                Security controls
              </span>
              <div className="mt-3 flex items-center gap-2">
                {SECURITY_PRACTICES.map((practice) => (
                  <span
                    key={practice}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-neutral-50 text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50"
                  >
                    {practice}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: link columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {Object.entries(columns).map(([heading, items]) => (
                <div key={heading}>
                  {/* Column headings name the group of links under them, so
                      they read at white/60 (6.9:1), not white/40 (3.8:1). */}
                  <span style={MONO} className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 dark:text-white/60">
                    {heading}
                  </span>
                  <ul className="mt-4 space-y-2.5">
                    {items.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-white/55 dark:hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Meta row. The "X" and "LinkedIn" links are gone: both pointed at
              /contact in a new tab, so the label named a destination the link
              did not go to. They come back when the accounts exist. */}
          <div className="mt-14 border-t border-black/[0.06] pt-6 dark:border-white/[0.08]">
            {/* white/60 is 6.9:1; white/40 was 3.8:1. */}
            <p className="text-xs text-neutral-500 dark:text-white/60">
              &copy; {new Date().getFullYear()} Fortitudo Agency. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
