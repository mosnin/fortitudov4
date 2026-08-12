/**
 * `/pricing` page copy, all languages — the page shell, the engagement cards,
 * the two specialist engagements, the price-list band, the FAQ and the ask.
 *
 * NOT to be confused with `./pricing.ts`, which despite the name is not a
 * pricing-PAGE dictionary: it holds the one currency-disclosure line and the
 * `fill()` helper, and its own header explains the inherited name. This file
 * is the page.
 *
 * Plain data — deliberately NO `'use client'`. `PricingContent` is a Server
 * Component and `EngagementPlans` is a client one, and both import this. A
 * Server Component that imports a non-component value from a client module
 * gets a throwing stub back (see the note at the top of
 * `../../../components/marketing/giga/tokens.ts` — that bug shipped four pages
 * with 16px headings). Dictionaries stay off the client boundary.
 *
 * HOW TO EDIT.
 *  - `en` (American English) is the CANONICAL BASE. `PricingPageDict` is
 *    derived from it, so adding a key to `en` breaks the build until every
 *    language carries it. Edit `en` first, then bring es and ru with it.
 *  - Register: es is neutral Latin-American Spanish (es-419), informal "tú",
 *    no vosotros, no Castilian idiom. ru is formal «вы». A translation carries
 *    the same plain meaning, not the same words (`copy.md`).
 *  - NEVER hardcode a number or a currency in the prose. This is the money
 *    surface, so the rule does real work: every price, day count and stage
 *    count interpolates as a `{token}` through `fill()` (`./pricing.ts`) or
 *    through `<PriceText>`, which fills price tokens with the visitor's
 *    localized amount. A price frozen into a Spanish sentence is a price that
 *    silently disagrees with the English one the next time it changes.
 *
 * WHAT IS NOT HERE. Amounts (they live in `src/lib/services.ts` /
 * `src/lib/pricing.ts` and reach the page as `{token}` fills), hrefs, and the
 * service names in the price list — that list renders `services.ts` directly,
 * because it is the same source the product and checkout price from.
 */

import type { Lang } from '../markets';

