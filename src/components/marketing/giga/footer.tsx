'use client';

/**
 * SiteFooter — OriginKit `footer-02` ("Notrix" tetris footer), ported per
 * the owner's instruction: same shell (full-height section, soft wash, one
 * dark rounded card, link columns beside the brand block, and the tetromino
 * stack playing itself along the card's bottom edge), tailored to this
 * site's tokens, fonts and real links.
 *
 * WHAT CHANGED IN THE PORT, AND WHY:
 *  - Palette: the cream ground becomes the charcoal; the #212121 card
 *    becomes the raised charcoal with a hairline edge and this surface's
 *    6px corners; the drop's rainbow gradient-shapes wash becomes a single
 *    racing-yellow glow with the same geometry, mask and blur — one accent,
 *    not five.
 *  - The tetris keeps the drop's high-contrast play — cream on near-black
 *    there, racing yellow on the card here (yellow is a surface). It is
 *    vendored with the site's frame-budget rule added: parked off-screen
 *    and under reduced motion (`ui/footer-02/tetris.tsx`).
 *  - Copy and links are this site's real ones, matched by dictionary key:
 *    the old footer's display headline moves into the brand block, the
 *    columns are Explore / Get started / Fine print, and every href is a
 *    route that exists. The socials row is omitted — there are no real
 *    handles, and nothing on this site is invented.
 *  - `footer-02.css` is not carried: it held a Google-Fonts import (banned
 *    — every face is self-hosted) for a serif this surface does not use,
 *    and the slide-up animation of the socials that no longer exist.
 *  - The bottom bar (brand mark, copyright, the interface-sound mute) is
 *    this site's required chrome and carries over from the old footer.
 */

import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import Tetris from '@/components/originkit/ui/footer-02/tetris';
import { SoundToggle } from '@/components/sound/sound-toggle';
import { Serif } from './primitives';
import { BODY_S, DISPLAY_S, EYEBROW_TEXT, MONO_STYLE } from './tokens';
import type { Lang } from '@/lib/i18n/markets';
import { CHROME, type ChromeDict } from '@/lib/i18n/dictionaries/chrome';

/**
 * Where the nav actually goes. Every href here is a route that exists. The
 * label text lives in `lib/i18n/dictionaries/chrome.ts` and is matched BY
 * KEY, so a link with no copy behind it cannot compile.
 */
