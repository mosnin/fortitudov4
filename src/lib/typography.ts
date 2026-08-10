/**
 * Fortitudo typography + spacing scale (ported with the auth/onboarding
 * surfaces).
 *
 * Single source of truth for the ported screens' visual hierarchy. The
 * values are Tailwind utility class strings; consumers compose them via
 * `cn(...)`.
 *
 * ── The type ladder ─────────────────────────────────────────────────────────
 * Snapped to a 1.2 modular ratio (minor third), rounded to whole px:
 *
 *   30 → 25 → 21 → 17 → 14 → 12 → 11
 *   H1   STAT  H2   H3   BODY  CAP   META
 */

/* ─── Display: focal numbers + page titles ─────────────────────────────── */

/** Page-level h1 — serif Times, the screen's headline. */
export const H1 = "text-3xl tracking-tight text-foreground";
/** Inline style — apply with style={{ fontFamily: 'var(--font-title)' }} */
export const TITLE_FONT = { fontFamily: "var(--font-title)" } as const;

/** Focal stat number — same scale as H1 but treated as data. Use serif. */
export const STAT_NUMBER = "text-3xl tracking-tight text-foreground tabular-nums";
/** Compact stat (when 4+ sit in a row). 25px = H1 x 1/1.2. */
export const STAT_NUMBER_COMPACT =
  "text-[25px] leading-tight tracking-tight text-foreground tabular-nums";

/* ─── Section headings ─────────────────────────────────────────────────── */

/** Section h2 — sub-page heading. */
export const H2 = "text-[21px] leading-snug tracking-tight font-semibold text-foreground";

/** Card / panel heading. */
export const H3 = "text-[17px] leading-snug font-semibold text-foreground";

/** Quiet small-caps section label (above a group of fields or rows). */
export const SECTION_LABEL =
  "text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

/* ─── Body ─────────────────────────────────────────────────────────────── */

/** Default body — 14px, the trunk of the ladder. */
export const BODY = "text-sm text-foreground";

/** Muted body — subtitles, helper text, secondary info. */
export const BODY_MUTED = "text-sm text-muted-foreground";

/** Caption / chrome / metadata. */
export const CAPTION = "text-xs text-muted-foreground";

/** Smallest tabular metadata (timestamps, ids). */
export const META = "text-[11px] tabular-nums text-muted-foreground";

/* ─── Helper class strings for primary actions ─────────────────────────── */

/** The locked primary action pill. Use on Save / Add / Confirm / Send. */
export const PRIMARY_PILL =
  "inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm font-medium " +
  "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] " +
  "transition-all duration-150 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background";

/**
 * `HELIX_PILL` — primary pill for buttons that DIRECTLY invoke Helix
 * ("Tell Helix", "Ask Helix", "Helix, help with this").
 *
 * Same vocabulary as PRIMARY_PILL but with a barely-perceptible warm halo on
 * hover: the bg shifts to a layered foreground-over-brand gradient so the
 * client feels Helix at the moment they reach for the button. Do NOT reach
 * for this on a generic Save / Send / Add button — those stay PRIMARY_PILL.
 * The warmth is the brand's punctuation; if everything has it, nothing has it.
 */
export const HELIX_PILL =
  "inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm font-medium " +
  "bg-foreground text-background " +
  "hover:bg-gradient-to-r hover:from-foreground hover:via-foreground hover:to-orange-500/90 " +
  "active:scale-[0.98] transition-all duration-150 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background";

/** Secondary ghost — Cancel, Discard, secondary action. */
export const GHOST_PILL =
  "inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm font-medium " +
  "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] " +
  "transition-colors duration-150";

/** Quiet text link — "Edit", "Cancel" inline within a row. */
export const QUIET_LINK =
  "text-sm text-muted-foreground hover:text-foreground transition-colors duration-150";

/* ─── Spacing rhythm (the People/Clients reference) ────────────────────── */

/** Between MAJOR page sections. */
export const PAGE_RHYTHM = "space-y-8";
/** Between sub-sections within a section. */
export const SECTION_RHYTHM = "space-y-3";
/** Between form fields or list rows. */
export const FIELD_RHYTHM = "space-y-4";
/** Tight inline cluster (label + pill). */
export const INLINE_TIGHT = "gap-1.5";
/** Standard inline cluster (toolbar buttons, action row). */
export const INLINE = "gap-2";
/** Between hairline-divided rows: padding only, no margin. */
export const ROW_PAD = "py-3";
export const ROW_PAD_TIGHT = "py-2.5";

/* ─── Layout containers ────────────────────────────────────────────────── */

/** Reading column — headers, section labels, row lists. Wide working
 *  surfaces (boards, wide tables) may span the full frame instead. */
export const READING_COL = "mx-auto w-full max-w-5xl";
/** Single-form pages (settings, intake). */
export const READING_MAX = "max-w-3xl mx-auto";

/* ─── Pills / badges ───────────────────────────────────────────────────── */

/** Neutral status pill — a WORD, never a colored dot or icon. */
export const STATUS_PILL =
  "inline-flex items-center rounded-full border border-border px-1.5 py-0.5 " +
  "text-[10px] uppercase tracking-wide text-muted-foreground";

/** The "active"/emphasised variant of the same pill. Still monochrome. */
export const STATUS_PILL_ACTIVE =
  "inline-flex items-center rounded-full bg-foreground/[0.06] px-1.5 py-0.5 " +
  "text-[10px] uppercase tracking-wide text-foreground/70";
