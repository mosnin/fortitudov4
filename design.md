# Fortitudo Design System

Adopted wholesale from the **realestatecrm** repository. That codebase — not a
description of it — is the source of truth. Where this file and the ported code
disagree, the code wins; where our code and *that repo* disagree, that repo wins.

Two systems live here, exactly as they do in the source:

| Surface | System | Where |
| --- | --- | --- |
| **Product** — client portal + admin | Premium, Apple-calm. Quiet, monochrome, text-first. | `src/app/(dashboard)`, `src/app/(admin)` |
| **Logged-out** — marketing, auth, onboarding | Dark, cinematic, photography-led. | `src/app/(marketing)`, `src/app/(auth)`, `src/app/onboarding` |

They never mix. Product chrome carries none of the marketing atmosphere, and the
marketing shell carries none of the product's density.

---

# Part 1 — The product (the Clients/Projects reference)

The **Clients** and **Projects** pages are canonical. Every other logged-in
surface matches them. Goal: **the eye lands on content, not chrome.**

## Compose from the kit — don't hand-roll

`src/components/crm/` is the component kit, lifted from the source repo's
canonical People/Deals surfaces. Build pages by composing it. If a page needs
something the kit lacks, port that component from the source repo and add it to
the kit — never approximate it inline.

| Component | Use |
| --- | --- |
| `CrmPageHeader` | Every page header. Three lines: muted section word *with its period* ("Operations."), serif-Times `H1` revealed word-by-word, one sentence of **status** — not a description of the page. |
| `StatStrip` · `StatCell` · `Stat` · `StatEmpty` · `StatMeta` | The metric band: a `rounded-xl border` card, cells split by `gap-px` over `bg-border/60`. Focal number is serif Times + `tabular-nums`. With no data, `StatEmpty` states a calm fact — never a misleading `0`. |
| `TabStrip` | The page's spine, directly under the title: underline text tabs with count chips and a 2px foreground rail on the active one. **Not** a segmented pill control. |
| `Toolbar` · `ToolbarSearch` · `ToolbarActions` · `FilterSelect` | **One** filter row: search left, everything else pushed right. Triggers are bordered `h-9 rounded-md` buttons reading `Label: Value`. |
| `RecordList` · `RecordRow` · `RowPill` · `RowAction` · `RowSelect` · `RecordListSkeleton` | The default for **any** list of records: `divide-y`, `py-3` rows, name + status pill, one truncating secondary line, right-hand metadata, action icons that fade in on hover. |
| `SectionHead` | A heading over a hairline rule. Text only. |

Motion: `src/components/motion/` (`Reveal`, `StaggerReveal`, `SplitReveal`,
`AnimatedNumber`, `StaggerList`, `PageTransition`) — also ported, GSAP-backed,
all honoring `prefers-reduced-motion`.

Type + spacing: `src/lib/typography.ts` is the source repo's ladder —
`30 → 25 → 21 → 17 → 14 → 12 → 11` (H1 · STAT · H2 · H3 · BODY · CAPTION · META),
plus `PAGE_RHYTHM` (`space-y-8`), `SECTION_RHYTHM` (`space-y-3`), `ROW_PAD`
(`py-3`), `READING_COL` (`max-w-5xl mx-auto`).

## The one hard rule: no decorative icons

Icons appear in exactly two places:

1. **Sidebar + top navigation.**
2. **Functional controls** — the icon *is* the action and would otherwise need a
   label in tight chrome: search glyph, close `×`, kebab `⋯`, view toggle, copy,
   and the hover-revealed `RowAction` controls.

Remove every other icon: section-heading glyphs, per-row avatar circles, status
glyphs, empty-state heroes. If an icon conveys a category or status, render the
**word** in a `RowPill`.

## No gradients, no colour accents

Surfaces are monochrome: `foreground`, `muted-foreground`, `border`, `card`,
`muted`. No `bg-gradient-*`, no glow, no per-category colour coding — all five
offerings share the same neutral pill. Colour is reserved for genuine semantics
(overdue, failed → the destructive token). Charts draw in neutral ink
(`--chart-1`); donut slices step down in opacity.

**Brand orange is not a product colour.** It belongs to the logo and to
`HELIX_PILL` (buttons that directly invoke Helix). Nothing else.

## No terminal voice

Monospace, bracketed headers, ASCII fields and dot textures belong to the
logged-out surface **only**. In the product, figures use `tabular-nums` in the
sans face, section labels use `SECTION_LABEL`, and the serif appears only as
`H1` and focal stat numbers.

## Page frame

