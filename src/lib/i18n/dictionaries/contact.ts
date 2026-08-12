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
    title: 'Talk to us · Fortitudo Agency',
    description:
      'Tell us what you want built and what it should do for you. We answer within 24 hours on working days.',
  },

  hero: {
    eyebrow: 'Contact',
    /** The headline's last two words sit in a yellow span, so the line is two
     *  strings. Translations may need the accent to fall elsewhere in the
     *  sentence; move the words between the two keys rather than adding markup. */
    titleLead: "Let's talk about",
    titleAccent: 'your project.',
    body: 'Tell us what you want built. We answer within 24 hours.',
  },

  form: {
    nameLabel: 'Name',
    emailLabel: 'Email',
    companyLabel: 'Company',
    serviceLabel: 'What you need',
    /** The empty option, selected until they pick one of the five offerings. */
    serviceUnset: 'Not sure yet',
    messageLabel: 'Message',
    messagePlaceholder: 'What do you want built, and what should it do for you?',
    submit: 'Send message',
    privacyNote: 'No spam. We answer within 24 hours.',
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
    body: 'We have it. You will hear from us within 24 hours.',
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

  /** The dashed card under the details: the same questions as the form, asked
   *  as the onboarding chat behind sign-up. */
  start: {
    title: 'Rather just start?',
    body: 'Skip the form and start your project here instead. Same questions, asked as a chat.',
    cta: 'Create an account',
  },
};

export type ContactDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, …> from the start so a missing key is a build error the
   moment a real translation is dropped in. */
export const CONTACT: Record<Lang, ContactDict> = { en, es: en, ru: en };
