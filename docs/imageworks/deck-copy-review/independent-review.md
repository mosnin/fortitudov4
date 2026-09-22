# Independent deck copy review

Reviewed 22 September 2026 by a non-author of the current copy, using the Offers, Influence and Humanize OS audit guidance. Scope: the current copy and PDF assembly for all 14 services. Production files were not edited.

## Decision

No blocking copy defect or required correction found in the reviewed changes.

## Findings

- **Offer fidelity:** `deck-offer-copy.json` changes only summary, fit, firstStep and deliverables. These are plain-language restatements of the existing service offers. The builder retains the catalog sections, packages, process, inputs and boundary, plus the original acceptance conditions, scope drivers and FAQ. It does not replace these with an abbreviated sales promise.
- **Benefits:** The benefits in `deck-narratives.json` describe mechanisms already present in the catalog: coordinated design and development, testing, permissions, operator visibility, usable documentation and handover. They do not introduce performance statistics, named customer results, guaranteed revenue, unrestricted autonomy or unqualified ownership. Brand implementation is explicitly conditional on inclusion; software ownership remains subject to agreed terms and third-party licensing.
- **Alternatives:** All 14 `alternative` values offer a relevant qualification or lower-commitment path, such as repair, a prototype, an existing harness, setup rather than a custom build, or an independent consultation. These correspond to existing packages, sections or boundaries. The agent-team alternative explicitly permits the conclusion that one agent is enough. No competitive superiority claim was added.
- **First checkpoints:** Every `firstCheckpoint` matches the service process and describes an initial scope, feasibility or representative-work review. None promises a free deliverable, fixed turnaround or guaranteed result. The checkpoint wording does not escalate the initial enquiry into a purchase.
- **Choice and next step:** The close asks the reader to start a conversation and identifies what to send. It also provides a voluntary “See our work” route and an email option. There is no fabricated scarcity, countdown, authority badge, endorsement, hidden retainer or pressure language.
- **Natural language:** Summaries use direct verbs and identify the work being purchased. Technical terms are concentrated in relevant specialist offers. Service names, conditions and provider limitations are preserved. The shared layout labels do not obscure the different buyer problems and delivery scopes.
- **Link construction:** `build-agency-decks.py` creates the enquiry URL from the current service ID and slug, and the portfolio link is `https://www.fortitudo.agency/work`. Both corresponding Next.js routes exist. HTTP HEAD checks returned 200 for the portfolio URL and the generated websites enquiry URL (`service=websites&offer=websites`). This verifies route reachability only, not form submission or every query-prefill combination.

## Evidence boundaries

This review uses the repository catalog and offer files as the supplied commercial baseline. It does not independently verify Fortitudo’s fulfillment capacity, historical results, current third-party product availability, prices or legal obligations. No live Company OS or Symbolic provider reads were performed, so this is not provider-grounded context acceptance. Pricing is deliberately left to the written proposal; there is no new fixed price or return promise to validate here.

Real prospect comprehension and informed choice have not been measured. A future review should ask prospects to explain the scope, dependencies, next commitment and separate operating costs. This review is not a conversion claim, deployment check, new visual approval or a change to the separate research verdict.

## Reviewed versions

- `src/content/deck-offer-copy.json` — SHA256 `e2ff1a5d7f3741547fa2087a892ff902e5cc8102fab1409e610ae9eb0d4e4b5d`
- `src/content/deck-narratives.json` — SHA256 `32876751290ee5fc5705ed78313831b8cf978ceb4443895699d09218ece9c518`
- `src/content/service-catalog.json` — SHA256 `03a1537d2f43b5356c64c2502f597f16f3afc8498e111eb5234a16279e9fa008`
- `src/content/service-offers.json` — SHA256 `0d9882b1efba44d99d08cee3aafd46edeb2423f60301ca5043d2e515d7c5f17f`
- `scripts/build-agency-decks.py` — SHA256 `514fd24841383ffb3a6f504a92001f0492e156fefec852c220450644f4b79964`
