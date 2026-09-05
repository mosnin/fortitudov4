/**
 * `/contact` copy, one entry per user-facing string on the page.
 *
 * Plain data, no `'use client'`. The page itself is a Client Component, but the
 * `metadata` under `meta` is read by the sibling `layout.tsx`, which is a
 * Server Component — a dictionary carrying the client directive would turn into
 * a throwing stub there.
 *
 * WHAT IS NOT HERE. `hello@fortitudo.agency` is an address, not copy: it is a
 * constant in the page and interpolates into the two failure notices through
 * `{email}` and `fill()`. Field names, validation, the `/api/leads` POST and
 * the required-field asterisk are markup and logic, and stay in the page. The
 * service options in the "What you need" select come from
 * `src/lib/services.ts`, which is the single source of truth for the five
 * offerings and is translated there or nowhere.
 *
 * HOW TO EDIT. `en` is the canonical base: `ContactDict` is derived from it, so
 * adding a key here breaks the build until every language carries it. es is
 * neutral es-419 with informal "tú", ru is formal «вы» (`plans/i18n.md`).
 */

import type { Lang } from '../markets';

const en = {
  /** Rendered by `contact/layout.tsx`, which exists because a Client Component
   *  cannot export `metadata`. Translated with the page, not after it. */
  meta: {
    title: 'Talk through your project · Fortitudo Agency',
    description:
      'Tell us what your business is ready for. We will help you work out what to build, what comes first, and what it will take.',
  },

  hero: {
    eyebrow: 'Let’s get it moving',
    /** The headline's last two words sit in a yellow span, so the line is two
     *  strings. Translations may need the accent to fall elsewhere in the
     *  sentence; move the words between the two keys rather than adding markup. */
    titleLead: 'What would make a difference to',
    titleAccent: 'your business?',
    body: 'More customers finding you. A product ready to launch. Hours back in your week. Tell us what you want to change, and we will help you work out the next step.',
  },

  form: {
    nameLabel: 'Name',
    emailLabel: 'Email',
    companyLabel: 'Company',
    serviceLabel: 'Where do you need help?',
    /** The empty option, selected until they pick one of the five offerings. */
    serviceUnset: 'Not sure yet',
    messageLabel: 'What are you trying to make happen?',
    messagePlaceholder: 'Tell us a little about your business, what is getting in the way, and what a good outcome would look like. Include a link or a target launch date if you have one.',
    submit: 'Talk through my project',
    privacyNote: 'A conversation comes first. No account or technical brief needed.',
    /** The two failure notices. The form is not cleared when either shows, so
     *  these have to give the visitor somewhere to go with what they wrote.
     *  {email} = the address, filled in the page — never hardcode it here. */
    errorSend: 'We could not send that. Please email us directly at {email}.',
    errorNetwork: 'We could not reach the server. Please email us directly at {email}.',
  },

  /** Shown in place of the form once `/api/leads` has accepted the lead. It
   *  claims a reply inside 24 hours, so it must not appear on a failed POST. */
  sent: {
    title: 'Message received.',
    body: 'Thanks for telling us about your business. We will read through your message and get back to you within 24 hours on working days to talk about the next step.',
    again: 'Send another',
  },

  /** The three rows beside the form. The email row's body is the address
   *  itself, so only its label is here. */
  details: {
    emailTitle: 'Email',
    responseTitle: 'Response time',
    responseBody: 'We answer within 24 hours on working days.',
    locationTitle: 'Where we are',
    locationBody: 'We work remotely, with clients anywhere.',
  },

  /** Reassurance beside the form. The enquiry does not require an account. */
  start: {
    title: 'You do not need to have it all figured out.',
    body: 'An idea, a problem, or a link to what you have today is enough. We can work through the rest together.',
    cta: 'Email us directly',
  },
};

export type ContactDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const CONTACT: Record<Lang, ContactDict> = { en, es: en, ru: en };
