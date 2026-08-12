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

Racing yellow on charcoal. Structural rather than cinematic: the page is built
out of hairlines and squared edges, and the one saturated colour in the system
is spent on the thing you are meant to press.

**The whole palette lives in one block**, on `[data-marketing-shell]` in
`globals.css`. That selector is the boundary — the product never sees these
tokens, and this surface never sees the product's. Nothing here reads the
light/dark toggle; the logged-out site is charcoal in both.

| Token | Value | What it is |
| --- | --- | --- |
| `--fx-yellow` | `#f8cd02` | The accent. A **surface**, and the primary action. |
| `--fx-yellow-hover` | `#dcb602` | Its pressed state. |
| `--fx-on-yellow` | `#0d0d0d` | Ink for anything sitting *on* yellow. |
| `--fx-charcoal` | `#1b1b1d` | The ground. |
| `--fx-charcoal-deep` | `#141416` | Inset surfaces, alternating bands. |
| `--fx-charcoal-raised` | `#232326` | Raised surfaces. |
| `--fx-white` / `--fx-muted` / `--fx-faint` | `#fff` / `.58` / `.38` | Text on charcoal. |
| `--fx-hairline` | white `.12` | Structure. |

**The two rules that define the scheme.** Yellow is a surface and text on it is
always black. Charcoal is the ground and body text on it is always white.
Yellow as *text* is allowed only for accents a few words long — one clause of a
headline, a hover state, an eyebrow dot. It clears contrast easily (11.2:1), but
at paragraph length it stops reading as emphasis and starts competing with the
call to action, which is the only job it has.

**Two yellow buttons on one screen is a bug, not a style choice.** If two things
both look primary, neither is.

- **Kit**: `src/components/marketing/giga/` — `primitives.tsx` is the vocabulary
  (`Serif`, `Eyebrow`, `BlurRise`, `Band`, `PillPrimary`, `PillGhost`). The
  homepage hero is `src/components/originkit/` (OriginKit `hero-21`, recoloured).
- **Type**: one voice — a tight geometric sans (Geist, self-hosted) for display
  at semibold, monospace for eyebrows. **There is no serif on this surface.**
  `<Serif>` keeps its name only because ~14 files import it; it renders the sans.
- **Shape**: squared. `rounded-[4px]` for controls, `rounded-[6px]` for panels,
  and structure drawn with rules rather than rounded cards. Circles survive only
  as dots and avatars.
- **Contrast floor**: `--fx-muted` (6.5:1) is the lowest value allowed for text
  that carries meaning. `--fx-faint` (3.6:1) fails WCAG body text and is for
  decorative micro-labels only. Raw `text-white/45` and below fail — don't.
- **Motion**: the `(marketing)/template.tsx` blur-in on route change; sections
  enter with `BlurRise` on `EASE_OUT`; nothing bounces; everything respects
  `prefers-reduced-motion`.
- **Section rhythm**: eyebrow → display headline (two lines max) → one muted
  paragraph (~65ch) → one CTA → the visual. Sections are `SECTION_Y`
  (`py-24 sm:py-32`); bands that stack inside one continuous page take
  `SECTION_Y_TIGHT` (`py-16 sm:py-20`); heroes take `HERO_Y`. All three live in
  `primitives.tsx` — never write the padding inline. Sections are separated by
  hairlines or by alternating charcoal depths.
- **Everything is left-aligned.** The page is drawn out of hairlines and squared
  edges, and a centred headline sitting over a left-aligned rule fights the
  structure underneath it. The homepage hero is the single deliberate
  exception, because it is a full-viewport column with no structure beside it.
- **Type comes from the ladder, never inline.** `DISPLAY_XL`–`DISPLAY_XS`,
  `TITLE_L`, `TITLE_S` and `EYEBROW_TEXT` are exported from `primitives.tsx`
  with their leading baked in. A bare `text-[clamp(…)]` on this surface is how
  eleven near-identical heading sizes happened the first time.
- **Footer**: pinned beneath the page, uncovered on the last stretch of scroll
  (`FooterReveal`).

## Nothing on this surface is invented

The site was ported from a real-estate CRM template, and the template's filler
was written to look like proof: named clients, quantified outcomes, star
ratings, logo walls, staff rosters. All of it has been removed, and none of it
comes back.

- **No client proof we cannot source.** A case study names a real client and a
  number they agreed to, or it does not ship. `/portfolio` renders an empty
  state rather than a filled grid.
- **No invented metrics.** Not in headline stats, not in pricing, not in copy.
- **Mock interfaces caption themselves.** Any section containing a drawing of
  the product carries a visible mono label saying so, and the mock is
  `aria-hidden` so a screen reader does not read invented numbers as fact.
- **Placeholders stay placeholders.** If an image or a logo is missing, the slot
  says it is missing.

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
