# Corporate site screenshot review

Build/revision: Vercel preview for commit `640918f` after the 2026-09-21 corporate structure pass  
Routes and exclusions: `/industries`, `/industries/fintech`, `/careers`, `/language`; existing dashboard and client product excluded  
Viewports, themes and data states: desktop; 390 by 844 mobile; 390 by 667 short mobile; drawer closed, open and scrolled; Industries submenu open  
Reviewer: Codex self-review

## Main components

| Main component | Route / viewport / state | Before image opened | Visual observation / defect | Adjustment / unchanged reason | After image opened | Final status |
| --- | --- | --- | --- | --- | --- | --- |
| Industries hero and directory | `/industries`, desktop, closed drawer | Yes | Hero retained the established hierarchy. Industry rows were legible and consistently aligned. | Existing Imageworks composition retained. | Yes | Inspected unchanged |
| Drawer navigation | `/industries`, desktop, open | Yes | Primary links, both disclosure labels and secondary links fit the scrollable drawer. The first capture was taken before the entrance animation settled. | Rechecked after the animation completed. | Yes | Inspected unchanged |
| Industries submenu | `/industries`, desktop, expanded | Yes | All five industry links appeared in one focused group below the directory link. | Existing accordion structure retained. | Yes | Inspected unchanged |
| Industry hero | `/industries/fintech`, desktop | Yes | Long title remained readable in four lines and kept the lead and CTA as the second priority. | Existing editorial hero retained. | Yes | Inspected unchanged |
| Industry priorities | `/industries/fintech`, desktop | Yes | The scroll reveal could leave the section title invisible, creating an unexplained empty gap. | Removed the fragile reveal attribute from the new priorities heading. | Yes | Verified fixed |
| Delivery sequence | `/industries/fintech`, desktop, scrolled | Yes | Stacked panel type, inclusion list and spacing matched existing service pages. | Existing supplied stacked panel retained. | Yes | Inspected unchanged |
| Careers hero and content | `/careers`, desktop | Yes | Hero, work principles, truthful empty openings state and recruitment questions followed a clear reading order. | Existing editorial components retained. | Yes | Inspected unchanged |
| Language page | `/language?from=/industries/fintech`, 390 by 844 | Yes | Hero disclosure, English return path and the multilingual link list remained readable at mobile width. | Existing editorial hero and row structure retained. | Yes | Inspected unchanged |
| Mobile Industries hero and directory | `/industries`, 390 by 844 | Yes | The animated heading was clipped during the entrance sequence, then settled into a readable four-line title without overflow. Directory semantics and order remained intact. | Rechecked after motion settled; no persistent defect. | Yes | Inspected unchanged |
| Mobile industry page | `/industries/fintech`, 390 by 844 | Yes | Long hero title wrapped without overflow. All three delivery stages became normal stacked cards with readable inclusion lists. | Existing mobile stacked-panel adaptation retained. | Yes | Inspected unchanged |
| Short mobile drawer | `/industries`, 390 by 667, open and scrolled | Yes | Primary links fit the first view and the drawer scrolled to Careers, Language, client sign-in and email. | Existing overflow behavior retained. | Yes | Inspected unchanged |

## Smaller components

| Parent / component / variant | Viewport / state | Context and close-up images opened | Visual observation / defect | Adjustment / unchanged reason | Fresh images opened / interaction checked | Shared consumers checked | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Drawer / Services disclosure | Desktop, collapsed | Yes | Label and plus affordance matched the supplied drawer scale. | Existing component structure retained. | Yes | Yes | Inspected unchanged |
| Drawer / Industries disclosure | Desktop, collapsed and expanded | Yes | Expanded links stayed grouped under the label and remained keyboard represented. | Reused the Services disclosure primitive. | Yes | Yes | Inspected unchanged |
| Footer / four link groups | 390 by 844 | Yes | Four groups formed a readable two-column layout; longer labels wrapped without overlap and legal links remained reachable. | Existing footer grid retained with two columns. | Yes | Yes | Inspected unchanged |
| Language / external translation links | 390 by 844 | Yes | Links preserved the source path, named the destination language and provider, and used native script labels where applicable. | No code change required after semantic and visual review. | Yes; external URL availability was verified separately. | Yes | Inspected unchanged |

## Final sweep

- [x] Final desktop and mobile screenshots opened after the last edit.
- [x] Main desktop layout relationships rechecked.
- [x] New drawer controls rechecked in context.
- [x] The observed invisible heading defect has a verified disposition.
- [x] Shared expansion and navigation changes were rechecked on Industries, Fintech and Careers.

Evidence: screenshots were opened through local Chrome and the deployed Vercel preview during implementation. The browser capture tool did not persist file artifacts in the repository.  
Remaining work: representative-user validation has not been run. This is a self-review of the requested marketing scope.  
Review scope completed: yes for the requested pages and navigation states. The review does not claim whole-product or user-study acceptance.
