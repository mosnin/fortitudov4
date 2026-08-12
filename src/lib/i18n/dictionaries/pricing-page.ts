/**
 * `/pricing` page copy, all languages — the page shell, the engagement cards,
 * the two specialist engagements, the offering list, the FAQ and the ask.
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
 *  - NEVER hardcode a number or a currency in the prose. Nothing on this page
 *    quotes money any more — see below — and the counts that remain (the stage
 *    count, the post-launch support window) interpolate as a `{token}` through
 *    `fill()` (`./pricing.ts`). A figure frozen into a Spanish sentence is a
 *    figure that silently disagrees with the English one the next time it
 *    changes.
 *
 * NO PRICES. This page used to lead with five starting figures, quote them
 * again in an offering list, and repeat two of them in the FAQ. The public
 * site does not advertise a price anywhere now: you tell us what you need and
 * we send you a fixed one. The page kept its route and its promise — a price
 * agreed before work starts, no hourly billing, no surprise invoices — and
 * every figure was cut. Do not put one back. The real amounts still live in
 * `src/lib/pricing.ts`, where the product invoices from.
 */

import type { Lang } from '../markets';

const en = {
  /** Browser tab and social preview. Says what the page is: how we price, not
   *  what anything costs. It used to quote "the price you approve is the price
   *  you pay" beside the five offerings; the promise survives, in the hero. */
  meta: {
    title: 'How pricing works · Fortitudo Agency',
    description:
      'One fixed price, agreed before we start. No hourly billing and no surprise invoices. Tell us what you need and we send you a price.',
  },

  hero: {
    eyebrow: 'Pricing',
    title: 'Fixed prices. No surprises.',
    body: 'Tell us what you need and we send you a fixed price. You get it before we start, and it does not move unless you ask it to. You can watch the work go stage by stage, and everything is yours the day it goes live.',
  },

  /** The engagement cards (components/marketing/pages/engagement-plans.tsx). */
  plans: {
    sitesHeading: 'Sites and marketing',
    appsHeading: 'Apps and automation',
    /** Sits where the amount used to, on every card. */
    quoteLine: 'One fixed price, before we start.',

    /**
     * One entry per card. `label` repeats the offering name from
     * `services.ts`; when these are translated the offering list further down
     * the page still renders the untranslated shared name, so either translate
     * both or neither — do not let a card and the list disagree.
     *
     * `figure` is the one number on the card. `{days}` = the post-launch
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
        cta: 'Contact us',
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
        cta: 'Contact us',
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
        cta: 'Contact us',
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
        cta: 'Contact us',
      },
    },
  },

  /** Consultation + ongoing support, the two engagements that are not a build. */
  specialists: {
    eyebrow: 'Two more things',
    title: 'Two more ways we can help.',
    body: 'You can hire us for advice on its own. And we can keep working on your build after it launches. Same fixed price, same page to watch it on.',
    /** The link at the foot of both cards. */
    cardCta: 'Contact us',
    consultation: {
      /** Same offering name as `services.ts` — see the note on `plans.cards`. */
      title: 'Consultation',
      scopeLine: 'Work out what to build, before you spend',
      note: 'Priced per project, and you keep the written plan',
    },
    retainer: {
      title: 'Ongoing support',
      scopeLine: 'We keep working on it after launch',
      note: 'Priced to your build. What we cover, and how fast we answer, agreed up front',
    },
    /** Rendered as: lead, space, link, full stop. */
    biggerLead: 'Running something bigger?',
    biggerLink: 'Talk to us',
  },

  howPricing: {
    eyebrow: 'How pricing works',
    title: 'Every project starts with a fixed price.',
    body: 'Tell us what you need. We write you a price up front, and it never moves without your say-so. No hourly billing, and no invoice you did not agree to. You watch the work go stage by stage on your project page.',
    /** The three steps, in order. */
    steps: [
      {
        title: 'You tell us what you need',
        body: 'One form, a few minutes. What you want built, who it is for, and when you want it live.',
      },
      {
        title: 'We send you a price',
        body: 'One number for the whole job, and what it covers written down beside it. Nothing starts until you say yes.',
      },
      {
        title: 'The price holds',
        body: 'It only changes if you ask for something we did not agree to, and we price that separately first.',
      },
    ],
    /** The row under the steps: the five offerings, each linking to the form. */
    listHeading: 'Get a price for',
    listCta: 'Contact us',
  },

  /**
   * What every engagement commits to. Each entry is a label, one figure, and a
   * line under it — three separate elements, so the figure is supplied by the
   * page rather than written into the copy. The stage count comes from
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
   * `{days}` is the post-launch support window, filled by the page. Two of
   * these answers used to carry a price token as well; both are gone with the
   * figures, and the answers say how you get a price instead of what one is.
   */
  faq: {
    eyebrow: 'Questions',
    title: 'What people ask first.',
    fixed: {
      q: 'Is the price really fixed?',
      a: 'Yes. You get a written price before anything starts. Once you approve it, that is what you pay. If you want something we did not agree to, we price that separately and you decide. No hourly billing. No surprise bills.',
    },
    from: {
      q: 'Why is there no price on this page?',
      a: 'Because a number on a page is a guess at your project. Yours depends on what you need — pages, features, and the tools it has to talk to. Tell us and we send you one price for the whole job, before we start.',
    },
    afterLaunch: {
      q: 'What happens after launch?',
      a: 'You own everything: the code, the design files, and the logins are handed over, and nothing is locked to us. Every project includes {days} days of help after launch. If you want us to keep going after that, we price that against your build.',
    },
    payments: {
      q: 'How do payments work?',
      a: 'You approve the price, pay to start, and watch each stage on your project page. Your invoice lists exactly what you approved. Changes inside what we agreed cost you nothing extra.',
    },
  },

  cta: {
    title: 'Get a fixed price for your build.',
    body: 'Tell us what you want. We price it, then you watch us build it.',
    primary: 'Tell us what you need',
    secondary: 'See what we build',
  },
};

export type PricingPageDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const PRICING_PAGE: Record<Lang, PricingPageDict> = { en, es: en, ru: en };
