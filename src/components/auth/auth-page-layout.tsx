'use client';

/**
 * AuthPageLayout: the split-screen auth chrome — a brand image panel on the
 * left (photo + yellow radial lift + the tagline) and the Clerk form on the
 * right. The Clerk components, redirect wiring, and ToS copy live in the
 * pages; this is the chrome around them.
 *
 * Charcoal in both themes, like the rest of the logged-out site: the tree is
 * tagged `data-marketing-shell` so the --fx-* palette resolves here, and
 * `dark` is forced so the Clerk widget and the shared typography helpers pick
 * their dark treatment. On mobile the brand panel collapses to a slim
 * signature strip above the form.
 *
 * Fortitudo has a single account type, so the source's realtor/broker role
 * switcher (which only ever rendered on its /login/* paths) is inert here and
 * has been dropped — nothing rendered on /sign-in or /sign-up changes.
 */

import React from 'react';
import { motion, type Variants } from 'motion/react';
import { BrandLogo, FORTITUDO_MARK_SRC } from '@/components/brand-logo';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BODY_MUTED, CAPTION, H1 } from '@/lib/typography';
import { AsciiField } from '@/components/ui/ascii-field';

/** Page-level fade + tiny y-translate (ported motion vocabulary). */
const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 4 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export interface AuthPageLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading?: string;
}

export function AuthPageLayout({ children, heading, subheading }: AuthPageLayoutProps) {
  return (
    <main
      data-marketing-shell
      className="dark relative grid min-h-screen bg-[var(--fx-charcoal)] text-[var(--fx-white)] lg:grid-cols-2"
    >
      {/* ── Left brand image panel (desktop) ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--fx-hairline)] p-12 lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/login-split.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(248,205,2,0.18),transparent_60%)]" />

        <Link href="/" className="relative z-10 flex items-center gap-2" aria-label="Fortitudo home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FORTITUDO_MARK_SRC} alt="Fortitudo" className="h-7 w-auto rounded-[4px]" />
          <span className="text-base font-medium tracking-tight text-white">Fortitudo</span>
        </Link>

        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--fx-yellow)]">
            The agentic OS for shipping products
          </p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white">
            I keep your build moving, so you don&apos;t have to.
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Drafts · Tests · Previews · Pipeline
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative flex w-full flex-col bg-[var(--fx-charcoal)] px-6 py-6 sm:px-10 sm:py-8 lg:py-10">
        {/* Mobile signature strip. */}
        <div className="absolute inset-x-0 top-0 h-24 overflow-hidden lg:hidden">
          <AsciiField className="h-full w-full opacity-30" cell={10} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[var(--fx-charcoal)]" />
        </div>

        {/* Logo (mobile + as the panel's top mark). */}
        <div className="relative z-10 shrink-0 lg:hidden">
          <BrandLogo className="h-6 sm:h-7" alt="Fortitudo" />
        </div>

        {/* Form area. */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-6 sm:py-8 lg:py-0">
          <motion.div
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="enter"
            className="mx-auto w-full max-w-[380px]"
          >
            {/* Heading: brand display face, the screen's headline. */}
            {heading && (
              <div className="mb-6 space-y-1.5">
                <h1 className={cn(H1, 'text-[var(--fx-white)]')}>{heading}</h1>
                {subheading && <p className={BODY_MUTED}>{subheading}</p>}
              </div>
            )}

            <div className="w-full">{children}</div>
          </motion.div>
        </div>

        {/* ToS / Privacy. */}
        <p className={cn(CAPTION, 'relative z-10 shrink-0 pt-4 text-center leading-relaxed sm:text-left')}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-4 transition-colors hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-4 transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
