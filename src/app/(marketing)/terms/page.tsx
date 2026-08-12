/**
 * `/terms`. A legal page is still the logged-out surface: the same hero
 * rhythm, the same display step, and the same eyebrow every other sub-page
 * uses. It carried its own raw `<h1>` and a hand-written mono label before,
 * which is how it ended up a size the ladder does not have.
 */

import { Band, Serif } from '@/components/marketing/giga/primitives';
import { DISPLAY_L, EYEBROW_TEXT, HERO_Y, MONO_STYLE, SECTION_Y_TIGHT, TITLE_S } from '@/components/marketing/giga/tokens';

export default function TermsPage() {
  return (
    <>
        <section
          className={`relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${HERO_Y}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.10),transparent_55%)]"
          />
          <Band innerClassName="relative max-w-3xl">
            <p style={MONO_STYLE} className={EYEBROW_TEXT}>
              Legal
            </p>
            <Serif as="h1" className={`mt-5 ${DISPLAY_L} text-[var(--fx-white)]`}>
              Terms of Service
            </Serif>
            <p className="mt-4 text-[14px] text-[var(--fx-muted)]">Last updated: March 2026</p>
          </Band>
        </section>

        <section className={`bg-[var(--fx-charcoal)] ${SECTION_Y_TIGHT}`}>
          <Band innerClassName="max-w-3xl">
            <div className="space-y-8 text-[var(--fx-muted)] text-[14px] leading-relaxed">
              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  1. Services
                </Serif>
                <p>Fortitudo Agency provides digital development services including web applications, ecommerce stores, sales funnels, AI automation, and Open Claw deployment. Services are defined during the onboarding process and confirmed upon payment.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  2. Account Registration
                </Serif>
                <p>You must create an account to use our platform. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  3. Payment Terms
                </Serif>
                <p>Payment is required before project work begins. Prices are as quoted during onboarding. Payments are processed through Creem.io. All fees are non-refundable unless otherwise stated in writing.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  4. Project Delivery
                </Serif>
                <p>We will make reasonable efforts to deliver your project within the estimated timeline. Delivery timelines are estimates and may vary based on project complexity, revision requests, and client responsiveness in providing required materials.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  5. Revisions
                </Serif>
                <p>Each plan includes a specified number of revision rounds. Revisions beyond your plan&apos;s allocation may incur additional charges. Revision requests must be submitted through the project dashboard.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  6. Intellectual Property
                </Serif>
                <p>Upon full payment, you receive full ownership of all custom code, designs, and assets created specifically for your project. We retain the right to use anonymized project details in our portfolio unless you opt out in writing.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  7. Client Responsibilities
                </Serif>
                <p>You are responsible for providing accurate project requirements, brand assets, content, and timely feedback. Delays in providing required materials may affect project timelines.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  8. Limitation of Liability
                </Serif>
                <p>Fortitudo Agency&apos;s liability is limited to the amount paid for the specific service. We are not liable for indirect, incidental, or consequential damages arising from the use of our services or deliverables.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  9. Termination
                </Serif>
                <p>Either party may terminate a project with written notice. In the event of termination, you will be billed for work completed up to the termination date. We reserve the right to terminate accounts that violate these terms.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  10. Contact
                </Serif>
                <p>For questions about these terms, contact us at hello@fortitudo.agency.</p>
              </div>
            </div>
          </Band>
        </section>
    </>
  );
}
