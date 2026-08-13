/**
 * Home page copy (`/`), every user-facing string on the logged-out homepage.
 *
 * One section per key, mirroring the components that render them: the hero
 * (`components/originkit/ui/hero-21/section-25-hero.tsx`) and the eight giga
 * sections the page composes below it.
 *
 * HOW TO EDIT.
 *  - `en` (American English) is the CANONICAL BASE. `HomeDict` is derived from
 *    it, so adding a key to `en` breaks the build the moment a real `es`/`ru`
 *    object is dropped in — copy cannot silently ship untranslated.
 *  - Register, when the translations land: es is neutral Latin-American
 *    Spanish (es-419), informal "tú", no vosotros. ru is formal «вы». A
 *    translation carries the same plain meaning, not the same words
 *    (`copy.md`), and has to pass the ten-year-old test IN THAT LANGUAGE.
 *
 * WHAT DOES NOT LIVE HERE.
 *  - Numbers. Prices and counts interpolate as `{token}` through `fill()` in
 *    `./pricing.ts`, so a price change cannot leave three languages
 *    disagreeing. Never type a figure into a sentence.
 *  - Anything a translator cannot translate: icons, links, hrefs, classNames,
 *    JSX. Those stay in the components.
 *  - Strings the product already owns. Service names and descriptions come
 *    from `src/lib/services.ts`, the seven pipeline stage LABELS from
 *    `src/lib/crm.ts` — the marketing site reads the same list the client's
 *    portal does, on purpose. Only the marketing-side NOTES about each stage
 *    are here.
 *
 * NO `'use client'`, EVER. This is plain data, and a Server Component that
 * imports a non-component value out of a client module gets a throwing stub —
 * that bug already shipped once here as 16px headings on four pages.
 */

import type { Lang } from '../markets';

