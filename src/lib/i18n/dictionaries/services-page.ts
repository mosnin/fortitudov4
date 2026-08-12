/**
 * `/services` page copy, all languages.
 *
 * Plain data — deliberately NO `'use client'`. `src/app/(marketing)/services/
 * page.tsx` is a client component today, but a dictionary that carries the
 * directive becomes a client module for every importer, and a Server Component
 * importing a non-component value from a client module gets a throwing stub
 * back (see the note at the top of `../../../components/marketing/giga/
 * tokens.ts` — that bug shipped four pages with 16px headings). Dictionaries
 * stay off the client boundary.
 *
 * HOW TO EDIT.
 *  - `en` (American English) is the CANONICAL BASE. `ServicesPageDict` is
 *    derived from it, so adding a key to `en` breaks the build until every
 *    language carries it. Edit `en` first, then bring es and ru with it.
 *  - Register: es is neutral Latin-American Spanish (es-419), informal "tú",
 *    no vosotros, no Castilian idiom. ru is formal «вы». A translation carries
 *    the same plain meaning, not the same words (`copy.md`), and has to pass
 *    the ten-year-old test in its own language rather than in English first.
 *  - Never hardcode a number in the prose. Counts interpolate as `{token}`
 *    through `fill()` (`./pricing.ts`), so the figure lives in exactly one
 *    place and three languages cannot end up disagreeing about it.
 *
 * WHAT IS NOT HERE. The five offerings' own names, descriptions and feature
 * lists come from `src/lib/services.ts` and are shared with the product and
 * the admin side, so they are not translatable from here. `{service}` in
 * `startWith` is filled with that shared name.
 */

import type { Lang } from '../markets';

const en = {
  hero: {
    eyebrow: 'What we build',
    /** Rendered as two spans: the accent half is the yellow one. */
    titleLead: 'Five things we build.',
    titleAccent: 'Pick the one you need.',
    body: 'Tell us which one you need and we send you a fixed price. You get it before we start, and it does not move. Then we do the rest.',
  },

  /** Repeated once per offering band. `{service}` = the name from services.ts. */
  offering: {
    startWith: 'Start with {service}',
    includedHeading: 'Included either way',
    /** The chip above each offering's name, where its starting price used to
     *  be. It links to the contact form — we quote a build before it starts,
     *  so the price is something we send you, not something on a card. */
    priceCta: 'Contact us',
  },

  /**
   * The floor every engagement clears, whichever of the five you buy — the
   * same list under all five bands, which is the point.
   *
   * `{days}` = the post-launch support window. The figure is NOT written here:
   * three pages cite it and none of them owns it (see the report on this
   * refactor); the page supplies it so a change lands everywhere at once.
   */
  alwaysIncluded: {
    discovery: 'We work out what you need',
    design: 'Screens designed for you',
    build: 'Built, and joined to your other tools',
    testing: 'Tested before it goes out',
    launch: 'We put it live',
    support: '{days} days of help after launch',
  },

  notSure: {
    title: 'Not sure which one you need?',
    body: 'Tell us what you are trying to do and we will say which one fits — including when the honest answer is “not yet”.',
    ask: 'Ask us which one',
    pricing: 'How pricing works',
  },
};

export type ServicesPageDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const SERVICES_PAGE: Record<Lang, ServicesPageDict> = { en, es: en, ru: en };
