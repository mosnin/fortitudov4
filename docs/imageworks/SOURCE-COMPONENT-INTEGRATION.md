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

## Second presentation pass

The repeated placements above are superseded: Squeeze Carousel is now exclusive to Work; Stacked Service Cards is exclusive to Home. Home uses the existing Our Work editorial project section. The footer and closing CTA remain untouched.

- Entry 04, Parallax Carousel: canonical CSS and JavaScript mounted on the service deck library. Keen Slider is its supplied dependency. React owns initialization and cleanup. The host adaptation reserves vertical wheel gestures for normal page scrolling; horizontal gestures, drag, arrow keys, inertia, image parallax and looping retain source behavior. Each featured slide links to its individual service and PDF.
- Entry 16, CSS Accordion: source checkbox/label/answer and easing contract powers the Services directory and the Services submenu in the persistent drawer. Scoped host styles remove demo width and adapt type size. Inert closed panels, expanded state, keyboard focus and route reset are React-owned. All 14 catalog services are linked.
- Entry 36, Reveal Hero 01: About uses its exact clip-path entrance and image scale timeline. The existing hand photograph is retained, removed from the following section to avoid repetition. Existing SplitText helper supplies the source's 2.24s delayed line reveal. Font readiness, GSAP context and split cleanup belong to AboutReveal's effect.
- Fourteen distinct photographs are sourced from the supplied entries 00, 04 and 13 and self-hosted under public/photography. No new generated product artwork. A slug-to-photo map drives deck cards, individual deck/service pages, and PDF covers.
- Fourteen PDFs rebuilt from the approved catalog and offer data: photographic split covers, light reading pages, dark acceptance/closing pages, consistent type hierarchy, and working site/contact links. Deck thumbnails now use photography, not PDF screenshots.

## Library selection review

The 50 entries include mutually exclusive navigation and route-transition systems, not 50 independent page sections. Selection follows page purpose:

| Source entries | Placement or decision |
| --- | --- |
| 00 | Work project carousel |
| 02 | Approach stacked-panel variant 3 |
| 04 | Resources photographic parallax carousel |
| 10 | Existing gradient sweep text |
| 11, 14 | Existing NumberFlow planner range/value |
| 13 | Home stacked service cards |
| 15 | Existing stacked-scroll helper; no additional repeated placement |
| 16 | Services directory, expandable Services menu, existing scoped accordions |
| 18 | Home cinematic media hero |
| 23 | Persistent drawer navigation |
| 27 | Contact activation transition |
| 29 | Persistent progressive edge blur |
| 30 | Arrow Shift CTAs |
| 36 | About reveal hero |
| 38, 39, 42, 44, 47 | Existing scoped text reveals on editorial/solution pages; no stacking multiple reveals on the same text |
| 01, 05, 12, 19 | Alternative navigation conflicts with retained drawer; not layered together |
| 07, 20, 21, 22, 25, 34, 40, 45, 48 | Alternative navigation transitions; Swup DOM replacement cannot own Next App Router content. Existing fade/blur visual adaptation retained |
| 03, 08, 09, 32 | Cursor/infinite-image effects add repetition or compete with the selected editorial media; not added |
| 06 | Draggable card stack not needed alongside existing project and resource carousels |
| 17 | Testimonial component deferred: no approved testimonial content |
| 24, 28, 35, 37 | Alternative section transitions would compete with the existing scrolling sections |
| 26 | Liquid popover has no necessary secondary action in the current page content |
| 31 | Thinking orbs require a real processing state; no fake AI activity added |
| 33 | Custom video player deferred until an actual client/project video is supplied |
| 41, 43, 46, 49 | Alternative button effects conflict with the requested Arrow Shift CTA treatment |
