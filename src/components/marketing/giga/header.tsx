'use client';

/**
 * SiteHeader, the dark, cinematic sticky header (reference-matched).
 *
 * Layout: FULL-BLEED. Brand + nav hug the left edge, actions hug the right edge.
 *
 * Background: fully TRANSPARENT at the top; on scroll each cluster animates in a
 * translucent near-black blurred background + hairline border + soft shadow.
 *
 * Nav: two dropdowns, Product (the five offerings) and Company (About,
 * Portfolio, FAQ, Contact), each opening a frosted blurred mega-menu, plus a
 * plain Pricing link. Right cluster: Sign in + the racing-yellow "Get a price"
 * block — the header's one yellow surface. Mobile: a full-screen blurred
 * takeover.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Aperture,
  UserRound,
  Building2,
  Blocks,
  Compass,
  Microscope,
  Sprout,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';
import { Serif } from '@/components/marketing/giga/primitives';
import { EYEBROW_TEXT, MONO_STYLE, TITLE_L } from '@/components/marketing/giga/tokens';

const SIGNIN = '/sign-in';
const DEMO = '/contact';

interface MegaItem {
  icon: React.ElementType;
  label: string;
  desc: string;
  href: string;
}

type MenuKey = 'product' | 'company';

interface MenuConfig {
  label: string;
  featured: { eyebrow: string; title: string; body: string; cta: string; href: string };
  items: MegaItem[];
}

/** The two nav dropdowns, reference-styled frosted panels. */
const MENUS: Record<MenuKey, MenuConfig> = {
  product: {
    // "Product" is what a SaaS company calls this menu. We are an agency: the
    // menu lists the five things we build for someone else, not a thing we
    // sell seats in. The KEY stays `product` — it is wired through MenuKey and
    // the open/close state — but nobody reads a key.
    label: 'What we build',
    featured: {
      eyebrow: 'WHAT WE BUILD',
      title: 'Five things we build for you.',
      body: 'Websites, apps, AI tools, advice, and marketing. Every one has a fixed price, agreed before we start.',
      cta: 'See what we build',
      href: '/services',
    },
    items: [
      { icon: Aperture, label: 'Websites', desc: 'A site people can find and buy from', href: '/services#websites' },
      { icon: Building2, label: 'Software Solutions', desc: 'An app your team will actually use', href: '/services#software-solutions' },
      { icon: Blocks, label: 'AI Solutions', desc: 'Hand the repeat work to a computer', href: '/services#ai-solutions' },
      { icon: Compass, label: 'Consultation', desc: 'Know what to build before you spend', href: '/services#consultation' },
      { icon: UserRound, label: 'Digital Marketing', desc: 'Turn more of your visitors into customers', href: '/services#digital-marketing' },
    ],
  },
  company: {
    label: 'Company',
    featured: {
      eyebrow: 'OUR STORY',
      title: 'Why we work the way we do.',
      body: 'Senior people, a fixed price, and a project you can watch. On every job we take.',
      cta: 'Read our story',
      href: '/about',
    },
    items: [
      { icon: Compass, label: 'About', desc: 'How we work, and why', href: '/about' },
      { icon: Microscope, label: 'Portfolio', desc: 'Work we can show you', href: '/portfolio' },
      { icon: LifeBuoy, label: 'FAQ', desc: 'The questions we get asked most', href: '/faq' },
      { icon: Sprout, label: 'Contact', desc: 'Tell us what you want built', href: '/contact' },
    ],
  },
};

const MENU_ORDER: MenuKey[] = ['product', 'company'];

