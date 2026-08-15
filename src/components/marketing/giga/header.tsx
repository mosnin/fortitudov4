'use client';

/**
 * SiteHeader — the navigation-01 resource (floating pill header with desktop
 * flyout menus) plus the navigation-drawer resource as the menu below the
 * breakpoint. Markup here, styles in globals.css, behavior in the vendored
 * controllers `src/lib/navigation-01.ts` / `src/lib/navigation-drawer.ts`.
 *
 * HOW THE TWO RESOURCES SHARE THE JOB (both were user-supplied):
 *  - ≥901px: the navigation-01 header — scroll-aware shell resize, glass bar,
 *    hover pill, two flyouts. "What we build" is the mega panel (the five
 *    offerings, monochrome preview stills); "Company" is the simple panel.
 *    The panel keys stay `product` / `solutions` because the vendored
 *    controller queries those literals; the visible labels come from the
 *    chrome dictionary as always.
 *  - ≤900px: the navigation-01 nav hides entirely and the drawer IS the menu
 *    ("use this for the menu") — its own fixed toggle pill, clip-path panel,
 *    staggered rows, CSS-only services submenu, pill CTA. The resource's
 *    mobile accordion is therefore not rendered (no `.nav-menu-toggle`, no
 *    accordion slots); the controller's own guards make those branches no-ops.
 *
 * Copy stays in `chrome.ts`, hrefs stay here, matched by key — the same
 * contract the previous header kept. The CTA is the glass Arrow Shift Button
 * (`button-05--sm`), per "use glass style buttons".
 *
 * React renders this markup once and never reconciles the parts the vendored
 * controllers mutate (classes, aria-expanded, inert, inline sizes) — every
 * string and attribute here is static per render, which is the precondition
 * for handing the DOM to imperative code.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/brand-mark';
import { navigation01 } from '@/lib/navigation-01';
import { navigationDrawer } from '@/lib/navigation-drawer';
import type { Lang } from '@/lib/i18n/markets';
import { CHROME, type ChromeDict } from '@/lib/i18n/dictionaries/chrome';

const SIGNIN = '/sign-in';
const DEMO = '/contact';

type NavItemKey = keyof ChromeDict['nav']['items'];

/** The five offerings — the mega panel's sidebar, each paired with a
 *  monochrome stock still in `public/marketing/nav/` (Unsplash, desaturated
 *  to the site's monochrome-imagery rule; previews are decorative and
 *  aria-hidden via empty alt + the panel's inert state). */
const SERVICE_ITEMS: { key: NavItemKey; href: string; preview: string }[] = [
  { key: 'websites', href: '/services#websites', preview: '/marketing/nav/websites.jpg' },
  { key: 'softwareSolutions', href: '/services#software-solutions', preview: '/marketing/nav/software.jpg' },
  { key: 'aiSolutions', href: '/services#ai-solutions', preview: '/marketing/nav/ai.jpg' },
  { key: 'consultation', href: '/services#consultation', preview: '/marketing/nav/consultation.jpg' },
  { key: 'digitalMarketing', href: '/services#digital-marketing', preview: '/marketing/nav/marketing.jpg' },
];

