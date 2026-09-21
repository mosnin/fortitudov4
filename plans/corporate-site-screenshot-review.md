# Corporate site screenshot review

Build/revision: local production build after the 2026-09-21 corporate structure pass  
Routes and exclusions: `/industries`, `/industries/fintech`, `/careers`, `/language`; existing dashboard and client product excluded  
Viewports, themes and data states: desktop light marketing theme, drawer closed and open, Industries submenu open; deployed mobile review pending  
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
| Language page | `/language?from=/industries/fintech`, desktop | No | Accessibility tree confirmed the current path, English return link, eight named translation choices and machine translation disclosure. | Visual inspection is deferred to the deployed preview. | No | Blocked |

## Smaller components

| Parent / component / variant | Viewport / state | Context and close-up images opened | Visual observation / defect | Adjustment / unchanged reason | Fresh images opened / interaction checked | Shared consumers checked | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Drawer / Services disclosure | Desktop, collapsed | Yes | Label and plus affordance matched the supplied drawer scale. | Existing component structure retained. | Yes | Yes | Inspected unchanged |
| Drawer / Industries disclosure | Desktop, collapsed and expanded | Yes | Expanded links stayed grouped under the label and remained keyboard represented. | Reused the Services disclosure primitive. | Yes | Yes | Inspected unchanged |
| Footer / four link groups | Desktop | No | Accessibility tree confirmed every new destination and legal link. | Visual inspection is deferred to the deployed preview. | No | Yes | Blocked |
| Language / external translation links | Desktop | No | Links preserved the source path, named the destination language and opened Google Translate in a new tab. | No code change required after semantic review. | Interaction not opened because external translation availability was verified separately. | Yes | Blocked |

## Final sweep

- [ ] Final desktop and mobile screenshots opened after the last edit.
- [x] Main desktop layout relationships rechecked.
- [x] New drawer controls rechecked in context.
- [x] The observed invisible heading defect has a verified disposition.
- [x] Shared expansion and navigation changes were rechecked on Industries, Fintech and Careers.

Evidence: screenshots were opened through the local Chrome preview during implementation. The browser capture tool did not persist file artifacts in the repository.  
Remaining work: mobile, short-height, footer and Language visual checks on the deployed preview. Local Chrome also showed its expected Clerk production-key origin warning, which is specific to localhost and is not a page implementation failure.  
Review scope completed: no. The remaining rows require the deployed preview URL and are release checks, not skipped acceptance.

