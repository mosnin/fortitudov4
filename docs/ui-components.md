# UI component catalog — RareUI, PaceUI, Spectrum UI

Reference for the high-end component libraries we draw from. Every component the
owner shortlisted is listed here with a decision:

- **Adopted**: already in the codebase, adapted to our theme. Import it; don't re-add it from the registry.
- **Planned**: a good fit for a specific place in the app. Build it there, following the adaptation notes.
- **Not adopted**: a poor fit for this product, with the reason. Don't reintroduce it without revisiting that reason.

Registry components are **starting points, not drop-ins**. Nothing here is used exactly as
shipped. Every adoption goes through the rules below first.

Last reviewed: 26 September 2026.

---

## House rules for adapting a registry component

1. **Read the source before adding it.** Fetch the JSON (`https://ui.spectrumhq.in/r/<name>.json`,
   `https://paceui.com/r/<name>.json`,
   `https://raw.githubusercontent.com/swamimalode07/rare-ui/main/public/r/<name>.json`) and read the
   code before anything goes in. Don't run `shadcn add` blind: there is no `components.json`, and the
   CLI will try to create one and overwrite `src/components/ui/{button,card,input,…}`.
2. **One animation package.** We ship `motion` (import from `motion/react`) and `gsap` +
   `@gsap/react`. Rewrite `framer-motion` imports to `motion/react`. Don't add `flubber`,
   `figma-squircle`, `vaul`, `border-beam`, `metal-fx`, `prism-react-renderer`, `recharts` or
   `react-use-measure` for one component. Reimplement the effect or skip the component.
3. **Theme tokens, not literals.** Replace `neutral-*`/`zinc-*` with `foreground`, `muted-foreground`,
   `border`, `card`, `muted`. The accent is **brand orange**: `bg-brand`/`text-brand`, or
   `#ea580c` / `#c2410c` where a solid fill must keep white text legible in both themes. Status colours:
   green = done/paid, amber = due/revision, sky = new/requested, red = failed. Every component must be
   checked in **light and dark**.
4. **No icon-in-a-tinted-box** (AGENTS.md). Many registry components ship a lucide glyph inside a
   `bg-x/10 rounded-full` chip: toasts, empty states, stat cards. Strip the chip. An icon may appear
   bare, as a functional affordance, or not at all.
5. **Motion must mean something.** It should mark a change of state: a count going up, an action
   finishing, a phase completing. No idle loops on data screens, no hover theatrics on rows.
   Every component must honour `prefers-reduced-motion`.
6. **Shared CSS goes in `globals.css`**, not an inline `<style>` per instance (see `.t-text-swap`,
   `su-dot`, `su-pop`).
7. **Surfaces.** The logged-in product (`(dashboard)`, `(admin)`, `(partner)`, onboarding) is where
   these components live. The **public site is the purchased Imageworks theme** and AGENTS.md forbids
   replacing its composition with another kit. Marketing-oriented registry pieces are therefore
   *not adopted*, unless the owner explicitly revisits that rule for a specific page.
8. **Helix stays honest.** The client Helix panel is read-only and is "one more part of the product"
   (no separate AI treatment: no orbs, no gradients). Agent-UI components belong to the **staff** Helix
   surfaces (approvals, activity, threads), where actions really are proposed and approved.

---

## Adopted (in the codebase now)