export function SiteHeader() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Scroll-driven blur: flip `scrolled` once the page leaves the very top.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
  });

  // Close the open dropdown on outside-click + Escape.
  useEffect(() => {
    if (!openMenu) return;
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  // Lock body scroll while the mobile takeover is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  };

  // Each nav cluster is TRANSPARENT at the top and gains a blurred translucent
  // background only once scrolled, animated, so it fades in/out.
  const clusterAnimate = {
    // Literals, not tokens: these are motion values interpolated by the
    // animation, and a var() cannot be tweened. They track --fx-charcoal-deep
    // and --fx-hairline; change them together.
    backgroundColor: scrolled ? 'rgba(20,20,22,0.72)' : 'rgba(20,20,22,0)',
    borderColor: scrolled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0)',
    boxShadow: scrolled ? '0 10px 30px -12px rgba(0,0,0,0.55)' : '0 0px 0px 0px rgba(0,0,0,0)',
  };
  const clusterStyle = {
    backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
  } as React.CSSProperties;
  const clusterTransition = { duration: reduce ? 0 : 0.35, ease: EASE_OUT };

  const NavTrigger = ({ menu }: { menu: MenuKey }) => (
    <button
      type="button"
      aria-expanded={openMenu === menu}
      onClick={() => setOpenMenu((m) => (m === menu ? null : menu))}
      onMouseEnter={() => setOpenMenu(menu)}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 rounded-[4px] px-3.5 py-2 text-sm transition-colors',
        openMenu === menu
          ? 'text-[var(--fx-white)]'
          : 'text-[var(--fx-muted)] hover:text-[var(--fx-white)]',
      )}
    >
      {MENUS[menu].label}
      <ChevronDown
        className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === menu && 'rotate-180')}
      />
    </button>
  );

  const active = openMenu ? MENUS[openMenu] : null;

  return (
    <>
      <header ref={navRef} className="fixed inset-x-0 top-0 z-50">
        {/* Full-bleed: brand hugs the left, actions hug the right. */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-8 sm:py-4 lg:px-10">
          {/* LEFT cluster, relative anchor for the mega-menu */}
          <div className="relative">
            <motion.div
              initial={false}
              animate={clusterAnimate}
              transition={clusterTransition}
              style={clusterStyle}
              className="flex items-center gap-0.5 rounded-[4px] border px-1.5"
            >
              <Link href="/" aria-label="Fortitudo home" className="flex items-center px-3 py-2.5" onClick={closeAll}>
                {/* Empty alt: the link carries its own aria-label and the
                    wordmark beside it is visible text, so naming the mark
                    would announce "Fortitudo" a third time. */}
                <BrandMark className="h-5 text-[var(--fx-yellow)]" />
                <span className="ml-2 text-sm font-medium tracking-tight text-[var(--fx-white)]">
                  Fortitudo
                </span>
              </Link>
              <nav className="hidden items-center gap-0.5 lg:flex">
                <NavTrigger menu="product" />
                <NavTrigger menu="company" />
                <Link
                  href="/pricing"
                  onClick={closeAll}
                  className="rounded-[4px] px-3.5 py-2 text-sm text-[var(--fx-muted)] transition-colors hover:text-[var(--fx-white)]"
                >
                  Pricing
                </Link>
              </nav>
            </motion.div>

            {/* Dropdown mega-menu (Product / Company), frosted blurred panel */}
            <AnimatePresence>
              {active && (
                <motion.div
                  key={openMenu}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
                  className="absolute left-0 top-full hidden w-[720px] max-w-[calc(100vw-2.5rem)] pt-2.5 lg:block"
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <div className="overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-deep)]/65 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                    <div className="grid grid-cols-[280px_1fr]">
                      {/* Featured story */}
                      <Link
                        href={active.featured.href}
                        onClick={closeAll}
                        className="group/feat relative flex flex-col justify-between overflow-hidden border-r border-[var(--fx-hairline)] bg-gradient-to-br from-[var(--fx-yellow)]/12 via-[var(--fx-charcoal-deep)]/40 to-[var(--fx-charcoal-deep)]/40 p-6"
                      >
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-[4px] bg-[radial-gradient(circle,rgba(248,205,2,0.22),transparent_70%)]"
                        />
                        <div>
                          {/* Yellow as text, on an accent a few words long —
                              the one place the rule allows it. */}
                          <p
                            style={MONO_STYLE}
                            className={cn(EYEBROW_TEXT, 'text-[var(--fx-yellow)]')}
                          >
                            {active.featured.eyebrow}
                          </p>
                          <Serif as="p" className={cn('mt-3', TITLE_L, 'text-[var(--fx-white)]')}>
                            {active.featured.title}
                          </Serif>
                          <p className="mt-2.5 text-xs leading-relaxed text-[var(--fx-muted)]">
                            {active.featured.body}
                          </p>
                        </div>
                        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fx-white)]">
                          {active.featured.cta}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/feat:translate-x-0.5" />
                        </span>
                      </Link>

                      {/* Link grid */}
                      <div className="grid grid-cols-2 gap-0.5 p-4">
                        {active.items.map((it) => {
                          const Icon = it.icon;
                          return (
                            <Link
                              key={it.label}
                              href={it.href}
                              onClick={closeAll}
                              className="group flex items-start gap-3 rounded-[4px] px-3 py-2.5 transition-colors hover:bg-[var(--fx-white)]/[0.06]"
                            >
                              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-white)]/[0.06] text-[var(--fx-muted)] transition-colors group-hover:border-[var(--fx-yellow)] group-hover:text-[var(--fx-yellow)]">
                                <Icon className="h-[15px] w-[15px]" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[13px] font-medium text-[var(--fx-white)]">
                                  {it.label}
                                </span>
                                {/* --fx-muted is 6.5:1; it describes the link,
                                    so it is content, not chrome. */}
                                <span className="mt-0.5 block text-[11px] leading-snug text-[var(--fx-muted)]">
                                  {it.desc}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT cluster, actions */}
          <motion.div
            initial={false}
            animate={clusterAnimate}
            transition={clusterTransition}
            style={clusterStyle}
            className="flex items-center gap-1 rounded-[4px] border p-1.5"
          >
            <Link
              href={SIGNIN}
              className="hidden rounded-[4px] px-3.5 py-1.5 text-sm text-[var(--fx-muted)] transition-colors hover:text-[var(--fx-white)] lg:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href={DEMO}
              className="hidden h-9 items-center rounded-[4px] bg-[var(--fx-yellow)] px-4 text-sm font-medium text-[var(--fx-on-yellow)] transition-all duration-200 hover:bg-[var(--fx-yellow-hover)] active:scale-[0.98] lg:inline-flex"
            >
              Get a price
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[4px] text-[var(--fx-white)] transition-colors hover:bg-[var(--fx-white)]/[0.06] lg:hidden"
            >
              <Menu size={20} />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Mobile full-screen takeover */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
          >
            <div className="absolute inset-0 bg-[var(--fx-charcoal)]/95 backdrop-blur-xl" />
            <motion.div
              className="relative flex h-full flex-col"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT }}
            >
              <div className="flex h-16 items-center justify-between px-5 pt-3">
                <Link href="/" className="flex items-center" onClick={closeAll}>
                  {/* Empty alt: the visible wordmark beside it already names
                      the link. */}
                  <BrandMark className="h-5 text-[var(--fx-yellow)]" />
                  <span className="ml-2 text-sm font-medium tracking-tight text-[var(--fx-white)]">
                    Fortitudo
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--fx-faint)] text-[var(--fx-white)] transition-colors hover:bg-[var(--fx-white)]/[0.06]"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.nav
                className="flex-1 space-y-7 overflow-y-auto px-5 py-8"
                variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}
                initial="hidden"
                animate="show"
              >
                {MENU_ORDER.map((key) => (
                  <div key={key}>
                    <motion.p
                      variants={itemVariants}
                      style={MONO_STYLE}
                      // The heading names the group of links under it, so it
                      // is content and reads at --fx-muted's 6.5:1.
                      className={cn('px-1', EYEBROW_TEXT)}
                    >
                      {MENUS[key].label}
                    </motion.p>
                    <div className="mt-2 space-y-0.5">
                      {MENUS[key].items.map((it) => {
                        const Icon = it.icon;
                        return (
                          <motion.div key={it.label} variants={itemVariants}>
                            <Link
                              href={it.href}
                              onClick={closeAll}
                              className="flex items-center gap-3 rounded-[4px] px-1 py-2.5 text-[var(--fx-white)]"
                            >
                              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[4px] border border-[var(--fx-hairline)] bg-[var(--fx-white)]/[0.06] text-[var(--fx-muted)]">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="text-[19px]">{it.label}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <motion.div variants={itemVariants}>
                  <Link
                    href="/pricing"
                    onClick={closeAll}
                    className="block px-1 py-2 text-[19px] text-[var(--fx-white)]"
                  >
                    Pricing
                  </Link>
                </motion.div>
              </motion.nav>

              <div className="space-y-3 border-t border-[var(--fx-hairline)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                <Link
                  href={DEMO}
                  onClick={closeAll}
                  className="flex h-12 w-full items-center justify-center gap-1.5 rounded-[4px] bg-[var(--fx-yellow)] text-sm font-medium text-[var(--fx-on-yellow)]"
                >
                  Get a price
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={SIGNIN}
                  onClick={closeAll}
                  className="flex h-12 w-full items-center justify-center rounded-[4px] border border-[var(--fx-faint)] text-sm font-medium text-[var(--fx-white)]"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