```tsx
<div className={cn(PAGE_RHYTHM, 'pb-12')}>
  <div className={READING_COL}>
    <CrmPageHeader section="Operations." title="Clients" subtitle="5 on the board, 1 still in onboarding." />
  </div>
  {/* reading surfaces stay in READING_COL; only wide working surfaces
      (a kanban board) span the full frame */}
</div>
```

Sections `space-y-8`, within-section `space-y-3`, rows `py-3`. Avoid airy
`py-5`/`py-6` list spacing — it reads as unstructured, not premium.

## Buttons and pills

`PRIMARY_PILL` (near-black, `rounded-full`, `h-9`) for Save / Add / Confirm;
`GHOST_PILL`; `QUIET_LINK`; `HELIX_PILL` only for direct-Helix actions. Status
pills are `STATUS_PILL` / `RowPill` — neutral, bordered, 10px uppercase.

## Sidebar

Floating rounded card (`m-3 rounded-xl border border-border/70 bg-sidebar`). Nav
rows 13px, `h-9`, `rounded-md`; the active row is `bg-foreground/[0.045]` with a
2px **foreground** bar on its left edge — never an orange tint. Group labels are
10px uppercase `text-muted-foreground/70`; icons 15px, `strokeWidth` 1.75 (2.25
active). Top-bar controls are ghost, not boxed.

## Helix surfaces

Helix is part of the product, not a guest in it. Its screens compose from the
same kit as everything else — no gradient, no glow, no "AI" treatment, and no
sparkle except the one nav glyph. Four rules it adds:

- **Risk is a word, never a colour.** `Routine` / `Notable` / `Significant`
  ride in a neutral `RowPill`. Colour stays reserved for genuine semantics, and
  a red "high risk" pill would be the first crack in that rule.
- **Who acted is stated, not implied.** Every audit row and every executed
  action names Helix or a person in the line itself.
- **The diff is the deliverable.** An approval card leads with a plain-English
  summary, then field-level `before → after`. Outward-facing content (a client
  message) shows in full — you cannot approve what you have not read.
- **Nothing empty is celebrated.** The overview's Helix strip renders *nothing*
  when nothing is queued; a widget that usually reads "0" trains people to stop
  looking, and the approval queue cannot afford that.

`HELIX_PILL` marks buttons that directly invoke Helix (Send, Ask, New thread)
and nothing else. Its surfaces live under `/admin/helix` — Threads, Approvals,
Gadgets, Activity — plus a read-only `/helix` on the client portal.

---

# Part 2 — The logged-out surface

Dark, cinematic, editorial — the source repo's `(marketing)` shell, ported with
its assets. Near-black `#0a0a0a` canvas, full-bleed photography, thin
high-contrast serif headlines, monospace eyebrows, generous air, hairline
dividers.

- **Kit**: `src/components/marketing/giga/` — `primitives.tsx` is the vocabulary
  (`Serif`, `Eyebrow`, `BlurRise`, `Band`, pill CTAs).
- **Type**: display serif via `--font-title` (Times), eyebrows in `--font-mono`,
  body in the system sans. No webfonts.
- **Colour**: white text on near-black; `text-white/70`–`/60` for body,
  `text-white/40` for captions; hairlines `border-white/10`. The warm accent
  `#ff7a45` is used sparingly — eyebrow dots, tiny glyphs, one moment a screen.
- **CTAs**: `rounded-full` **white** pills with near-black text. Never a filled
  orange button.
- **Motion**: the `(marketing)/template.tsx` blur-in on route change; sections
  enter with `BlurRise` on `EASE_OUT`; nothing bounces; everything respects
  `prefers-reduced-motion`.
- **Section rhythm**: eyebrow → serif headline (two lines max) → one muted
  paragraph (~65ch) → one CTA → the visual. Sections are tall (`py-24`–`py-40`),
  separated by hairlines or photography — never background-colour stripes.
- **Footer**: pinned beneath the page, uncovered on the last stretch of scroll
  (`FooterReveal`).

## Auth + onboarding

Both follow the logged-out system. The onboarding flow is the source repo's
conversational onboarding, ported: intro cinematic → typed chat thread with
inline answer stages (`StageWhoYouServe`, `StageVoice`, `StageSources`) → ready
preloader. Its mechanics, timings, and markup are theirs; only the questions and
the submit binding are ours.

---

# Brand

Company: **Fortitudo** / **Fortitudo Agency**. The AI delivery agent: **Helix**
("Helix by Fortitudo Agency" formally). Voice: confident, concrete, short
sentences. No hype adjectives, no exclamation marks.

Offerings — exactly five, everywhere: **Websites, Software Solutions, AI
Solutions, Consultation, Digital Marketing**.

---

When in doubt, open the corresponding file in the realestatecrm repo and copy
its vocabulary. That is the whole rule.
