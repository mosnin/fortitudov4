/**
 * Site chrome copy — the header nav and the footer. Every string a visitor
 * reads in `src/components/marketing/giga/header.tsx` and `footer.tsx` lives
 * here and nowhere else.
 *
 * PLAIN DATA, NO `'use client'`. This file is imported by two client
 * components today and will be imported by server components the moment the
 * `[lang]` trees land. A dictionary that sits behind the client boundary turns
 * into a throwing stub when a Server Component reads a non-component value out
 * of it — that bug already shipped once here as 16px headings on four pages.
 * Keep this module free of components, hooks, and the `'use client'` directive.
 *
 * STRINGS ONLY. No JSX, no icons, no classNames, and no hrefs. A URL is not
 * copy: `/services#websites` is the same route in Spanish, so it stays in the
 * component next to the icon it belongs to. What lives here is only what a
 * translator would rewrite.
 *
 * HOW THE HEADER'S MEGA-MENU LINKS STAY LINED UP. The two dropdowns pair a
 * label and a description (here) with an icon and an href (in the component).
 * They are matched BY KEY, not by array index — the component's item arrays
 * hold `{ key, icon, href }` and read their text as `nav.items[key]`. `key` is
 * typed `keyof ChromeDict['nav']['items']`, so an item whose key is missing
 * from this file is a compile error, and a key renamed here breaks the build
 * rather than silently rendering an empty link. Order lives with the component
 * (it is layout, not copy); the keys are flat across both menus and must stay
 * unique.
 *
 * HOW TO EDIT.
 *  - `en` (American English) is the CANONICAL BASE. `ChromeDict` is derived
 *    from it, so adding a key to `en` breaks the build the moment a real `es`
 *    or `ru` object exists without it. Edit `en` first.
 *  - Register, when the translations land: es is neutral Latin-American
 *    Spanish (es-419), informal "tú", no vosotros. ru is formal «вы». A
 *    translation carries the same plain meaning, not the same words
 *    (`copy.md`).
 *  - Never freeze a runtime value into a string. The footer's copyright year
 *    interpolates as `{year}` and is filled where it is rendered.
 */

import type { Lang } from '../markets';

const en = {
  nav: {
    /**
     * The two dropdowns. The `product` KEY is inherited — it is wired through
     * `MenuKey` and the header's open/close state — but nobody reads a key,
     * and the visible label is "What we build": we are an agency, and the menu
     * lists five things we build for someone else, not a thing we sell seats
     * in. Rename the label freely; leave the key alone.
     */
    menus: {
      product: {
        label: 'What we build',
        featured: {
          eyebrow: 'WHAT WE BUILD',
          title: 'Five things we build for you.',
          body: 'Websites, apps, AI tools, advice, and marketing. Every one has a fixed price, agreed before we start.',
          cta: 'See what we build',
        },
      },
      company: {
        label: 'Company',
        featured: {
          eyebrow: 'OUR STORY',
          title: 'Why we work the way we do.',
          body: 'Senior people, a fixed price, and a project you can watch. On every job we take.',
          cta: 'Read our story',
        },
      },
    },

    /**
     * Every mega-menu link's text, keyed. The first five sit under `product`
     * and the last four under `company`; which menu a key belongs to is the
     * component's business, because that is where the order and the icons are.
     * Keys are shared across both menus and must stay unique.
     */
    items: {
      websites: { label: 'Websites', desc: 'A site people can find and buy from' },
      softwareSolutions: {
        label: 'Software Solutions',
        desc: 'An app your team will actually use',
      },
      aiSolutions: { label: 'AI Solutions', desc: 'Hand the repeat work to a computer' },
      consultation: { label: 'Consultation', desc: 'Know what to build before you spend' },
      digitalMarketing: {
        label: 'Digital Marketing',
        desc: 'Turn more of your visitors into customers',
      },
      about: { label: 'About', desc: 'How we work, and why' },
      portfolio: { label: 'Portfolio', desc: 'Work we can show you' },
      faq: { label: 'FAQ', desc: 'The questions we get asked most' },
      contact: { label: 'Contact', desc: 'Tell us what you want built' },
    },

    /** The plain link beside the two dropdowns, desktop and mobile. */
    pricing: 'Pricing',

    /** The right-hand cluster: the quiet link and the one yellow surface. */
    signIn: 'Sign in',
    getPrice: 'Get a price',

    /**
     * Screen-reader-only names. They are read aloud, so they are copy and get
     * translated with everything else. The brand wordmark itself is a name,
     * not copy, and stays in the component.
     */
    aria: {
      home: 'Fortitudo home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
  },

  footer: {
    /** The oversized display headline, two lines, second one dimmed. */
    headline: {
      line1: "Tell us what you're building.",
      line2: "We'll tell you what it costs.",
    },

    /** The three actions. The email address itself is not copy — it is a
     *  constant in the component, beside the mail icon it belongs to. */
    email: { eyebrow: 'Get started' },
    call: { eyebrow: 'Schedule a call', cta: 'Book a meeting' },
    /** `social` renders only once there are real handles to link; until then
     *  the third slot is `project`. Both are kept so neither goes stale. */
    social: { eyebrow: 'Follow along' },
    project: { eyebrow: 'Or skip the call', cta: 'Start a project' },

    /** The two link columns. Labels are keyed; the hrefs stay in the
     *  component, which also fixes the order. */
    exploreEyebrow: 'Explore',
    explore: {
      work: 'Our work',
      services: 'What we do',
      pricing: 'Pricing',
      about: 'About',
      faq: 'FAQ',
      signIn: 'Sign in',
    },
    finePrintEyebrow: 'Fine print',
    finePrint: {
      terms: 'Terms of Service',
      privacy: 'Privacy Notice',
      contact: 'Contact',
    },

    /**
     * The legal line. `{year}` is filled at render time from the clock — a
     * year frozen into this file is wrong every January, and a stale copyright
     * date is the kind of thing a visitor reads as "nobody is home".
     */
    copyright: '© {year} Fortitudo Agency — we work remotely, with clients anywhere.',
  },
};

export type ChromeDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, ChromeDict> from the start so a missing key is a build
   error the moment a real translation is dropped in. */
export const CHROME: Record<Lang, ChromeDict> = { en, es: en, ru: en };