| Component | Source | Our file | Where it's used | What we changed |
| --- | --- | --- | --- | --- |
| **number-ticker** | Spectrum | `src/components/ui/number-ticker.tsx` | Client and admin dashboard hero counts, workspace-card headlines, admin attention counts. `MoneyTicker` (in `build-overview.tsx`) rolls whole dollars from cents. | Trimmed to `value/prefix/suffix/locale`. Uses our `easeOutExpo`. Rolls once on scroll-in, then live. Chosen over RareUI animated-counter: lighter, same odometer effect. |
| **text-states** | Spectrum | `src/components/ui/text-states.tsx` | Inside `ThinkingDots` (Helix phases). The building block for any label that changes in place. | CSS moved to `globals.css` (`.t-text-swap`). |
| **morph-button** | Spectrum | `src/components/ui/morph-button.tsx` | Dashboard "Ask Helix" submit (`helix-ask-form.tsx`, loading while `/helix` opens). Helix panel "Ask" (loading → Answered). | `motion/react`; `tone` = `brand` / `neutral` / `inverse` (for the orange card); success/error use our green/red; `type="submit"` for forms. |
| **toast-stack** | Spectrum | `src/components/ui/toast-stack.tsx` | `<ToastProvider>` mounted once in `AppShell`. `useToast()` anywhere. Helix errors toast. | Provider + hook API with `toast.update(id, …)` for in-place loading→success morphs. Status icon bare (no tinted circle). Sits above the mobile dock. |
| **status-tracker** | Spectrum | `src/components/ui/phase-tracker.tsx` | Client dashboard hero: the lead build's phases as a stepper. | Brand orange, theme tokens, truncating labels, falls back to a bar + label past 7 phases. Server-safe. Chosen over RareUI step-player, which needs `flubber` and whose play/pause control doesn't mean anything for a build. |
| **thinking-dots** | Spectrum | `src/components/ui/thinking-dots.tsx` | Helix panel while answering: dots plus a phase label ("Reading your project" → "Writing an answer"). | Brand dots, label is a `TextStates`, keyframes in `globals.css`. |
| **notification-bell** | Spectrum | `src/components/dashboard/notification-bell.tsx` (existing, upgraded) | Topbar bell on every product surface. | Kept our polling and popover. Added the pendulum swing + clapper counter-swing **only when unread goes up**, a spring-in badge in brand orange, and a rolling count. |
| **chat-empty-state** (pattern) | Spectrum | `helix-client-panel.tsx` | Helix first-run suggestions stagger in. | Pattern only: our existing chips plus a blur-up stagger. No greeting hero, no icon. |

---

## Planned (a good fit, build it here)

Ordered roughly by impact.

### Interaction and feedback
| Component | Source | Where | Adaptation notes |
| --- | --- | --- | --- |
| **task-checkbox** | Spectrum | Admin overview → VA "My tasks" card; `/admin/tasks` checklist rows. | **Needs a write path first.** The staff `tasks` table has no update API today (`/admin/tasks` edits `clientTasks`). Add `PATCH /api/tasks/[id]` guarded by the existing `canUpdateTask()`, then use the spring fill + drawn check + strikethrough. Drop the confetti burst: one success moment per task is plenty. Pair it with **undo-pill** or a `toast` with an Undo action. |
| **undo-pill** | Spectrum | After completing a task, archiving a lead, dismissing a notification. | Countdown ring pauses on hover (keep that). Brand-orange ring. Or use `toast({ action: { label: "Undo" } })` when the surface has no room for an inline pill. |
| **hold-to-confirm** | Spectrum | Irreversible admin actions: remove a team member, revoke a partner, delete a client record. | Replace `window.confirm`-style dialogs. Red ring fill; label via `TextStates`. |
| **delete-button** | RareUI | Lighter destructive actions inside rows: delete an uploaded file, remove a task. | In-place confirm, no dialog. Rewrite colours to our red; keep the width morph. |
| **animated-switch** | Spectrum | `/settings` notification preferences, feature toggles on admin Helix introductions (`allowWrites`). | iOS knob stretch + drag. Brand orange "on" track. Must keep a real `<button role="switch">`. |
| **skeleton-reveal** | Spectrum | Route `loading.tsx` for `/dashboard`, `/admin`, `/projects/[id]`; client-fetched panels (Helix, notifications). | The skeleton should echo the real card grid (hero, orange card, table, 2×2 cards) so the un-blur lands in place. |
| **kbd-key** | Spectrum | `keyboard-shortcuts.tsx` dialog and the ⌘K hint in the topbar. | The 3D keycap that depresses on real key presses. Neutral surface, no colour. |
| **expandable-action-bar** | Spectrum | Admin project detail: the sticky action row (message client, advance phase, request payment). | Shared-layout expand from icons to labels. Icons stay functional (AGENTS.md allows icons inside buttons). |
| **share-button** | Spectrum | Client project page: share the staging/preview link. | Only copy-link and email. No social fan-out. |
| **star-rating** | Spectrum | `nps-survey.tsx`, at project hand-off. | Keep the hover wave. Drop the sparkle burst. Brand-orange fill. |
| **password-strength** | Spectrum | Not now: Clerk owns auth. Only if we ever build a non-Clerk credential form. | — |

