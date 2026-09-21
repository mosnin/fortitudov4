# Supplied component integration — 21 September 2026

Source: Google Doc **Web Animation Effects**, document `18VnOZXNWdE7z1UhvXb97FWvyPhgMy9RmZRnjFz-Pkms`, saved in `web-animation-effects-source.txt`. Entries are separated by the document's ellipsis delimiters.

## This correction

- Entry 00, Squeeze Carousel: canonical JavaScript extracted into `effects/library/squeezeCarousel.js`; canonical SCSS compiled into `source-squeeze.css`. Mounted on Home and Work. Preserves templates, dynamically created cards, geometry, hover widths, arrow controls, caption SplitText and root cleanup. Uses five existing project images. React mounts and destroys the instance; only export/lifecycle integration changes the source algorithm.
- Entry 13, Stacked Service Cards: canonical CSS copied into `source-service-cards.css`, existing extracted `stackedServiceCards` initializer reused. Mounted on Home and Services. Preserves root, shared stack, card-content and media wrappers, pinning, layered progression and mobile normal-flow fallback. Uses the source's hosted temporary media; no new images generated. Content is Fortitudo's four service groups, retaining links to all 14 catalog services.
- `source-adaptations.css` holds only brand tokens, host spacing and links/CTAs added to the source cards. No replacement animation algorithms.

## Existing supplied components retained

Cinematic hero (18), drawer navigation (23), Aurora contact transition (27), progressive edge blur (29), Arrow Shift CTA (30), gradient text sweep (10), NumberFlow project planner (11/14), and source stacked panels/text reveals on the existing Approach and solution pages.

The existing Next App Router owns page navigation. Its fade/blur adapts the supplied visual transition; Swup DOM replacement is not installed over React's router. The document itself declares that exact combination incompatible. Mutually exclusive page transitions and navigation alternatives are not mounted together.

## Verification

TypeScript and targeted ESLint pass. Browser verified carousel Next changes the active caption from Stored to Govern. Desktop service stack progresses on scroll; mobile uses ordinary vertical cards with media before content. All source card media loaded. Mobile document width matches the 390px viewport. Existing footer and closing CTA retained. All 14 landscape PDF downloads were checked against manifest bytes and PDF signatures.
