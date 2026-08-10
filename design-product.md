# Fortitudo Product UI — the Clients/Projects reference

Governs **everything behind the login** (`src/app/(dashboard)`, `src/app/(admin)`).
The logged-out site follows `design.md` and shares none of this.

This system is **ported, not invented**: the components in `src/components/crm/`
are lifted from the CRM reference repo's canonical People/Deals surfaces, and
`src/lib/typography.ts` is its type ladder. **Build pages by composing that kit.**
Do not hand-roll a header, a stat band, a tab strip, or a row — if a page needs
something the kit doesn't have, add it to the kit from the reference's markup.

Goal: a **premium, Apple-calm** surface. Quiet, monochrome, text-first. The eye
lands on content, not chrome.

## The kit (`@/components/crm`)

| Component | Use |
| --- | --- |
| `CrmPageHeader` | Every page's header. Three lines: muted section word *with its period* ("People."), serif-Times `H1` revealed word-by-word, one sentence of **status** (not a description). |
| `StatStrip` + `StatCell` / `Stat` / `StatEmpty` / `StatMeta` | The metric band: a `rounded-xl border` card whose cells are separated by `gap-px` over `bg-border/60`. Focal number is serif Times + `tabular-nums`. When there is no data, render `StatEmpty` with a calm fact — never a misleading `0`. |
| `TabStrip` | The page's primary spine, directly under the title: underline text tabs with count chips and a 2px foreground rail on the active one. **Not** a segmented pill control. |
| `Toolbar` + `ToolbarSearch` / `ToolbarActions` / `FilterSelect` | **One** filter row: search left, everything else pushed right. Filter triggers are bordered `h-9 rounded-md` buttons reading `Label: Value` — not pills. |
| `RecordList` + `RecordRow` / `RowPill` / `RowAction` / `RecordListSkeleton` | The default for **any** list of records: `divide-y`, `py-3` rows, name + status pill, one truncating secondary line, right-hand metadata, and action icons that fade in on row hover. |

Motion comes from `@/components/motion` (`Reveal`, `StaggerReveal`,
`SplitReveal`, `AnimatedNumber`, `StaggerList`) — also ported. Everything
honors `prefers-reduced-motion`.

Page shell: `PAGE_RHYTHM` (`space-y-8`) + `pb-12`; reading surfaces sit in
`READING_COL` (`max-w-5xl mx-auto`); only genuinely wide working surfaces (a
kanban board) span the full frame.

## The one hard rule: no decorative icons

Icons are allowed in exactly two places:

1. **Sidebar + top navigation.**
2. **Functional controls** — the icon *is* the action and would otherwise need
   a label in tight chrome: search glyph, close `×`, kebab `⋯`, view toggle,
   copy, and the hover-revealed `RowAction` controls.

Remove every other icon: section-heading glyphs, per-row avatar circles,
status glyphs, empty-state heroes. If an icon conveys a category or status,
render the **word** in a `RowPill`.

## No gradients, no colour accents

Surfaces are monochrome: `foreground`, `muted-foreground`, `border`, `card`,
`muted`. No `bg-gradient-*`, no glow, no per-category colour coding — all six
offerings share the same neutral pill. Colour is reserved for genuine
semantics: overdue/failed may use the destructive token. Charts draw in neutral
ink (`--chart-1`), slices step down in opacity.

**Brand orange is not a product colour.** It belongs to the logo and to
`HELIX_PILL` (buttons that directly invoke Helix). Nothing else.

## No terminal voice

Monospace, bracketed headers (`[ 3 / 6 ] · PHASES`), ASCII fields, and dot
textures belong to the logged-out site and auth **only**. In the product:
numbers use `tabular-nums` in the sans face, section labels use
`SECTION_LABEL`, and the serif appears only as `H1` and focal stat numbers.

## Buttons

`PRIMARY_PILL` (near-black, `rounded-full`, `h-9`) for Save / Add / Confirm;
`GHOST_PILL`; `QUIET_LINK`; `HELIX_PILL` only for direct-Helix actions.

## Sidebar

Floating rounded card (`m-3 rounded-xl border border-border/70 bg-sidebar`).
Nav rows: 13px, `h-9`, `rounded-md`; active row `bg-foreground/[0.045]` plus a
2px **foreground** bar on its left edge — never an orange tint. Group labels
10px uppercase `text-muted-foreground/70`. Icons 15px, `strokeWidth` 1.75
(2.25 active).

---

When in doubt, open `src/components/crm/record-list.tsx` and copy its
vocabulary — it is the reference's canonical row, verbatim.
