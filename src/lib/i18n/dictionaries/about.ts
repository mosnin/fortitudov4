/**
 * `/about` copy, one entry per user-facing string on the page.
 *
 * Plain data, no `'use client'`, no JSX, no classNames and no hrefs — the page
 * keeps all of those. A dictionary that crosses the client boundary becomes a
 * throwing stub when a Server Component imports it (this repo shipped that bug
 * once, as 16px headings on four pages), and `/about` is a Server Component
 * that reads `meta` at module scope for its `metadata` export.
 *
 * HOW TO EDIT. `en` is the canonical base: `AboutDict` is derived from it, so
 * adding a key here breaks the build until every language carries it. Register
 * for the translations is in `plans/i18n.md` — es is neutral es-419 with
 * informal "tú", ru is formal «вы», and both carry the same plain meaning
 * rather than the same words (`copy.md`).
 */

import type { Lang } from '../markets';

const en = {
  /** Page `<title>` and meta description. Rendered by the route's `metadata`
   *  export — a page title left in English under a translated tree is the most
   *  visible miss there is, so it lives in the dictionary with the prose. */
  meta: {
    title: 'Our story · Fortitudo Agency',
    description:
      'You should know what your build costs, and how it is going. Most agencies keep both to themselves. We built Fortitudo to do the opposite.',
  },

  hero: {
    eyebrow: 'Our story',
    title: 'You should know what it costs, and how it is going.',
    body: 'Most agencies keep both of those to themselves. We built Fortitudo to do the opposite: one price, agreed up front, and a build you can watch.',
    ctaPrimary: 'Talk to us',
    ctaSecondary: 'See what we build',
  },

  problem: {
    eyebrow: 'The problem',
    /** The headline breaks over a `<br>` on wide screens; the page owns the
     *  break, so the two halves are separate strings and a translation is free
     *  to balance them differently. */
    titleLead: 'The work moved on.',
    titleRest: 'The agencies did not.',
    para1:
      'Most of a build is waiting. Vague prices. Missed dates. Calls that say nothing. Weeks of silence between updates. The actual thinking and making is a small slice of it.',
    para2:
      'Everywhere else, that waiting has been squeezed out. In agency work it has not. That gap, between what could happen and what clients actually get, is why Fortitudo exists: senior people, better tools, and a build you can watch happen.',
  },

  beliefs: {
    eyebrow: 'What we believe',
    title: 'A few things we will not move on.',
    /** Rendered in order, one card each. Order is meaning here — the fixed
     *  price is the first promise — so translations keep it. The array type
     *  does not pin the length; adding a fifth belief means adding it to every
     *  language by hand. */
    items: [
      {
        title: 'A fixed price is a promise.',
        body: 'An hourly meter means we could not work out what the job was. Working that out is the job. The price you approve is the price you pay, and it only changes if you say so.',
      },
      {
        title: 'Nothing goes out without a senior’s name on it.',
        body: 'We use AI for the repetitive parts — setup, boilerplate, the mechanical hours. It decides nothing. A senior builder checks and shapes every change before it lands. That is where the speed comes from, and where the trust lives.',
      },
      {
        title: 'You watch the build as it happens.',
        body: 'The stage you are in, the change we just made, the preview you can click — it is all on one page, all the time. No status-call theater, and nothing you have to ask for.',
      },
      {
        title: 'You own everything at launch.',
        body: 'The code, the design files, the logins. All handed over the day you go live. Nothing is locked to us, and there are no license games.',
      },
    ],
  },
};

export type AboutDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const ABOUT: Record<Lang, AboutDict> = { en, es: en, ru: en };
