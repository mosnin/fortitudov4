/**
 * The logged-out surface's design constants.
 *
 * These are plain strings and one plain object — no React, and deliberately NO
 * `'use client'`. That directive is why this file exists.
 *
 * They used to live in `primitives.tsx`, which is a client module. When a
 * SERVER component imported one, React replaced the export with a stub that
 * throws on call, and interpolating that stub into a `className` template
 * stringified the error message straight into the class attribute:
 *
 *     class="... function(){throw Error("Attempted to call DISPLAY_L() from
 *     the server ...")} ..."
 *
 * The heading then fell back to 16px. It type-checked, it linted, and it
 * built — `/about`, `/privacy`, `/terms` and `/pricing` all shipped with
 * body-sized headlines until someone measured the rendered DOM.
 *
 * Constants live here. Components live in `primitives.tsx`. A component
 * crossing the boundary is fine; a string crossing it is not.
 */

/* ── The one type scale ─────────────────────────────────────────────────────
 *
 * Five display steps and two title steps, and nothing else. The surface was
 * assembled from a ported kit, an OriginKit hero and two reference layouts, so
 * it arrived carrying eleven different heading clamps that all meant roughly
 * "section heading". Sizes AND leading live in the step, because a step whose
 * leading is left to the caller is a step that drifts again on the next page.
 *
 * Pass a step to <Serif>; do not write a bare `text-[clamp(...)]` on this
 * surface.
 */
/** The page owns the screen: the homepage hero, the footer's closing line. */
export const DISPLAY_XL = 'text-[clamp(2.5rem,7.5vw,5.25rem)] leading-[0.98]';
/** A sub-page `h1`. */
export const DISPLAY_L = 'text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.04]';
/** A major section `h2` — the ones with an eyebrow above them. */
export const DISPLAY_M = 'text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.06]';
/** A secondary section `h2` — a band inside a longer page. */
export const DISPLAY_S = 'text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08]';
/** A closing ask or an in-panel headline. */
export const DISPLAY_XS = 'text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.08]';

/** A card headline set in the display face. */
export const TITLE_L = 'text-[22px] leading-tight';
/** A sub-card or list-row heading. */
export const TITLE_S = 'text-[17px] leading-snug';

/* ── Body ────────────────────────────────────────────────────────────────────
 *
 * These exist because the heading ladder above was not enough. With nothing to
 * reach for below TITLE_S, every author picked a paragraph size by eye, and an
 * audit found SEVEN different ones on the homepage alone — 32, 18, 16, 14.5,
 * 14, 13.5 and 13px — with card copy split four more ways underneath that.
 * None of it was a decision; it was just the absence of a token.
 *
 * Three steps, and they are deliberately few. A body scale with five entries
 * gets used as a five-entry scale, and the drift starts again one level down.
 * Anything that does not fit one of these wants a different element, not a
 * different size.
 */

/** The one paragraph under a section headline. The default. */
export const LEAD = 'text-[15px] leading-relaxed';
/** Copy inside a card, a list row, a table cell. */
export const BODY = 'text-[14px] leading-relaxed';
/** Captions, footnotes, the line under a figure. Never a whole paragraph. */
export const BODY_S = 'text-[13px] leading-relaxed';

/* ── Alignment ───────────────────────────────────────────────────────────────
 *
 * Everything on this surface is LEFT-ALIGNED. The page is built out of
 * hairlines and squared edges, and a centred headline over a left-aligned rule
 * fights the structure it is sitting on. Read top to bottom, the homepage used
 * to alternate centred and left section by section, which looks like drift
 * rather than rhythm.
 *
 * The one deliberate exception is the homepage hero, which is a full-viewport
 * centred column and is the only thing on the site with no structure beside it.
 */

/* ── Alert ───────────────────────────────────────────────────────────────────
 *
 * The one colour on this surface outside the --fx-* palette, and it earns its
 * place: the "typical agencies" belt is a bad-vs-good comparison, and the bad
 * half has to read as a warning rather than as a second brand accent. Held
 * here so both users (the comparison belt, the contact form's failure notice)
 * say the same red — these want to be `--fx-alert*` in the marketing-shell
 * block in globals.css, which this surface does not own.
 */
/** An outlined alert chip: border, wash, and ink. */
export const ALERT_CHIP =
  'border-[var(--fx-alert)] bg-[var(--fx-alert)]/[0.08] text-[var(--fx-alert-text)]';
/** The alert rule/connector fill. */
export const ALERT_RULE = 'bg-[var(--fx-alert)]/60';
/** Alert ink on charcoal. */
export const ALERT_TEXT = 'text-[var(--fx-alert-text)]';

/* ── Section rhythm ──────────────────────────────────────────────────────── */

/**
 * Two vertical steps, not five. `py-20`/`py-24`/`py-28`/`py-32` were in use
 * simultaneously, which reads as sections that do not know their own rank.
 */
/** A top-level section. */
export const SECTION_Y = 'py-24 sm:py-32';
/** A band that stacks with others inside one continuous page (pricing, legal). */
export const SECTION_Y_TIGHT = 'py-16 sm:py-20';
/** A page hero. The extra top pad clears the fixed header. */
export const HERO_Y = 'pt-32 pb-20 sm:pt-40 sm:pb-24';

/* ── Mono ────────────────────────────────────────────────────────────────── */

/**
 * The eyebrow / caption face. Exported so no file declares its own copy — the
 * surface previously carried two spellings of the same role (`--font-mono` and
 * `--font-mono-display`), which resolve to the same face and so hid the drift
 * rather than preventing it.
 */
export const MONO_STYLE = {
  fontFamily: 'var(--font-mono-display), ui-monospace, monospace',
} as const;

/**
 * The eyebrow treatment, as a class string, for the labels that are a bare
 * `<p>` rather than the dotted `<Eyebrow>` — footer column heads, category
 * labels, mock captions. One size, one tracking, one colour.
 *
 * `--fx-muted`, never `--fx-faint`: a label that names the content under it is
 * content, and `--fx-faint` is 3.6:1.
 */
export const EYEBROW_TEXT =
  'text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--fx-muted)]';
