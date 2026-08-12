/**
 * `/faq` copy — the four category headings and the sixteen questions.
 *
 * Plain data, no `'use client'`. The page is a Client Component; `meta` below
 * is read by the sibling `layout.tsx`, which is a Server Component, so this
 * file must stay off the client boundary.
 *
 * Named `faq-page.ts` rather than `faq.ts` because it is the whole page, not a
 * reusable FAQ block — nothing else on the site renders these answers.
 *
 * WHAT THE ANSWERS ARE ALLOWED TO SAY. Every number here traces to
 * `src/lib/services.ts`, `src/lib/crm.ts` or the terms of service. The answers
 * that quoted plan-tier revision allowances and a 7–90 day support window were
 * describing a product Fortitudo does not sell, and they were removed rather
 * than softened. A translation carries the same commitment or it is wrong, so
 * do not round "30 days" or generalise "within 24 hours" in another language.
 *
 * HOW TO EDIT. `en` is the canonical base: `FaqDict` is derived from it, so
 * adding a key here breaks the build until every language carries it. es is
 * neutral es-419 with informal "tú", ru is formal «вы» (`plans/i18n.md`), and
 * both have to pass the ten-year-old test in that language (`copy.md`).
 */

import type { Lang } from '../markets';

const en = {
  /** Rendered by `faq/layout.tsx`. The description names the four category
   *  headings below, in order — keep the two in step when either changes. */
  meta: {
    title: 'Questions · Fortitudo Agency',
    description:
      'What people ask before they hire us: getting started, price and payment, how your project runs, and the tech we build on.',
  },

  hero: {
    eyebrow: 'FAQ',
    /** The headline's last word sits in a yellow span, so the line is two
     *  strings; move words between them if the accent lands elsewhere in a
     *  translation. */
    titleLead: 'Frequently asked',
    titleAccent: 'questions.',
    body: "The things people ask us before they start. Can't find yours? Send us a note and we will answer it.",
  },

  /** Rendered in order, one accordion per category. Order is the order a buyer
   *  meets them in — before they start, at the price, during the build, and
   *  then the technical questions — so translations keep it. */
  categories: [
    {
      category: 'Getting started',
      questions: [
        {
          q: 'How does it work?',
          a: 'Pick what you need. Make an account. Answer a few questions about your project. Pay. Your project page opens, and you can see every stage of the build from there.',
        },
        {
          q: 'How long does it take?',
          a: 'It depends what you are building — a marketing site is not the same job as an app or an AI build. We work out your dates along with your price, and you see both before you agree to anything.',
        },
        {
          q: 'What do you need from me?',
          a: 'What your business does, who you sell to, what you want the thing to do, and your logo and brand files if you have them. The more you tell us, the closer the first version will be.',
        },
        {
          q: 'What if I do not know what I need yet?',
          a: 'That is normal. The first stage is us working it out with you. You can also send us a note first, and we will help you decide before you pay anything.',
        },
      ],
    },
    {
      category: 'Price & payment',
      questions: [
        {
          q: 'How can I pay?',
          a: 'Through Creem.io. It takes all the major credit and debit cards, and some digital wallets.',
        },
        {
          q: 'Are there any hidden fees?',
          a: 'No. The price you see before you pay is the price you pay. If you want something outside what we agreed to build, we price that first and you decide.',
        },
        {
          q: 'Do you offer refunds?',
          a: 'If you do not like what we made, we fix it through the revision rounds in your project. Fees are not refundable unless we have agreed otherwise in writing. The full wording is in our terms of service.',
        },
        {
          q: 'Can I pay in parts?',
          a: 'Payment is due before work starts, as our terms of service set out. For a bigger build, talk to us before you approve the price.',
        },
      ],
    },
    {
      category: 'Running your project',
      questions: [
        {
          q: 'How do I see how it is going?',
          a: 'Your project page shows the stage you are in, a bit like tracking a food delivery. There are seven stages from start to launch, and inside the build we work through six steps: Discovery, Design, Development, Testing, Review, and Launch. It moves as we work.',
        },
        {
          q: 'How many changes do I get?',
          a: 'The rounds are written into what you approve before we start. Changes inside that cost you nothing extra. Ask for them on your project page.',
        },
        {
          q: 'Can I send you files?',
          a: 'Yes. Your project page has a place to upload logos, photos, text, and anything else we need.',
        },
        {
          q: 'How do I talk to you?',
          a: 'There is a message box on your project page. You write there, we answer there. No email chains, no Slack channels.',
        },
      ],
    },
    {
      category: 'The tech',
      questions: [
        {
          q: 'What is it built with?',
          a: 'Next.js, React, TypeScript and Tailwind CSS, plus whatever your project needs behind them. All of it is standard, so another team could pick it up later.',
        },
        {
          q: 'Do I own it?',
          a: 'Yes. Once the work is done and paid for, the code, the designs, and the files we made are all yours.',
        },
        {
          q: 'Do you host it?',
          a: 'We can put it wherever you want — Vercel, AWS, or somewhere else — or tell you what suits your project. Hosting is billed by them, not by us.',
        },
        {
          q: 'What happens after launch?',
          a: 'Every project comes with 30 days of help after launch. If you want us to keep working on it after that, we agree that separately.',
        },
      ],
    },
  ],

  /** The black band under the accordions, for the question nobody answered. */
  still: {
    title: 'Still have questions?',
    body: 'Send us a note. We answer within 24 hours.',
    cta: 'Contact us',
  },
};

export type FaqDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const FAQ: Record<Lang, FaqDict> = { en, es: en, ru: en };
