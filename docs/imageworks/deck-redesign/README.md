# Fortitudo service deck redesign

22 September 2026. Scope: all 14 existing downloadable service pitches. Website composition and resource-card editorial photographs are unchanged.

## Direction and structure

The PDFs are self-contained sales documents, informed by the bounded [research review](../deck-redesign-research/REPORT.md). Apple typography guidance informs hierarchy and restraint; this is Fortitudo's own branding and Geist typography, not an Apple template or certification.

Each deck follows: a service-specific hook, recognizable buyer friction, concrete deliverables, benefits linked to delivery practices, the working process, acceptance checks, full service scope, engagement options, project inputs and responsibilities, practical questions, and an actionable closing page. Scope length determines page count (11–14); related detail is consolidated. No fabricated proof, prices, customer metrics, testimonials, decorative lines, ornamental icons or invented product images.

The layout uses black/white brand neutrals, an existing mark rendered white like the website, deliberate typography and the service's existing editorial photograph. Photographs establish mood and are not presented as client work. All text is selectable. Service-specific enquiry and email links are clickable. Website resource cards continue to use editorial photographs rather than PDF screenshots.

## Sources of truth and rebuilding

- `src/content/service-catalog.json`: complete scope, packages, process, inputs and commercial boundaries.
- `src/content/service-offers.json`: deliverables, fit, acceptance and questions.
- `src/content/deck-narratives.json`: editorial hooks, pain points, benefit explanations and takeaway headlines derived from the catalog.
- `src/content/service-photography.json`: existing photographs.
- `scripts/build-agency-decks.py`: deterministic PDF, revisioned preview and manifest builder.

Run `python3 scripts/build-agency-decks.py` in an environment with ReportLab, Pillow, pypdf and pypdfium2. The existing Geist font files must be available through project dependencies. `--only websites` limits a local iteration; regenerate all decks before release. The builder writes visual QA renders and content/bounds checks into `qa/`.

## Verification

- All 14 PDFs regenerated: 171 pages, 341 required-text checks, 11.7 MB combined.
- No text-frame overflow or intersecting text blocks across generated pages.
- Correct service-specific enquiry and email link in every PDF.
- Both Geist weights embedded, document title/language and page bookmarks present.
- PDF content streams contain zero stroked paths: no decorative rules or outlined boxes.
- Contact sheets inspected for every deck; selected full pages reviewed for typography, crops and dense content.
- Independent sampled visual review is in `VISUAL-REVIEW.md`.
- Existing service-catalog and service-pages regression suites: 21 tests passed.

Machine results: `qa/checks.json`, `qa/pdf-integrity.json`. Full contact sheets and full-size page renders are retained locally, not included in the deployable site. Research source representations, hashes, provider receipts and the governed review dossier are retained locally in `../deck-redesign-research/`; the concise report and independent findings are versioned.

These checks establish layout, content and delivery integrity. They are not customer testing, a conversion claim, a fully tagged-PDF accessibility audit or final owner design acceptance. Research independently supports the six included design claims, but discovery remains limited and the kernel packet remains `needs_review` because no trusted-host admission is claimed.