const en = {
  hero: {
    /** The badge above the headline: yellow tag, then the line beside it. */
    badgeTag: 'Fixed price',
    badgeText: 'The price you approve is the price you pay',
    /** Two lines, each masked and raised in turn by `KineticText`. */
    headlineLines: ['We build it.', 'You own it.'],
    lead: 'Websites, apps, AI tools, and marketing. You get a fixed price before we start, a page that shows you how it is going, and every file the day it goes live.',
    ctaPrimary: 'Start a project',
    ctaSecondary: 'See our work',
    /** Sits over the row of offering chips at the foot of the hero. */
    offeringsEyebrow: 'What we build',
  },

  stats: {
    statement:
      'No weekly status call. Open your project page and see where the work has got to, any day you like.',
    /**
     * Labels only. The three FIGURES stay in the component: they are facts the
     * codebase settles (five offerings, seven pipeline stages, total handover),
     * not prose, and they are identical in every language.
     */
    labels: ['Things we build', 'Stages you can watch', 'Yours at launch'],
  },

  offerings: {
    eyebrow: 'What we build',
    headingLines: ['Five things we build for you.'],
    lead: 'Every one has a fixed price, agreed before we start. Senior people do the work. You can watch it happen.',
    /** The link at the foot of each of the five service cards. */
    cardCta: 'Explore',
    /** The other half of that footer row, where a starting price used to sit.
     *  It links to the contact form: we quote a build before it starts, so the
     *  price is a conversation, not a number on a card. */
    cardPriceCta: 'Contact us',
    /** The sixth, dashed cell. */
    somethingElseTitle: 'Something else?',
    somethingElseDesc:
      'Moving an old site. Joining two tools together. Finishing a build someone else left. Tell us what you need.',
    somethingElseCta: 'Talk to us',
  },

  pipeline: {
    eyebrow: 'How a project runs',
    headingLines: ['Seven stages. You can see which one you’re in.'],
    lead: 'No Friday status email. We run your project on the same seven stages you see, so “where are we?” is a page you open, not a question you have to ask.',
    /**
     * What the client actually gets to see at each stage, in their own words.
     * Keyed by `CRM_STAGES` — the stage NAMES come from `src/lib/crm.ts`, so a
     * stage renamed in the product renames itself here too.
     */
    stageNotes: {
      onboarding: 'You tell us what you want. We set up your checklist and get the access we need.',
      discovery: 'We dig into it properly. Then we tell you what we found, and what it will cost.',
      design: 'You see the real screens, not a slide deck.',
      build: 'We build it. You watch the task list move. A senior builder checks every change.',
      client_review: 'Your turn. You leave your notes on the work itself.',
      launched: 'It goes live. You get the files, the logins, and notes on how it all works.',
      retained: 'If you want us to, we keep working on it after launch.',
    },
    /** The honesty caption. It is what stops the diagram reading as a real job. */
    caption: 'A drawing of the stages — not a real project',
  },

  advantage: {
    eyebrow: 'Why Fortitudo',
    headingLines: ['You deal with the people who build it.'],
    lead: 'No account manager in the middle. The senior people building your project are the ones you talk to, and the price is set before we start.',
    /** Belt one, in order. The icon and the timing of each pill stay in the component. */
    legacyPills: [
      'Meeting number four',
      'Another change fee',
      'Week-old status email',
      'A bill you did not expect',
      'Passed to a stranger',
    ],
    /** Belt two, in order. */
    fortitudoPills: [
      'A fixed price',
      'Senior builders',
      'AI on the repeat work',
      'Watch it live',
      'Checked by a person',
      'Launch',
    ],
    legacyTitle: 'Typical agencies',
    legacyDesc:
      'Calls you did not need. Change fees you did not expect. An account manager sitting between you and whoever is actually building. The bill never matches the quote.',
    fortitudoTitle: 'Fortitudo',
    fortitudoDesc:
      'One senior team, and one page to watch them on. We use AI for the repetitive parts. A person checks every change before it counts.',
  },

  /**
   * The proof band. It ships EMPTY on purpose — `TESTIMONIALS` and `METRICS`
   * in the component are empty arrays and stay that way until a real client
   * agrees to be quoted by name. The slot strings below describe what belongs
   * in each empty card; they are copy an editor reads, so they are translated
   * like any other line. Do not fill them in with an invented quote.
   */
  testimonials: {
    eyebrow: 'Proof',
    heading: 'What clients say.',
    /** Shown once there is at least one published quote. */
    leadWithQuotes: 'In their own words, with their names on them.',
    /** Shown while there are none — which is today. */
    leadEmpty:
      'Nothing here yet. A quote goes up once the client has read it back and agreed to put their name on it.',
    cta: 'Start a project',
    slots: [
      'A client quote goes here — what they came to us with, and what changed.',
      'The strongest one you have. This card is the one people read first.',
      'A quote from a different kind of project, so the three do not all sound alike.',
    ],
    /** {n} = the slot's two-digit position. */
    slotLabel: 'Slot {n}',
    slotAttribution: 'Name, title, company',
    metricSlots: ['A number you can source', 'A number you can source', 'A number you can source'],
    /** Star-row alternative text. {rating} = the rating a client actually gave. */
    ratingLabel: '{rating} out of 5',
    noRatingLabel: 'No rating given',
  },

  complexity: {
    eyebrow: 'Big projects too',
    /** Two lines: the break between them is drawn by the component, above sm. */
    headingLine1: 'Nothing about your project',
    headingLine2: 'gets lost.',
    lead: 'One team, one way of working. Every job has a name on it, every change is written down, and you can see all of it. That holds for a one-page site and for software we build over years.',
    cta: 'See how we work',
    /** Three cards, in order. Each keeps its icon in the component. */
    columns: [
      {
        title: 'The right person gets it',
        desc: 'Your project goes to the senior who does that kind of work. We write down who took it and why.',
      },
      {
        title: 'Nothing sits in a queue',
        desc: 'We can see every job in progress and every one waiting. It comes from the work itself, not from a Monday meeting.',
      },
      {
        title: 'Everything is written down',
        desc: 'Who did what, what changed, and who said yes to it. You can go back and read any of it.',
      },
    ],
  },

  faq: {
    eyebrow: 'FAQ',
    heading: 'Questions, answered.',
    /** The sentence under the heading; the link label is the next key. */
    helpText: "Can't find what you're looking for?",
    helpLink: 'Get in touch',
    /**
     * The first answer used to list all five starting prices, filled from the
     * checkout table (`src/lib/pricing.ts`) as `{token}`s. The site no longer
     * advertises a price anywhere: you tell us what you need and we send you a
     * fixed one. The promise is the same, the figures are gone, and no answer
     * here carries a token any more.
     */
    items: [
      {
        q: 'What does it cost?',
        a: 'Tell us what you need and we send you a fixed price. You see it before you pay anything, and it does not move once you approve it. No hourly billing. No surprise bills.',
      },
      {
        q: 'How soon can I start?',
        a: 'Today. Pick what you want, answer a few questions about it, check your price, and pay. Your project page opens straight away, and we start digging into the work the next working day.',
      },
      {
        q: 'Do you use AI?',
        a: 'Yes, on the dull parts — setup, boilerplate, test code, and the small repeated changes. It decides nothing. A senior builder checks and shapes every change before it lands, so the judgement calls are still made by people.',
      },
      {
        q: 'How do I see how it is going?',
        a: 'Your project page shows which of the seven stages you are in, and inside the build stage it shows the six steps we work through: Discovery, Design, Development, Testing, Review, and Launch. You can message us, send files, and ask for changes in the same place.',
      },
      {
        q: 'What if I want changes?',
        a: 'Ask for them on your project page. Changes inside what we agreed to build cost you nothing. If you want something bigger than that, we price it first and you decide.',
      },
      {
        q: 'Who owns it at the end?',
        a: 'You do. All of it. The code, the design files, the campaign work, and the logins are handed to you at launch. Nothing is locked to us.',
      },
    ],
  },

  /**
   * The creative-direction section — the interactive film roller
   * (`film-roller-stage.tsx`) with the design pitch laid over it.
   *
   * `framesNote` is load-bearing: the roller's frames are DELIBERATELY BLANK
   * (`components/filmroller/frames.ts`) because nothing on this site is
   * invented, and this line is where the page says so. Remove the blank
   * frames and it goes with them; keep them and it stays.
   */
  design: {
    eyebrow: 'Creative direction',
    /** Two headline lines; the accent line renders yellow. */
    titleLead: 'We design how it works.',
    titleAccent: 'Then how it looks.',
    body: 'Every screen you get from us was decided on purpose — what it does, what you click, how it reads. UX and UI are part of every build, not an extra on the invoice.',
    /** Mono line under the lead: what the piece under the pointer does. */
    instructions: 'Move the pointer to steer the roller',
    /** Bottom-right hint, swapped when the canvas takes the wheel. */
    hintIdle: 'Click the floor to take the wheel',
    hintEngaged: 'Scroll zooms · + / − speed · arrows steer · Esc lets go',
    frameLabel: 'Frame',
    speedLabel: 'Speed',
    framesNote:
      'The frames on this roller are blank on purpose. They hold room for client work we are allowed to show — real names, real screens, nothing staged.',
    canvasAria:
      'Decorative interactive scene: a film roller that prints blank frames onto the floor as it moves. Move the pointer to steer it. Click to enable zoom with the scroll wheel and speed with the plus and minus keys; press Escape to release.',
  },

  cta: {
    eyebrow: 'Get a price',
    /** The fixed first line. */
    headingLead: 'Ready to build',
    /** The second line flips through these, in order. Punctuation stays inside each. */
    headingFlips: ['something real?', 'your website?', 'your software?', 'your next launch?'],
    lead: 'Tell us what you want. We give you a fixed price, then you watch us build it. You own everything the day it goes live.',
    button: 'Talk to us',
  },
};

export type HomeDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, HomeDict> from the start, so the day a real translation
   is dropped in, a missing key is a build error rather than a blank on a
   shipped page. */
export const HOME: Record<Lang, HomeDict> = { en, es: en, ru: en };
