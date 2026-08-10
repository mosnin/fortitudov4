# Fortitudo Product UI — the Clients/Projects reference

This governs **everything behind the login**: the client portal (`src/app/(dashboard)`)
and the admin surface (`src/app/(admin)`). It is adopted from the CRM reference
repo's product stylesheet — the logged-out site follows `design.md` instead and
shares none of this.

The **Clients** and **Projects** pages are the canonical look. Every other
surface matches them. The token scale lives in `src/lib/typography.ts`; this
file is the *layout + surface* companion.

Goal: a **premium, Apple-calm** surface. Quiet, monochrome, text-first. The eye
lands on content, not chrome.

## The one hard rule: no decorative icons

The ONLY places a lucide icon is allowed:

1. **Sidebar + top navigation** — the persistent nav rail/header.
2. **Functional controls** — an icon that IS the button's action and would
   otherwise need a text label in a tight control: a close `×`, a search field's
   leading glyph, a kebab/⋯ menu, view-toggle segmented controls, a copy button.
   These live inside `<button>`/toolbar chrome, never floating in content.

**Remove** every icon used as decoration:
- per-row "avatar" icon circles / colored type chips
- section-heading glyphs (a `<Receipt>` before "Invoice", a `<TrendingUp>`
  before "Performance")
- status glyphs (a `<CheckCircle>` before "Done") — use a text pill instead
- empty-state hero icons — lead the empty state with text

If an icon conveys a *category/type/status*, replace it with the **word** in a
neutral bordered pill.

## No gradients, no color accents

- No `bg-gradient-*`, no `from-*/to-*/via-*` fills, no glow.
- No per-category color coding. Surfaces are **monochrome**: `foreground`,
  `muted-foreground`, `border`, `card`, `muted`. Color is reserved for genuine
  semantics only — a **failed/overdue** state may use the destructive token;
  "on/off" is a neutral pill, not green.
- **Brand orange is not a product color.** It belongs to the logo and to
  `HELIX_PILL` (buttons that directly invoke Helix). Nothing else. Charts are
  neutral ink (`--chart-1`), slices step down in opacity.

## No terminal voice

The previous system spoke in monospace — bracketed headers (`[ 3 / 6 ] · PHASES`),
mono statuses, mono amounts, ASCII fields, dot textures. **That voice belongs to
the logged-out site and auth pages only.** In the product:

- Numbers use `tabular-nums` in the sans face, not `font-mono`.
- Section labels use `SECTION_LABEL` (11px uppercase muted **sans**).
- No `AsciiField`, no `.dot-texture`, no `.eyebrow-mono`, no `.bracket-label`.

## Row lists (the default for any list of records)

```tsx
<ul className="divide-y divide-border/60">
  {items.map((it) => (
    <li key={it.id} className="group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{it.name}</span>
          {/* status → neutral text pill, not a colored dot/icon */}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{secondary}</div>
      </div>
    </li>
  ))}
</ul>
```

- Row rhythm `py-3`; loading skeletons mirror the same `divide-y` rows.
- Never a grid of heavy bordered cards for a records list. Cards are for a
  genuine *gallery of choices*, and even then: plain bordered `bg-card`, no icon
  header.

## Page frame

```tsx
<div className={cn(PAGE_RHYTHM, "pb-12")}>
  <PageHero section="Operations" title="Clients" description="One quiet subtitle line." />
  {/* reading surfaces (header, section labels, row lists) sit in the centered
      READING_COL; only wide working surfaces span the full frame */}
</div>
```

`PageHero` (`@/components/ui/firecrawl`) *is* this frame: quiet section line,
serif `H1` via `TITLE_FONT`, one muted subtitle, optional action. It carries no
texture, no icons, no typewriter.

- Sections `space-y-8` (`PAGE_RHYTHM`), within-section `space-y-3`
  (`SECTION_RHYTHM`), rows `py-3` (`ROW_PAD`). Avoid airy `py-5`/`py-6` list
  spacing — that reads as unstructured, not premium.

## Pills / badges

Status, category, or type: `STATUS_PILL` — neutral, bordered, 10px uppercase.
The emphasised variant is `STATUS_PILL_ACTIVE`. No color, no icon.

## Buttons

Use the pills in `src/lib/typography.ts`: `PRIMARY_PILL` (near-black,
`rounded-full`, h-9) for Save / Add / Confirm, `GHOST_PILL`, `QUIET_LINK`, and
`HELIX_PILL` **only** for actions that directly invoke Helix.

## Sidebar

Floating rounded card (`m-3 rounded-xl border border-border/70 bg-sidebar`).
Nav rows are 13px, `h-9`, `rounded-md`; the active row is
`bg-foreground/[0.045]` with a 2px **foreground** bar on its left edge — never
an orange tint. Group labels are 10px uppercase `text-muted-foreground/70`.
Icons are 15px, `strokeWidth` 1.75 (2.25 when active). The sidebar is the one
place icons are unconditional.

---

Applying this file: sweep every content surface and strip decorative icons,
gradients, category colors, and the mono/ASCII voice, converting them to the
row / pill / text vocabulary above.