### Data display
| Component | Source | Where | Adaptation notes |
| --- | --- | --- | --- |
| **invoices-table** | Spectrum | `/payments` (client) and `/admin/payments`. | Mono invoice numbers, status pills → our `TonePill`, per-row PDF only if we actually generate PDFs. Built on its `data-table`: port the row glide, not the whole 2k-line table. |
| **files-table** | Spectrum | Project files on `/projects/[id]` (client) and the admin project page. | Type glyph without a tinted tile (plain glyph or a file-extension label), size, uploader, date. |
| **team-members-table** | Spectrum | `/admin/team`. | Roles from `ROLE_LABELS`. Drop the 2FA column (Clerk-managed). Remove action → **hold-to-confirm**. |
| **audit-log-table** | Spectrum | `/admin/helix/activity`. | Pinned header, mono op names from `registry.ts`, actor, severity → action risk (low/medium/high). |
| **tickets-table** | Spectrum | Admin revision queue (a dedicated revisions page, if we add one). | "SLA countdown" becomes time-since-requested. Priority icons bare. |
| **deployments-table** | Spectrum | Admin project page, if we record deploys or staging links per project. | Environment badges → staging/production. |
| **data-table** | Spectrum | Base for `/admin/projects`, `/admin/clients`, `/admin/leads`. | Take the sorting, search and row-glide behaviour. Our `RecordList` vocabulary still governs density and pills. |
| **stat-cards** | Spectrum | `/admin/financials`. | Big value + delta as a sentence + scrubbable sparkline. Values in cents → `MoneyTicker`. Strip icon chips. |
| **insight-cards** | Spectrum | `/analytics` (client) and weekly reports. | Spark bars + trend delta. The "AI note" slot is Helix's one-line summary, only when Helix really generated it. |
| **calendar-heatmap** / **github-activity** (RareUI) | Spectrum / RareUI | Admin overview or client project page: a delivery-activity year (phase completions, messages, uploads per day). | Five brand-orange intensity steps. RareUI's footer "top repositories" panel → top projects by activity. Pick one; calendar-heatmap has no dependencies. |
| **recent-activity** | Spectrum | Admin overview: a feed of Helix runs and project events (`helixEvents`). | Duration and recency chips. No avatar-in-box. |
| **avatar-stack** | Spectrum | Admin active-builds rows: who's on the build (task assignees). Client project page: "your team". | Fan-apart on hover + name tooltips. Initials fallback in our neutral. |
| **area / bar / line / pie / radial chart** | Spectrum | Only if `src/components/ui/charts.tsx` stops being enough. | These need `recharts` (not installed). Our charts are hand-rolled SVG. Port a specific *style* (gradient area fill, hatch bars) into `charts.tsx` instead of adding recharts. |
| **cohort-chart** / **histogram-chart** | Spectrum | Not now. A future retention view (retainer clients by start month). | Dependency-free, so cheap to add when the question exists. |

