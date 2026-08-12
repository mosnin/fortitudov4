'use client';

/**
 * PinboardCta — the closing ask, as a pinboard.
 *
 * Ported from the OriginKit `cta-01` drop: a plate floating on a ruled board
 * with four notes pinned around it, which peel and drag. The interaction is
 * theirs and is untouched — `StickerDrag` still deforms each note on a 32 x 32
 * WebGL mesh, still tilts it by pointer velocity, still lifts the note being
 * dragged above its siblings with an incrementing z-index, and still settles it
 * back down on release. What changed is the skin and the words.
 *
 * ── What the drop asked for and did not get ────────────────────────────────
 *
 * It asked for a waitlist. We do not have one, and a form that collects an
 * address for a list that does not exist is the same lie as a contact form that
 * says "Message sent!" and drops the message — a bug this site has already had
 * once. The row is a link to `/contact` instead, which is the real place we
 * take a brief, and it makes the section a closing ask rather than a signup.
 *
 * It also asked for four notes carrying quotes from people who do not exist,
 * and for a 2,500-strong count of early adopters. Both are gone: the notes now
 * carry the four questions we would ask you anyway, which is copy rather than
 * proof, and there is no number on the section at all.
 *
 * ── Colour and type ───────────────────────────────────────────────────────
 *
 * Yellow paper on a charcoal board, and nothing else. Yellow is a surface here
 * and every mark on it is `--fx-on-yellow`; the board, the pin heads and the
 * plate are charcoal; the rules are `--fx-hairline`. The notes are painted into
 * a canvas (see `sticker-note`), which cannot resolve `var()`, so it reads the
 * three tokens off the DOM at mount rather than holding copies of them.
 *
 * One family, `var(--font-title)`, for the headline and for the handwriting.
 * The drop's Playfair and Manrope are gone with the stylesheet that declared
 * them; there is no serif on this surface, and the note's handwritten reading
 * comes from the turn of the paper and its ruled lines instead.
 *
 * The section carries the only yellow CTA on whatever page it lands on, and the
 * paper is the same yellow on purpose — the button is made of the thing the
 * notes are made of, so pressing it reads as adding a note of your own.
 *
 * ── Height, kept from the drop, because the reasoning is right ─────────────
 *
 * The board's height is STATED rather than filled. Pinned to the viewport it
 * stretches: on a tall monitor the notes end hundreds of pixels away from a
 * plate they are supposed to be crowding, and on a 4K screen at 100% the
 * section reads as four stickers marooned around a small island. The height is
 * the composition here, not a container, so it is a number and it is left
 * alone. Our three are smaller than Figma's (874 / 1133 / 617) because our
 * `ipad:` and `desktop-sm:` breakpoints are 48rem and 64rem rather than the
 * frame widths those numbers were drawn at.
 *
 * The rules run on the SECTION, not the board, so the lattice reaches all four
 * edges of the screen: the page is the pinboard, and the board is only the
 * arrangement on it. Both are centred, so the rules stay in phase with the
 * plate at any width.
 *
 * There is no `z-*` on the note wrappers, and that is load-bearing. The engine
 * lifts the note being dragged by writing an incrementing z-index onto its own
 * container; a z-index on the wrapper would make it a stacking context and trap
 * that value inside it. Left at `auto` they paint in DOM order, above the
 * `z-0` plate, and jump clear of everything on grab.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 *
 * `prefers-reduced-motion` drops the peel, the lift, the tilt and the shadow
 * growth. It does NOT drop the drag: moving a note is the visitor moving a
 * thing under their own pointer, which is the opposite of the page animating at
 * them, and taking it away would remove the section's only interaction rather
 * than its motion.
 *
 * ── The missing sparkle ───────────────────────────────────────────────────
 *
 * The drop drew a sparkle on each of the plate's four corners from
 * `/originkit/cta-01/sparkle.svg`. That file never downloaded, and no
 * replacement has been drawn or substituted — it is simply not in the
 * composition. It was decoration on the corners of a rectangle that the ruled
 * lattice already marks, so nothing is missing from the reading of the section
 * and there is no empty slot to label.
 */

import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import type { Lang } from '@/lib/i18n/markets';
import { StickerNote } from '@/components/originkit/ui/cta-01/sticker-note';
import { BlurRise, Eyebrow, PillPrimary, Serif } from './primitives';
import { DISPLAY_XS, EYEBROW_TEXT, LEAD, MONO_STYLE, SECTION_Y_TIGHT } from './tokens';

/**
 * This section's words.
 *
 * Deliberately local and English-only. Every other section reads its copy from
 * `src/lib/i18n/dictionaries/`, and this belongs there too — it is held here
 * only because that directory is mid-refactor. TO EXTRACT: move `COPY` into the
 * home dictionary under `pinboardCta` and take `lang` off the shelf below.
 */
const COPY = {
  eyebrow: 'The board',
  heading: 'Write it down. We build it.',
  lead: 'Every project starts as a note like these. Tell us what you want, and we come back with what it costs and how long it takes.',
  cta: 'Tell us what you need',
  hint: 'Drag the notes.',
};

/**
 * The four notes: the questions we would ask you anyway.
 *
 * They are our copy, not testimonials. The drop's notes carried invented
 * quotes; a note on this board asks the visitor something instead, which is the
 * one kind of text that can sit on a pinboard without pretending to be proof.
 *
 * Placement anchors to the BOARD's edges rather than the plate's, which is what
 * the drop does at every frame and why several notes hang off the side. The
 * vertical offsets differ per note on purpose — four notes at the same height
 * read as a grid rather than as things someone pinned up.
 *
 * `rotate` is baked into the artwork, not applied to the element: a CSS rotate
 * on the host would turn the drag maths with it.
 */