const COMPANY_ITEMS: { key: NavItemKey; href: string }[] = [
  { key: 'about', href: '/about' },
  { key: 'portfolio', href: '/portfolio' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
];

/** The drawer's flat rows (the services submenu nests under its own block). */
const DRAWER_LINKS: { key: NavItemKey; href: string }[] = [
  { key: 'portfolio', href: '/portfolio' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
];

/** The resource's chevron, verbatim. */
function Chevron() {
  return (
    <svg className="nav-chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader({ lang = 'en' }: { lang?: Lang }) {
  const t = CHROME[lang].nav;
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const destroyNav = navigation01(document);
    const destroyDrawer = navigationDrawer(document);
    return () => {
      destroyNav?.();
      destroyDrawer?.();
    };
  }, []);

  // The demo's cross-page clicks reloaded the document; under the client
  // router the header survives navigation, so open surfaces close themselves
  // when the route lands.
  useEffect(() => {
    const nav = headerRef.current?.querySelector('.navigation-01') as
      | (Element & { __navigation01?: { close(): void } })
      | null;
    nav?.__navigation01?.close();
    (
      drawerRef.current as (HTMLDivElement & { __navigationDrawer?: { close(): void } }) | null
    )?.__navigationDrawer?.close();
  }, [pathname]);

  return (
    <>
      <header ref={headerRef} className="navigation-01-header">
        <div className="header-shell">
          <div className="header-bar" aria-hidden="true" />
          <div className="header-content">
            <Link className="logo" href="/" aria-label={t.aria.home}>
              <BrandMark className="h-5 text-[var(--fx-yellow)]" />
              <span className="logo-word">Fortitudo</span>
            </Link>

            <nav className="navigation-01" aria-label="Main navigation">
              <ul className="nav-list">
                <li>
                  <button
                    type="button"
                    className="nav-item"
                    data-flyout="product"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    {t.menus.product.label}
                    <Chevron />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-item"
                    data-flyout="solutions"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    {t.menus.company.label}
                    <Chevron />
                  </button>
                </li>
                <li>
                  <Link className="nav-item" href="/pricing">
                    {t.pricing}
                  </Link>
                </li>
              </ul>

              <span className="nav-hover-bg" aria-hidden="true" />

              <div className="nav-flyout" hidden>
                <div className="nav-flyout__bg" aria-hidden="true" />
                <div className="nav-flyout__viewport">
                  <div className="nav-flyout__panel nav-flyout__panel--mega" data-panel="product">
                    <div className="nav-dropdown__inner">
                      <div className="nav-dropdown__sidebar">
                        <span className="nav-dropdown__pill" aria-hidden="true" />
                        <ul className="nav-dropdown__list">
                          {SERVICE_ITEMS.map((item, index) => (
                            <li key={item.key}>
                              <Link
                                className="nav-dropdown__item"
                                href={item.href}
                                data-preview-index={index}
                              >
                                <span className="nav-dropdown__title">{t.items[item.key].label}</span>
                                <span className="nav-dropdown__description">
                                  {t.items[item.key].desc}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="nav-dropdown__preview">
                        {SERVICE_ITEMS.map((item, index) => (
                          <div
                            key={item.key}
                            className={`nav-dropdown__preview-panel${index === 0 ? ' is-active' : ''}`}
                            data-preview-index={index}
                          >
                            <div className="nav-dropdown__placeholder">
                              {/* Plain <img>, as the resource ships it: these
                                  are decorative crossfade stills inside an
                                  inert panel; next/image's wrapper markup
                                  would break the resource's selectors. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.preview} alt="" loading="lazy" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="nav-flyout__panel nav-flyout__panel--simple" data-panel="solutions">
                    <div className="nav-dropdown__inner">
                      <span className="nav-dropdown__pill" aria-hidden="true" />
                      <ul className="nav-dropdown__list">
                        {COMPANY_ITEMS.map((item) => (
                          <li key={item.key}>
                            <Link className="nav-dropdown__item" href={item.href}>
                              <span className="nav-dropdown__title">{t.items[item.key].label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            <div className="header-actions">
              <Link href={SIGNIN} className="signin-link">
                {t.signIn}
              </Link>
              <Link href={DEMO} className="button-05 button-05--sm">
                <span className="glass" aria-hidden="true" />
                <span className="content">
                  <span className="copy">{t.getPrice}</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* The menu — the navigation-drawer resource, mobile only (≤900px). */}
      <div ref={drawerRef} className="navigation-drawer" data-drawer>
        <button
          className="nav-toggle"
          type="button"
          data-drawer-toggle
          aria-controls="site-drawer"
          aria-expanded="false"
        >
          <span className="toggle-label">
            <span className="label-wrap">
              <span className="label">
                <span>{t.drawer.label}</span>
                <span aria-hidden="true">{t.drawer.label}</span>
              </span>
            </span>
          </span>
          <span className="toggle-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </span>
        </button>

        <div className="drawer-layer">
          <button
            className="shade"
            type="button"
            data-drawer-backdrop
            data-drawer-close
            tabIndex={-1}
            aria-label={t.aria.closeMenu}
          />

          <aside
            className="panel"
            id="site-drawer"
            data-drawer-panel
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            aria-hidden="true"
          >
            <p className="eyebrow" id="drawer-title" data-drawer-item>
              <span className="item-reveal">{t.drawer.eyebrow}</span>
            </p>

            <nav className="link-stack" aria-label="Main menu">
              <Link className="link-row" data-drawer-item href="/">
                <span className="item-reveal">
                  <span className="item-label">{t.drawer.home}</span>
                </span>
              </Link>

              <div className="service-block" data-drawer-item>
                <div className="item-reveal">
                  <button className="link-row" type="button">
                    <span className="item-label">{t.menus.product.label}</span>
                    <span className="chevron" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="sub-list">
                  <div className="sub-list-mask">
                    <div className="sub-list-items">
                      {SERVICE_ITEMS.map((item) => (
                        <Link key={item.key} href={item.href}>
                          {t.items[item.key].label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link className="link-row" data-drawer-item href="/pricing">
                <span className="item-reveal">
                  <span className="item-label">{t.pricing}</span>
                </span>
              </Link>

              {DRAWER_LINKS.map((item) => (
                <Link key={item.key} className="link-row" data-drawer-item href={item.href}>
                  <span className="item-reveal">
                    <span className="item-label">{t.items[item.key].label}</span>
                  </span>
                </Link>
              ))}

              <Link className="link-row" data-drawer-item href={SIGNIN}>
                <span className="item-reveal">
                  <span className="item-label">{t.signIn}</span>
                </span>
              </Link>
            </nav>

            <div className="panel-line" aria-hidden="true" />

            <div className="panel-foot">
              <div className="wrapper">
                <div className="cta-reveal" data-drawer-item>
                  <span className="item-reveal">
                    <Link className="button-02 drawer-cta" href={DEMO}>
                      <span className="inner">
                        <span className="label-wrap">
                          <span className="label">{t.getPrice}</span>
                        </span>
                      </span>
                      <span className="circle">
                        <span aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