const en = {
  /** Browser tab and social preview. Enumerates the five offerings and
   *  nothing else. */
  meta: {
    title: 'Pricing · Fortitudo Agency',
    description:
      'Websites, Software Solutions, AI Solutions, Consultation and Digital Marketing. You get a fixed price before we start. The price you approve is the price you pay.',
  },

  hero: {
    eyebrow: 'Pricing',
    title: 'Fixed prices. No surprises.',
    body: 'You get a price before we start, and it does not move. You can watch the work go stage by stage. Everything is yours the day it goes live.',
  },

  /** The engagement cards (components/marketing/pages/engagement-plans.tsx). */
  plans: {
    sitesHeading: 'Sites and marketing',
    appsHeading: 'Apps and automation',
    /** Sits beside the amount, which is rendered separately. */
    perProject: '/ project',
    startingNote: 'starting price — your own fixed price comes before we start',

    /**
     * One entry per card. `label` repeats the offering name from
     * `services.ts`; when these are translated the price list further down the
     * page still renders the untranslated shared name, so either translate
     * both or neither — do not let a card and the list disagree.
     *
     * `figure` is the one big number on the card. `{days}` = the post-launch
     * support window, supplied by the page so the figure lives in one place;
     * a `figure` with no token (Digital Marketing's "Monthly") passes through
     * `fill()` untouched.
     */
    cards: {
      websites: {
        label: 'Websites',
        scopeLine: 'For sites and online shops',
        blurb: 'A site people can find, and buy from. We design it, build it, and put it live.',
        figure: '{days} days',
        figureLabel: 'of help after launch, included',
        subLine: '+changes inside what we agreed to build',
        highlights: [
          'Designed and built for you',
          'A shop and a checkout',
          'Built so Google can find it',
          'See who visits',
        ],
        cta: 'Start a website',
      },
      digital_marketing: {
        label: 'Digital Marketing',
        scopeLine: 'Monthly — pages, ads and emails',
        blurb:
          'More of the people who find you turn into customers. We run the pages, the ads, and the follow-ups.',
        figure: 'Monthly',
        figureLabel: 'we keep working on it, billed monthly',
        subLine: '+we keep testing and improving it',
        highlights: [
          'Pages built to sell',
          'Emails and texts that follow up',
          'We test what works',
          'You see the numbers',
        ],
        cta: 'Start marketing',
      },
      software_solutions: {
        label: 'Software Solutions',
        scopeLine: 'For apps and internal tools',
        blurb:
          'An app your team will actually use. Portals, platforms, and the tools you run the place on.',
        figure: '{days} days',
        figureLabel: 'of help after launch, included',
        subLine: '+changes inside what we agreed to build',
        highlights: [
          'Planned before it is built',
          'Screens made for your team',
          'Logins and data, handled',
          'Launched and supported',
        ],
        cta: 'Get a price for my build',
      },
      ai_solutions: {
        label: 'AI Solutions',
        scopeLine: 'For work you do over and over',
        blurb:
          'Hand the repetitive jobs to a computer. Your team stops doing them by hand and gets the time back.',
        figure: '{days} days',
        figureLabel: 'of help after launch, included',
        subLine: '+changes inside what we agreed to build',
        highlights: [
          'AI that does a job for you',
          'The repeat steps, automatic',
          'Your data moved for you',
          'Runs on the tools you already use',
        ],
        cta: 'Get a price for my AI',
      },
    },
  },

  /** Consultation + ongoing support, the two engagements that are not a build. */
  specialists: {
    eyebrow: 'Two more things',
    title: 'Two more ways we can help.',
    body: 'You can hire us for advice on its own. And we can keep working on your build after it launches. Same fixed price, same page to watch it on.',
    consultation: {
      /** Same offering name as `services.ts` — see the note on `plans.cards`. */
      title: 'Consultation',
      scopeLine: 'Work out what to build, before you spend',
      /** LEADING SPACE IS DELIBERATE: this sits directly after the amount. */
      unit: ' / project, starting',
      note: '+ a written plan you keep',
    },
    retainer: {
      title: 'Ongoing support',
      scopeLine: 'We keep working on it after launch',
      /** Stands in for an amount — a retainer is priced to the build. */
      figure: 'Custom',
      /** LEADING SPACE IS DELIBERATE: this sits directly after the figure. */
      unit: ' / month, priced to your build',
      note: '+ what we cover, and how fast we answer, agreed up front',
    },
    /** Rendered as: lead, space, link, full stop. */
    biggerLead: 'Running something bigger?',
    biggerLink: 'Talk to us',
  },

  howPricing: {
    eyebrow: 'How pricing works',
    title: 'Every project starts with a fixed price.',
    body: 'Pick what you need. We write you a price up front, and it never moves without your say-so. You watch the work go stage by stage on your project page. Starting prices are below.',
    /** TRAILING SPACE IS DELIBERATE: the amount is rendered right after it. */
    fromPrefix: 'from ',
  },

  /**
   * What every engagement commits to. Each entry is a label, one big figure,
   * and a line under it — three separate elements, so the figure is supplied
   * by the page rather than written into the copy. The stage count comes from
   * `projectPhaseNames` in services.ts (the same stages the dashboard tracker
   * and the FAQ name) and the support window from the always-included list on
   * /services; "Included" is a word, not a number, so it lives here.
   */
  commitments: {
    eyebrow: 'What every project includes',
    phases: { label: 'Watch it live', line: 'stages, from start to launch' },
    revisions: {
      label: 'Changes',
      figure: 'Included',
      line: 'rounds are set in the price you approve',
    },
    support: { label: 'Help after launch', line: 'days with every project' },
  },

  /**
   * The four questions people ask before they commit.
   *
   * `{websites}` and `{software}` are USD starting prices filled by
   * `<PriceText>` with the visitor's display currency; `{days}` is the
   * post-launch support window, filled by the page. The price tokens are named
   * for the offering they resolve to — they were `validate` and `scale`, the
   * source template's plan tiers, which we do not sell.
   */
  faq: {
    eyebrow: 'Questions',
    title: 'What people ask first.',
    fixed: {
      q: 'Is the price really fixed?',
      a: 'Yes. You get a written price before anything starts. Once you approve it, that is what you pay. If you want something we did not agree to, we price that separately and you decide. No hourly billing. No surprise bills.',
    },
    from: {
      q: 'What does "from {websites}" mean?',
      a: 'It is the price for the simplest version. Your own price depends on how much you need — pages, features, and the tools it has to talk to — and it is fixed before we start.',
    },
    afterLaunch: {
      q: 'What happens after launch?',
      a: 'You own everything: the code, the design files, and the logins are handed over, and nothing is locked to us. Every project includes {days} days of help after launch. If you want us to keep going after that, we price that against your build.',
    },
    payments: {
      q: 'How do payments work?',
      a: 'You approve the price, pay to start, and watch each stage on your project page — a software build, for example, starts at {software}. Your invoice lists exactly what you approved. Changes inside what we agreed cost you nothing extra.',
    },
  },

  cta: {
    title: 'Get a fixed price for your build.',
    body: 'Tell us what you want. We price it, then you watch us build it.',
    primary: 'Start your project',
    secondary: 'Talk to us',
  },
};

export type PricingPageDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const PRICING_PAGE: Record<Lang, PricingPageDict> = { en, es: en, ru: en };
