/**
 * `/portfolio` copy — the hero and the empty state.
 *
 * Plain data, no `'use client'`. The page is a Client Component; `meta` below
 * is read by the sibling `layout.tsx`, which is a Server Component, so this
 * file must stay off the client boundary.
 *
 * THERE ARE NO CASE STUDIES IN HERE, AND THAT IS THE POINT. The page shipped
 * six of them once — invented clients ("Maison Noir", "DataPulse"), invented
 * outcomes ("3x conversion rate increase"), a 4.9-star average and 50+ projects
 * delivered — all template filler that read as client proof on a live agency
 * site. `CASE_STUDIES` in the page is empty and the empty state renders in its
 * place. Do not seed this file with example entries "for the translators":
 * placeholder work is exactly what was removed, and a fake client name is worse
 * in three languages than in one.
 *
 * WHEN REAL WORK LANDS. Each entry the page's `CaseStudy` type asks for is
 * content, and each has a rule attached: `title` is the engagement in the
 * client's own words, `client` is their real name or their sector if they are
 * under NDA, `service` is one of the five offerings in `src/lib/services.ts`,
 * `result` is a measured outcome you could show that client and have them agree
 * to it, and `description` and `tags` describe what was built. Those are claims
 * about a named third party, so a translation of one is a claim too: it goes
 * past the client, not past a model. Add the strings here at that point, keyed
 * per study, and keep `href` and any imagery in the page.
 *
 * HOW TO EDIT. `en` is the canonical base: `PortfolioDict` is derived from it,
 * so adding a key here breaks the build until every language carries it. es is
 * neutral es-419 with informal "tú", ru is formal «вы» (`plans/i18n.md`).
 */

import type { Lang } from '../markets';

const en = {
  /** Rendered by `portfolio/layout.tsx`. It promises structure, not volume —
   *  a description implying a body of published work would put the removed
   *  claim back in the one place nobody thinks to check. */
  meta: {
    title: 'Our work · Fortitudo Agency',
    description:
      "The projects we have built, with the client's name on them. We would rather show you nothing than show you someone else's work.",
  },

  hero: {
    eyebrow: 'Portfolio',
    /** The headline's second half sits in a yellow span, so the line is two
     *  strings; move words between them if the accent lands elsewhere in a
     *  translation. */
    titleLead: 'Our work,',
    titleAccent: 'with names on it.',
    body: "What we built, who we built it for, and what changed after. Only ever with the client's name on it.",
  },

  /** Shown while `CASE_STUDIES` is empty, which is now. It says what is missing
   *  and offers the next best thing rather than filling the grid. The offer to
   *  walk through "the parts that went wrong" is the load-bearing sentence —
   *  translate the candour, not the idiom. */
  empty: {
    eyebrow: 'Nothing published yet',
    title: "We'd rather show you nothing than show you someone else's work.",
    body: 'A project goes up here once the client has read it and agreed to the numbers in it. Until then, just ask. We will walk you through recent work on a call, including the parts that went wrong.',
    cta: 'Ask about recent work',
  },
};

export type PortfolioDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const PORTFOLIO: Record<Lang, PortfolioDict> = { en, es: en, ru: en };