const NOTES = [
  {
    text: 'What are you trying to fix?',
    rotate: -5,
    className:
      'top-[4px] left-[-30px] w-[168px] ipad:top-[8px] ipad:left-[-24px] ipad:w-[224px] desktop-sm:top-[40px] desktop-sm:left-0 desktop-sm:w-[200px]',
  },
  {
    text: 'Who is it for?',
    rotate: 4,
    className:
      'top-[16px] right-[-30px] w-[168px] ipad:top-[22px] ipad:right-[-24px] ipad:w-[224px] desktop-sm:top-[18px] desktop-sm:right-0 desktop-sm:w-[200px]',
  },
  {
    text: 'When does it go live?',
    rotate: 3,
    className:
      'bottom-[8px] left-[-24px] w-[168px] ipad:bottom-[14px] ipad:left-[-16px] ipad:w-[224px] desktop-sm:bottom-[26px] desktop-sm:left-[24px] desktop-sm:w-[200px]',
  },
  {
    text: 'What can you spend?',
    rotate: -4,
    className:
      'bottom-[22px] right-[-24px] w-[168px] ipad:bottom-[30px] ipad:right-[-16px] ipad:w-[224px] desktop-sm:bottom-[52px] desktop-sm:right-[24px] desktop-sm:w-[200px]',
  },
];

/**
 * The lattice both the rules and the plate hang off, as one string so the two
 * cannot drift apart. `--half-w` / `--half-h` are the plate's halves and
 * `--cell` divides them a whole number of times — 402 is five 80.4s and 588 is
 * seven 84s — so a rule lands exactly on each of the plate's four edges.
 */
const LATTICE =
  '[--cell:80.4px] [--half-h:201px] [--half-w:min(201px,50%)] ipad:[--cell:84px] ipad:[--half-h:210px] ipad:[--half-w:294px]';

/**
 * The ruled board.
 *
 * Two one-pixel gradients tiled at the cell rather than a stack of spans: the
 * pitch is fixed and the board bleeds past the section on both axes.
 *
 * The phase is the fiddly part. In `background-position` a percentage aligns
 * the TILE's midpoint with the container's, so `50%` resolves to
 * `(box - cell) / 2` rather than `box / 2`; adding half a cell back cancels
 * that and lands the first rule on the plate's edge.
 */
function BoardRules() {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 ${LATTICE}`}
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--fx-hairline) 0 1px, transparent 1px), linear-gradient(to bottom, var(--fx-hairline) 0 1px, transparent 1px)',
        backgroundSize: 'var(--cell) 100%, 100% var(--cell)',
        backgroundPosition:
          'calc(50% - var(--half-w) + var(--cell) / 2) 0, 0 calc(50% - var(--half-h) + var(--cell) / 2)',
      }}
    />
  );
}

export function PinboardCta({ lang = 'en' }: { lang?: Lang }) {
  /* Accepted so this section is called the way every other one is, and so the
     extraction note above is a one-line change rather than a signature change.
     Until `COPY` moves into the dictionary there is nothing to select. */
  void lang;

  const reduce = useReducedMotionSafe();

  return (
    <section
      /* `Band`'s three gutter steps, written out: the ruled lattice bleeds past
         the content column on both axes, so this cannot be a `Band`. They must
         stay equal to it — without the `lg` step the board sat 8px proud of
         every other section from 1024px up. */
      className={`relative isolate overflow-hidden bg-[var(--fx-charcoal)] px-5 sm:px-8 lg:px-10 ${SECTION_Y_TIGHT}`}
    >
      <BoardRules />

      {/* The board: the arrangement, at its own size, in the middle of whatever
          screen it lands on. Width runs to the section because the notes hang
          off the left and right edges; height does not, because nothing in the
          composition holds its top and bottom apart. */}
      <div className="relative mx-auto flex h-[760px] w-full max-w-[1120px] items-center justify-center ipad:h-[900px] desktop-sm:h-[620px]">
        {/* The plate carries the board colour, so the rules genuinely stop at
            its edge and the clear band behind the headline is a fill rather
            than a fade.

            `border-t` / `border-l` put back the two rules the fill covers. A
            1px rule at position p paints [p, p+1] and the plate spans
            [left, right): the rules on its right and bottom edges land just
            outside it and survive, while the ones on its left and top land on
            the first pixel it paints and disappear. Only those two — a full
            `border` would double up where the rule is already there. */}
        <div className="relative z-0 flex w-full max-w-[402px] min-h-[402px] flex-col items-start justify-center border-t border-l border-solid border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] p-6 ipad:w-[588px] ipad:max-w-none ipad:min-h-[420px] ipad:p-10">
          <BlurRise className="flex w-full flex-col items-start">
            <Eyebrow>{COPY.eyebrow}</Eyebrow>

            <Serif className={`mt-5 ${DISPLAY_XS} text-[var(--fx-white)]`}>
              {COPY.heading}
            </Serif>

            <p className={`mt-4 max-w-[46ch] ${LEAD} text-[var(--fx-muted)]`}>
              {COPY.lead}
            </p>

            <PillPrimary href="/contact" withArrow className="mt-7">
              {COPY.cta}
            </PillPrimary>

            {/* True whether or not the peel plays, so it is not conditioned on
                reduced motion: the notes drag either way. */}
            <p style={MONO_STYLE} className={`mt-6 ${EYEBROW_TEXT}`}>
              {COPY.hint}
            </p>
          </BlurRise>
        </div>

        {/* After the plate in the DOM, and with no `z-*` of their own — see the
            note at the top of this file. */}
        {NOTES.map((note) => (
          <StickerNote
            key={note.text}
            text={note.text}
            rotate={note.rotate}
            className={note.className}
            peel={!reduce}
          />
        ))}
      </div>
    </section>
  );
}
