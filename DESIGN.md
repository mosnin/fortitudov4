# Fortitudo — Design System

The durable spec for how Fortitudo looks and feels. This is the source of truth so
the aesthetic stays consistent across sessions and contributors. If you change a
token or pattern here, change it everywhere it's used.

> Companion to `AGENTS.md`. The icon rule there is part of this system.

---

## 1. Voice & posture

A **bespoke digital studio for the AI age** — calm, confident, builder-not-funnel.
Clean typography over ornamentation. The ASCII signature is the brand's soul:
something quietly being assembled. Never "vibe-coded."

---

## 2. Color — orange is the only accent

Tokens live in `src/app/globals.css` (`@theme`):

| Token | Hex | Use |
| --- | --- | --- |
| `--color-charcoal-dark` | `#0A0A0A` | Primary dark background (marketing, mastheads) |
| `--color-charcoal` | `#1C1C1C` | Panels on dark |
| `--color-charcoal-light` | `#2A2A2A` | Raised surfaces |
| `--color-orange` | `#F97316` | The accent. Buttons, eyebrows, highlights |
| `--color-orange-light` | `#FB923C` | Hover / gradient mid |
| `--color-orange-dark` | `#EA580C` | Button hover / gradient end |
| amber | `#FBBF24` | **Only** the brightest highlight (ASCII cores) |
| `--color-success` / `--color-warning` | tokens | Status only — not decoration |

Rules:
- **Orange is the single brand accent.** Don't introduce new accent hues (no blues,
  purples, teals) unless explicitly asked.
- Opacity scales carry hierarchy: text `white`, `white/65`, `white/55`; accents
  `orange/80` (eyebrow), `orange/70`, `orange/60`.
- Borders: `border-border/60` (or `/40` for inner rows).

---

## 3. Type

- **Headings:** `.font-brand` = `"Bitcount Grid Single"`. Used for `h1`/`h2` and big
  numerals. Imported in `globals.css`.
- **Accent word:** wrap one word in `.text-gradient-orange`
  (`linear-gradient(135deg, #F97316, #FB923C, #FDBA74)`, bg-clip-text).
- **Body:** Inter (`font-sans`).
- **Mono / ASCII:** `font-mono`, usually `uppercase tracking-[0.18em–0.25em]` for
  labels, tags, and data.

---

## 4. Reusable patterns (copy these verbatim)

**Eyebrow**
```tsx
<p className="text-xs uppercase tracking-[0.25em] text-orange/80">Section</p>
```

**Heading with one accent word**
```tsx
<h2 className="font-brand text-3xl text-white sm:text-4xl">
  From idea to <span className="text-gradient-orange">launch</span>
</h2>
```

**Masthead** (marketing: `MarketingHero`; dashboard: inline)
```tsx
<div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
  <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
  <div className="relative z-10">…</div>
</div>
```

**Panel / card**
```tsx
<div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">…</div>
```
- `GradientCard` — premium 3D-tilt, reserve for primary feature cards.
- `SpotlightCard` — cursor-glow, for secondary/tertiary cards.

**Buttons**
- Primary: `rounded-full bg-orange px-… text-white hover:bg-orange-dark`.
- Secondary: `rounded-full border border-white/15 text-white/80 hover:text-white`.
- Radius is **pill** (`rounded-full`) for actions, `rounded-3xl` for panels.

---

## 5. The ASCII signature

Two distinct things — don't conflate them:

1. **`AsciiField`** (`src/components/dashboard/ascii-field.tsx`) — the *animated*
   canvas field. Background texture only. Ramp `" .·:-=+*≡#%@"`, orange with amber
   at the brightest, ~18–24fps (deliberately calm), honors `prefers-reduced-motion`.
   Typical opacity: masthead `0.5`, hero `0.20–0.25`, card accents `0.08–0.13`.
2. **`AsciiArt`** (`src/components/ascii-art.tsx`) — *static*, hand-drawn `<pre>`
   illustrations that tell a feature's story (Brief, Blueprint, Build, Decision,
   Launch, Vault, Agent). Use as feature "images," or at `text-orange/[0.06]` as
   subtle accents tucked around a layout.

ASCII data conventions (lists, tables, notifications):
- Status glyphs: `●` (active/unread) / `○` (done/read).
- Mono tags instead of icons: `message`, `phase`, `payment`…
- Rules with a trailing count: `TODAY ──────── 04`.
- **Box-drawing/geometric glyphs only — never emoji** (emoji are double-width and
  break monospace alignment). Verify alignment by printing to a terminal.

---

## 6. Motion

- Helpers: `Reveal`, `RevealGroup`, `RevealItem` from `src/components/ui/motion.tsx`
  (`motion/react`). Use `whileInView` + `viewport={{ once: true }}` for sections.
- Shared easing: `[0.16, 1, 0.3, 1]`. Durations 0.4–0.8s. Keep it calm.

---

## 6.5 Feedback, loading & perf

- **Toasts:** `toast.success/error/info` from `src/components/ui/toast.tsx`
  (`<Toaster />` is mounted once in the root layout). Every mutation must give
  feedback — confirm success and surface failure. Never `catch(() => {})` on a
  user action; toast the error instead. (Best-effort background calls — SW
  registration, `lastUsedAt` — may stay silent.)
- **Loading:** add a `loading.tsx` skeleton for any route with server data so
  navigation never blanks. Use the `Skeleton` primitive (`src/components/ui/skeleton.tsx`).
- **Offscreen animation:** canvas/RAF effects (`AsciiField`) must pause when not
  visible (IntersectionObserver). Don't run animation a user can't see.

## 7. Icons (mirrors `AGENTS.md`)

- **No** "icon inside a tinted rounded box/circle" badge. No decorative icons above
  headings or beside stats.
- Icons only as functional affordances **inside** buttons, nav/dock items, and
  compact list rows. Prefer mono type tags / glyphs over icons in dense UI.

---

## 8. Layout & mobile

- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` (marketing uses `max-w-6xl`
  for prose-width sections).
- Section spacing: `py-20 sm:py-28` or `py-24 sm:py-32`.
- **Mobile horizontal lock:** `html`/`body { overflow-x: clip }` (in `globals.css`).
  Never let a child force horizontal scroll; no full-bleed elements wider than the
  viewport. Test that the page can't slide sideways.
- Both light and dark must work — don't tune ASCII/contrast for dark only.

---

## 9. Engineering spine (so design survives reality)

- **DB migrations:** prefer new tables; write idempotent SQL (`IF NOT EXISTS`,
  `ADD COLUMN IF NOT EXISTS`). `select().from(table)` references every column, so a
  page can break before its migration runs — guard against it.
- **Auth/roles:** `client` / `team` / `admin`; `isStaff = admin || team`. Scope
  team to their own data; only `admin` performs destructive/elevated actions.
- **Human-in-the-loop:** enforce structurally (only `admin` can mark work done),
  not just in the UI.
- **Degrade gracefully:** optional integrations (email, research, redis, sentry)
  must no-op cleanly when unconfigured.
- Verify every change with `npx tsc --noEmit` and `npx eslint <files>` before commit.