### Navigation and shell
| Component | Source | Where | Adaptation notes |
| --- | --- | --- | --- |
| **tree-nav** | Spectrum | `/guides` table of contents and service pitch resources in the product. | Spring marker follows hover and settles on the active link. Drop the typewriter dependency. |
| **scroll-progress** | RareUI | Long in-product reading pages: guides, weekly reports. | Progress pill that expands into a section menu. Neutral pill, brand progress stroke. |
| **hook-sidebar** / **bounce-sidebar** | RareUI | Secondary nav *inside* a page (settings sections, project detail tabs). | The shell sidebar already has a spring active indicator. Don't replace it. Use these for in-page section rails only. Pick hook-sidebar (dashed rail) for settings. |
| **command-search** | Spectrum | Reference for polishing `shell/command-palette.tsx` (typed filtering + grouped results). | Behaviour reference only; we already own the palette. Drop the auto-typing demo loop. |
| **animated-drawer** | Spectrum | Mobile sheets (the shell's mobile nav, filters). | Needs `vaul`: only if we adopt vaul for all sheets. Otherwise keep our motion bottom sheet. |

### Staff Helix (agent UI)
| Component | Source | Where | Adaptation notes |
| --- | --- | --- | --- |
| **approval-card** | Spectrum | `/admin/helix/approvals` (`helix-approvals.tsx`). | Maps 1:1 to an Action: summary, preview/simulation, risk, Approve/Reject. Approve = **morph-button**. Execution stays in proposal order: the card must not imply otherwise. |
| **agent-steps** / **tool-chips** | Spectrum | `/admin/helix/[id]` thread view, `/admin/helix/activity`. | Tool calls → our registry ops, args/results collapsed by default. Simulated ops visibly marked "simulated". |
| **agent-plan** / **task-rows** | Spectrum | Helix thread when the agent proposes a multi-step plan. | Editable only by staff. Never on the client panel. |
| **reasoning-trace** | Spectrum | Staff thread view, collapsed by default. | Only if the driver actually returns reasoning; never fake it. |
| **streaming-text** / **gsap-ai-response-writer** | Spectrum / PaceUI | Helix answers, **once the endpoint streams**. | Today `/api/helix/client-thread` returns whole answers. Don't simulate streaming over a finished string. |
| **citation-sources** | Spectrum | Helix answers that cite project records (phase, message, file). | Only with real record links. |
| **message-actions** | Spectrum | Helix answers: copy. Thumbs feedback only once feedback is stored. | Regenerate is staff-only. |
| **prompt-composer** | Spectrum | Staff Helix thread composer. | No model picker (the driver is fixed). Attachments only if the thread supports them. |
| **conversation-list** | Spectrum | `/admin/helix` thread list (`helix-thread-list.tsx`). | Date grouping + pinning. |
| **suggestion-banner** | Spectrum | Admin overview: one Helix suggestion ("3 revisions are older than a week — triage?"). | Apply = navigate, not mutate. |
| **usage-meter** / **quota-banner** | Spectrum | Staff Helix only, if we meter model spend. | Cost in cents. |
| **code-block** | Spectrum (preferred) / RareUI | `/admin/helix/gadgets` and blueprints: showing gadget source. | Spectrum's has no dependencies. RareUI's needs `prism-react-renderer`. |
| **diff-view** | Spectrum | Gadget version history (`helixGadgetVersions`): diff between versions. | Accept/reject = staff actions only. |
| **error-state** | Spectrum | Helix failed-generation state (staff), preserving the prompt with Retry. | Retry = **morph-button**. |

### Empty states (pattern, not component)
Our `EmptyState` is deliberately text-first (design.md). The Spectrum empty states are 2,000+ line
showpieces with icon tiles. Take **one idea each**, never the whole component:

| Idea from | Use it for |
| --- | --- |
| **table-empty**: keep the header and column widths, rows spring in | Every empty table (recent builds, invoices, team). |
| **upload-empty**: a real drop zone with per-file meters | Project files when nothing is uploaded yet (we already use UploadThing's dropzone). |
| **inbox-empty**: last cards sweep out, stats land | `/messages` when all read. |
| **search-empty**: echo the query, offer real suggestions | Command palette and global search no-results. |
| **filter-empty**: drop filter chips one at a time with the count coming back | Admin lists with filters. |
| **not-found-empty**: print the tried path, filter real destinations | `not-found.tsx` inside the product only. |
| **access-empty**: name who can grant access | Role-bounced pages (a VA opening finance). |
| **error-empty**: copyable request id | `error.tsx` in `(dashboard)` / `(admin)`. |

---

## Not adopted (and why)

| Component | Source | Reason |
| --- | --- | --- |
| Pricing: **offset / gradient / blueprint / serif / banner tiers**, **dark-matrix** | Spectrum | The public site is Imageworks (AGENTS.md: preserve it). Pricing is scoped quotes, not plan tiers ("no Bronze/Gold/Diamond tiers"). |
| Footers: **mega-sitemap, trust-center, region-picker, service-status, link-search, policy, ask-docs, wordmark-spotlight, waitlist** | Spectrum | Public-site chrome belongs to Imageworks. Several also claim things we don't have (compliance marks, regions, a status page, a waitlist). |
| Marketing cards: **account-access-card, ai-chat-card, animated-SVG-chart, beam-card, beam-search, login-card, feedback-demo, faq-tabs-card, nav-list-card** | Spectrum | Public-site pieces (Imageworks rule), demo-loop cards that type fake content, or duplicates of Clerk's auth UI. beam-* also need `border-beam`. |
| Crypto/trading: **market-chart, candlestick, price, indicator, depth, order-book, portfolio, market-table** | Spectrum | Not our domain. |
| Commerce: **orders-table, customers-table (MRR), inventory-table, cart-empty, quantity-stepper, transfer-funds-card, scratch-card** | Spectrum | We don't sell products or move money in-app. Payments are recorded, not transferred. |
| SaaS admin: **api-keys-table, feature-flags-table, api-key-empty, webhook-empty, integration-empty, quota-empty, locked-empty, maintenance-empty, offline-empty, trash-empty, saved-empty, cart-empty, schedule-empty, board-empty, invite-empty, notification-empty, activity-empty, chart-empty, project-empty, error-empty, not-found-empty** (as components) | Spectrum | Features we don't have (keys, flags, webhooks, paywalls, trash). Useful ideas are captured under *Empty states* above. |
| Social: **like-button, follow-button, reaction-bar, leaderboard-table, top-pages-table** | Spectrum | No social or leaderboard surfaces. top-pages only if weekly reports gain page analytics. |
| **metal-button, metal-prompt-bar** | Spectrum | WebGL (`metal-fx`) chrome effect: heavy, off-theme for an agency back office. |
| **matrix-orb, fluid-orb** | RareUI | "No separate AI treatment" for Helix (helix-client-panel.tsx). A WebGL orb is exactly that. |
| **gsap-liquid-glass, gsap-tilt-card, gsap-layered-stack, gsap-animated-stack, gsap-profile-peek, gsap-flip-reveal, gsap-scramble-text, gsap-swap** | PaceUI | Hover showpieces with no job on data screens. `gsap-swap` is what `TextStates` already does, without GSAP. Revisit profile-peek for team avatars only if avatar-stack isn't enough. |
| **gsap-ai-model-selector, gsap-ai-model-ability-selector, model-selector (Spectrum)** | PaceUI / Spectrum | The Helix driver is fixed (Anthropic or the rule-based planner). There is no model choice to offer. |
| **gsap-ai-suggestions, gsap-ai-token-counter, memory-chips, web-search, inline-edit, voice-input** | PaceUI / Spectrum | Features Helix doesn't have (memory, web search, inline document editing, voice). Adopt only alongside the feature. |
| **gsap-github-star-counter** | PaceUI | No GitHub stars to show. |
| **gooey-nav** | RareUI | The gooey SVG filter reads as playful; our tabs use `tab-strip.tsx`. |
| **proximity-sidebar** | RareUI | Hover-expansion nav: poor for touch and for a dense back office. |
| **otp-input** | RareUI | Clerk handles verification codes. |
| **duration-picker** | RareUI | No duration input anywhere (needs `flubber` + `figma-squircle` too). |
| **voice-note** | RareUI | Messages are text. Revisit if voice messages ship. |
| **folder-component** | RareUI | Charming, but files are a list, and a folder you must open to see files adds a click. |
| **grid-reveal** | RareUI | Loading state for AI-generated images, which we don't generate. |
| **step-player** | RareUI | Needs `flubber`. Its play/pause/replay doesn't map to a build. Covered by `PhaseTracker`. |
| **animated-counter** | RareUI | Same odometer effect as number-ticker (adopted); one is enough. |
| **kanbanboard** | Spectrum | Needs `next-themes` wiring and its own card/select/input set; it would duplicate our kit. Build a board from our components if `/admin/tasks` gets a board view. |
| **accordion, alert-1, autosize-textarea, datetime-picker, dual-range-slider, floating-label-input, infinite-scroll, loading-button, multiple-selector, spinner, status-badge, profile-dropdown, swipe-to-delete, card** | Spectrum | Thin demos over primitives we already own (Radix accordion, `Textarea`, `Select`, `TonePill`, Clerk's `UserButton`). Adopt a specific one when a form needs it (datetime-picker for task due dates, multiple-selector for assigning several people). swipe-to-delete is worth it only in a mobile-first list. |

---

## Where things live

- Adapted primitives: `src/components/ui/` (`number-ticker`, `text-states`, `morph-button`, `toast-stack`, `phase-tracker`, `thinking-dots`).
- Dashboard card system: `src/components/dashboard/build-overview.tsx` (`DASH_CARD`, `WorkspaceCard`, `MiniList`, `TonePill`, `MoneyTicker`, the orange card's `BlueprintLines`).
- Motion tokens: `src/lib/motion.ts` (`easeOutExpo`, `springSnappy`). Shared keyframes: `src/app/globals.css`.
