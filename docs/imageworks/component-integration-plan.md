# Supplied component integration — Fortitudo

User source: cinematic hero, drawer, NumberFlow, stacked panels, Aurora Glow, progressive edge blur, arrow-shift CTA, fade/blur navigation and gradient text reveal. These explicit component sources override generic component-directory recipes. Preserve supplied algorithms and shaders; adapt only lifecycle and integration boundaries.

- Hierarchy: cinematic homepage intro, then software/AI capabilities and actual project work. Existing copy temporarily fills hero; hosted demo media is temporary and explicitly supplied by the user.
- Composition: replace homepage repeating campaign scenes with dark stacked software/AI service panels. Existing Stored, Chippi and Govern screenshots; no new generated artwork. Keep Our work and full portfolio destination.
- Material: existing neutral dark palette and Geist typography; supplied glass CTA, dark drawer, edge blur and Aurora only during contact navigation.
- Details: one header/navigation, keyboard escape/focus return and focus containment; one window scroller; preserve non-navigation modified clicks, downloads, external links and authenticated routes.
- Responsive: fixed mobile hero with 110svh media; opaque next section; native touch scroll; drawer full width on phone; stacked panels unpinned below 1025px.

Motion ownership: React mounts/cleans source helpers. Existing Lenis uses one RAF bridged to ScrollTrigger. Drawer uses CSS state and GSAP child reveals. Next.js owns routes/head; no Swup DOM replacement. Contact links show Aurora for 2.5s then navigate/fade, preserving query strings. Native history gets fade/blur entry without taking over history data. NumberFlow applies to the hero progress value; no invented prices or statistics. Gradient reveals are scope-owned and one-shot. Existing global motion preference rules remain; no new reduced-motion branch inside authored hero/CTA.

Review scope: desktop/mobile intro, thumbnail switching/late handoff, drawer open-close/interruption/keyboard, stacked entrance-retirement-return, contact transition and form destination, ordinary links/back/forward, text reveals and button hover, WebGL failure fallback, cleanup. Mechanical checks and self-review are not user acceptance.

Implemented files: `cinematic-hero.tsx`, `motion-shell.tsx`, `stacked-features.tsx`, `arrow-button.tsx`, `effects/*.js`, and marketing `premium.css`. Global marketing layout mounts the persistent shell; homepage mounts the hero and stacked panels. Hero waits for fonts; each component releases observers, timelines, video and WebGL resources on unmount. The existing manual pause control also pauses hero video.

Self-review completed at 1280x720 and 390x844. Thumbnail selection pauses outgoing film; next-section top crossing pauses film. Mobile has no horizontal overflow. Drawer provides inert content, focus containment and Escape return. Contact navigation reaches the unsubmitted form; ordinary Work navigation and browser back reach the expected routes. Header and controls stack above progressive blur. Original supplied shader math and timing retained.
