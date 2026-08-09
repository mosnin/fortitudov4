# Fortitudo — Logged-Out Website Design System

This is the **canonical design reference for every logged-out page** (marketing
site, auth, onboarding). The system was adopted wholesale from the UI-framework
reference repo's `(marketing)` shell ("Giga" redesign) — **do not restyle it,
do not approximate it, do not introduce new visual language.** New sections,
components, and pages MUST be composed from the primitives and rules below.
Wording is Fortitudo's; the UI is frozen.

Live implementation:
- Shell: `src/app/(marketing)/layout.tsx` (+ `template.tsx` route transition)
- Kit: `src/components/marketing/giga/` — `primitives.tsx` is the vocabulary
- Scoped CSS: the `[data-marketing-shell]` blocks at the end of `src/app/globals.css`

## 1. Character

Dark, cinematic, editorial. Near-black canvas, full-bleed photography, thin
high-contrast serif headlines, monospace eyebrows, generous air, hairline
dividers. The site should feel like a film title sequence for a serious tool —
never like a component library demo.

## 2. Canvas & color

- Sections are **near-black `#0a0a0a`** with white text. The shell itself is
  theme-aware (`bg-white dark:bg-[#0a0a0a]`), but the cinematic homepage
  sections force `dark` on their subtree; follow that pattern for any new
  full-bleed cinematic section.
- Text hierarchy on dark: `text-white` for headlines, `text-white/70`–`/60`
  for body, `text-white/40` for captions/eyebrow rest states.
- Hairlines: `border-white/10` on dark, `border-neutral-200` on light.
- **Accent**: the warm brand orange `#ff7a45` (exported as `ACCENT` from
  `giga/primitives`), used *sparingly* — eyebrow dots, tiny glyphs, one accent
  moment per screen. The brand gradient (`#ff7a45 → #c77dff`) exists as the
  shared SVG `linearGradient` defined in the marketing layout; stroke icons
  with it for the signature two-tone glyph look.
- Photography: full-bleed scenic imagery with dark scrims/gradients under
  text. Product UI appears as **composited cards over photography**, never as
  bare screenshots on flat ground.

## 3. Typography (exact — do not substitute)

Pinned in `[data-marketing-shell]` scope:
- **Display serif** — `"Times New Roman MT", "Times New Roman", Times, serif`
  via `--font-title`/`--font-serif-display`. Every `h1–h6` in the shell
  resolves to it automatically. Large headlines are **thin and high-contrast**:
  use the `<Serif>` primitive (light weight, tight tracking, high optical
  size). Headline scale ~`text-5xl`–`text-7xl`, line-height ~1.05.
- **Eyebrow mono** — `"SF Mono", ui-monospace, …` via `--font-mono` in shell
  scope. Eyebrows are UPPERCASE, letterspaced, small (11–12px), and carry a
  small colored dot (a styled `<span>`, never an emoji). Use the `<Eyebrow>`
  primitive.
- **Body sans** — the system sans stack (SF Pro-class). Body copy is muted
  (`text-white/70`), ~15–17px, relaxed leading.
- No webfonts are loaded for the logged-out site; these are system faces.

## 4. Primitives (compose pages ONLY from these)

From `src/components/marketing/giga/primitives.tsx` and siblings:
- `<Serif>` — display headline (as h1/h2/h3/span/p)
- `<Eyebrow>` — mono uppercase label with accent dot
- **Pill CTA** — `rounded-full` **white** button with near-black text
  (`bg-white text-neutral-900`) + arrow; secondary actions are ghost/underline
  text links. Never a filled orange button on the marketing site.
- `<BlurRise>` (in primitives) — the entrance: blur(8px) → crisp with a small
  rise on `EASE_OUT = [0.16, 1, 0.3, 1]`. Every section enters this way;
  respects `prefers-reduced-motion`.
- Showcase cards — dark rounded product-UI mockups composited over
  photography (`agent-canvas`, `*-showcases`); auto-advancing stepped lists
  with progress bars for feature walkthroughs.
- `logos-carousel`, `scroll-direction-carousel`, `text-flip`,
  `shimmering-text`, `decrypted-text`, `animated-gradient-text`,
  `animated-gradient-background`, `circuit-board` — the motion garnish kit.
  Use at most one per section.
- `<FooterReveal>` — the footer is pinned beneath the page and uncovered on
  the final stretch of scroll. All logged-out pages get this via the layout.

## 5. Motion rules

- Route transitions: the `(marketing)/template.tsx` blur-in — leave it alone.
- Section entrances: BlurRise with `EASE_OUT`; stagger children ~60–90ms.
- Feature steppers auto-advance with linear progress bars; hover pauses.
- Nothing bounces. No springs on the marketing site. Durations 0.45–0.8s.
- Every animation respects `prefers-reduced-motion`.

## 6. Section anatomy (the rhythm of a page)

1. Eyebrow (mono, dot) → 2. Serif headline (thin, two lines max) →
3. one muted body paragraph (~65ch) → 4. one CTA (white pill) →
5. the visual (photo, composited product card, or showcase component).
Sections are tall (`py-24`–`py-40`), separated by hairlines or photography
transitions — never by background-color stripes.

## 7. Brand & voice

- Company: **Fortitudo** / **Fortitudo Agency**. The AI delivery agent:
  **Helix** ("Helix by Fortitudo Agency" formally).
- Voice: confident, concrete, short sentences. "Helix works your whole
  build." Never hype adjectives, never exclamation marks.
- Logo lockup: Fortitudo mark + "Fortitudo" text wordmark (see header/footer).
- The gradient id `chippi-grad` in the layout is a frozen internal identifier
  (icon strokes reference it); leave the id alone.

## 8. Auth & onboarding

Auth pages and the onboarding flow use this same shell system (ported from the
same reference): identical fonts, colors, and motion; Clerk components carry
the ported `clerk-appearance` theme. The onboarding flow's step/chat mechanics
are frozen; only its questions/wording are Fortitudo's.

## 9. Hard don'ts

- Don't import from `src/components/landing/` (retired Corgi-style system) or
  reuse the product/dashboard tokens (`bg-brand`, `.eyebrow-mono`, AsciiField)
  on the logged-out site — the dashboard has its own separate system.
- Don't add webfonts, don't change the serif, don't swap photography for
  illustrations, don't use filled orange CTAs, don't shrink section spacing.
- New imagery: full-bleed photography in the existing grade (see
  `public/marketing/`); leave an explicit placeholder slot if no asset exists.
