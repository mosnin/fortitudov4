/**
 * `/design` page copy, all languages — the creative-direction page.
 *
 * Plain data, deliberately NO `'use client'` (see the note at the top of
 * `services-page.ts`: a dictionary that carries the directive becomes a
 * client module for every importer, and a Server Component importing a
 * non-component value from one gets a throwing stub back).
 *
 * WHAT THIS PAGE SAYS. Fortitudo sells exactly five things and design is not
 * a sixth — it is the part of all five you can feel. This copy must never
 * drift into offering "UX/UI" as a service with its own price; it names
 * creative direction, UX and UI as things already inside every engagement.
 *
 * THE FRAMES LINE IS LOAD-BEARING. The film roller on this page carries
 * deliberately blank frames (`components/filmroller/frames.ts`) because
 * nothing on the logged-out site is invented. `hero.framesNote` is where the
 * page SAYS so, in the visitor's language — remove the blank frames and this
 * line goes with them, keep them and it stays.
 *
 * HOW TO EDIT. `en` is the canonical base; `DesignPageDict` derives from it.
 * es is neutral Latin-American Spanish (es-419), informal "tú"; ru is formal
 * «вы» — when those translations land. Until then they alias English, like
 * every other dictionary here.
 */

import type { Lang } from '../markets';

const en = {
  hero: {
    eyebrow: 'Creative direction',
    /** Two lines of the display headline; the accent line renders yellow. */
    titleLead: 'We design how it works.',
    titleAccent: 'Then how it looks.',
    body: 'Every screen you get from us was decided on purpose — what it does, what you click, how it reads. UX and UI are part of every build, not an extra on the invoice.',
    /** Under the lead, mono: what the piece under the pointer actually does. */
    instructions: 'Move the pointer to steer the roller',
    /** Bottom-right hint, swapped when the canvas takes the wheel. */
    hintIdle: 'Click the floor to take the wheel',
    hintEngaged: 'Scroll zooms · + / − speed · arrows steer · Esc lets go',
    /** Readout labels, bottom-left. */
    frameLabel: 'Frame',
    speedLabel: 'Speed',
    /**
     * Why the frames are empty — stated, not hidden. The same honesty rule
     * that keeps /portfolio an empty state instead of a wall of fake logos.
     */
    framesNote:
      'The frames on this roller are blank on purpose. They hold room for client work we are allowed to show — real names, real screens, nothing staged.',
    /** The canvas's screen-reader description. */
    canvasAria:
      'Decorative interactive scene: a film roller that prints blank frames onto the floor as it moves. Move the pointer to steer it. Click to enable zoom with the scroll wheel and speed with the plus and minus keys; press Escape to release.',
  },

  craft: {
    eyebrow: 'What that means',
    title: 'Three jobs, one person answerable for all of them.',
    direction: {
      title: 'Creative direction',
      body: 'Someone has to decide how the thing should feel — what a visitor sees first, what gets left out, what the whole build is trying to say. Here that is a person with taste and a plan, deciding with you before anything gets built.',
    },
    ux: {
      title: 'UX — how it works',
      body: 'We plan what people click before we pick any colors. Every path through the product gets drawn and argued about while changing it still costs nothing. If a button is hard to find, the button moves.',
    },
    ui: {
      title: 'UI — how it looks',
      body: 'One system: the same type, the same spacing, the same rules on every screen. That discipline is why finished work reads as one thing instead of a pile of pages.',
    },
    /** The guardrail sentence — design is not a sixth offering. */
    included:
      'None of this is a line item. Design runs through all five things we build, and the fixed price you approve already includes it.',
  },

  cta: {
    title: 'Want screens people understand?',
    body: 'Tell us what you are building. You get a fixed price before we start, and every screen gets designed on purpose.',
    primary: 'Start a project',
    secondary: 'See our work',
  },
};

export type DesignPageDict = typeof en;

/* es and ru deliberately alias English until they are translated. The map is
   typed Record<Lang, DesignPageDict> from the start so a missing key is a
   build error the moment a real translation is dropped in. */
export const DESIGN_PAGE: Record<Lang, DesignPageDict> = { en, es: en, ru: en };