const EXPLORE: { key: keyof ChromeDict['footer']['explore']; href: string }[] = [
  { key: 'work', href: '/work' },
  { key: 'services', href: '/services' },
  { key: 'pricing', href: '/pricing' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
  { key: 'signIn', href: '/sign-in' },
];

const FINE_PRINT: { key: keyof ChromeDict['footer']['finePrint']; href: string }[] = [
  { key: 'terms', href: '/terms' },
  { key: 'privacy', href: '/privacy' },
  { key: 'contact', href: '/contact' },
];

/** An address, not copy: it reads the same in every language. */
const EMAIL = 'hello@fortitudo.agency';

const LINK_CLASS =
  'relative inline-flex items-center text-[15px] leading-normal text-[var(--fx-muted)] transition-colors duration-200 before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[""] hover:text-[var(--fx-white)] desktop-sm:text-[14px]';

const COLUMN_TITLE = `${EYEBROW_TEXT}`;

export function SiteFooter({ lang = 'en' }: { lang?: Lang }) {
  const t = CHROME[lang].footer;
  // Computed at render, never frozen into the dictionary — see chrome.ts.
  const copyright = t.copyright.replace('{year}', String(new Date().getFullYear()));

  // The third column: the old footer's three actions, as links. Real routes.
  const startLinks = [
    { label: EMAIL, href: `mailto:${EMAIL}` },
    { label: t.project.cta, href: '/onboarding' },
    { label: t.call.cta, href: '/contact' },
  ];

  return (
    <footer
      aria-label="Fortitudo footer"
      className="relative isolate flex min-h-svh w-full flex-col items-center justify-end overflow-hidden bg-[var(--fx-charcoal)] px-4 pb-8 pt-12 ipad:px-10 ipad:pt-16 desktop-sm:px-12 desktop-sm:pt-24"
    >
      {/* The drop's soft wash behind the card — same geometry, mask and
          blur; the artwork is a single racing-yellow glow instead of the
          rainbow svg. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[55%] min-h-[280px] w-full justify-center overflow-hidden ipad:h-[60%] desktop-sm:h-[70%] desktop-sm:min-h-[320px]"
        style={{
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)',
        }}
      >
        <div
          className="absolute top-[-30%] left-1/2 h-[545px] w-[280%] max-w-none -translate-x-1/2 scale-110 opacity-60 blur-[40px] ipad:top-[-40%] ipad:w-[220%] ipad:blur-[60px] desktop-sm:top-[-55%] desktop-sm:w-[200%] desktop-sm:scale-125 desktop-sm:blur-[80px] full-hd:w-[240%] full-hd:scale-150 full-hd:blur-[90px] ultrawide:top-[-60%] ultrawide:w-[280%] ultrawide:scale-[1.75] ultrawide:blur-[100px]"
          style={{
            background:
              'radial-gradient(50% 60% at 50% 30%, rgba(248,205,2,0.20) 0%, rgba(248,205,2,0.06) 55%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[95dvw] wide-lg:max-w-[1440px]">
        <div className="relative isolate mx-auto min-h-[778px] w-full overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]">
          <div className="relative z-10 flex flex-col gap-10 px-5 pt-10 pb-[300px] ipad:gap-12 ipad:px-12 ipad:pt-12 ipad:pb-[320px] desktop-sm:flex-row desktop-sm:items-start desktop-sm:justify-between desktop-sm:gap-10 desktop-sm:px-14 desktop-sm:pt-[72px] desktop-sm:pb-[300px]">
            {/* Brand block — the old footer's display headline lives on
                here: the ask, then the dimmed answer. */}
            <div className="flex w-full max-w-xl flex-col gap-6 desktop-sm:shrink">
              <Serif as="p" className={`${DISPLAY_S} text-[var(--fx-white)]`}>
                {t.headline.line1}
                <br />
                <span className="text-[var(--fx-muted)]">{t.headline.line2}</span>
              </Serif>
            </div>

            {/* Link columns. */}
            <nav
              aria-label="Footer"
              className="grid w-full grid-cols-2 gap-x-8 gap-y-10 ipad:grid-cols-3 ipad:gap-8 desktop-sm:flex desktop-sm:w-[560px] desktop-sm:shrink-0 desktop-sm:gap-14"
            >
              <div className="flex min-w-0 flex-col gap-4 desktop-sm:flex-1">
                <p style={MONO_STYLE} className={COLUMN_TITLE}>
                  {t.exploreEyebrow}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {EXPLORE.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={LINK_CLASS}>
                        {t.explore[link.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex min-w-0 flex-col gap-4 desktop-sm:flex-1">
                <p style={MONO_STYLE} className={COLUMN_TITLE}>
                  {t.email.eyebrow}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {startLinks.map((link) =>
                    link.href.startsWith('mailto:') ? (
                      <li key={link.href}>
                        <a href={link.href} className={LINK_CLASS}>
                          {link.label}
                        </a>
                      </li>
                    ) : (
                      <li key={link.href}>
                        <Link href={link.href} className={LINK_CLASS}>
                          {link.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="flex min-w-0 flex-col gap-4 desktop-sm:flex-1">
                <p style={MONO_STYLE} className={COLUMN_TITLE}>
                  {t.finePrintEyebrow}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {FINE_PRINT.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={LINK_CLASS}>
                        {t.finePrint[link.key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          {/* Bottom bar — the site's required chrome, floating above the
              tetris strip: mark, legal line, and the sound mute. */}
          <div className="absolute inset-x-0 bottom-[268px] z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--fx-hairline)] px-5 py-4 ipad:px-12 desktop-sm:px-14">
            <span className="flex items-center">
              <BrandMark className="h-4 text-[var(--fx-yellow)]" />
              <span className="ml-2 text-sm font-medium tracking-tight text-[var(--fx-white)]">
                Fortitudo
              </span>
            </span>
            <p className={`${BODY_S} text-[var(--fx-muted)]`}>{copyright}</p>
            <SoundToggle className="text-[var(--fx-muted)] hover:text-[var(--fx-white)]" />
          </div>

          {/* Tetris board — decorative stack along the bottom (drop,
              verbatim geometry; the site's colours, and parked when unseen
              or under reduced motion — see the vendored file). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[268px] overflow-hidden"
          >
            <Tetris
              boardColor="#191a1d"
              colors={['#f8cd02']}
              cellSize={20}
              gap={0}
              rounded={20}
              dropSpeed={1}
              movement={2}
              startFilled={true}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
