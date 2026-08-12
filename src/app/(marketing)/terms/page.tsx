/**
 * `/terms`. A legal page is still the logged-out surface: the same hero
 * rhythm, the same display step, and the same eyebrow every other sub-page
 * uses. It carried its own raw `<h1>` and a hand-written mono label before,
 * which is how it ended up a size the ladder does not have.
 *
 * It then carried its own HERO. `/terms` and `/privacy` were the last two
 * pages hand-rolling the yellow-radial block `PageHero` replaced on the other
 * six — no dot-matrix field, no dotted eyebrow, and a `Band innerClassName`
 * that set `max-w-3xl` on the inner element, which is twMerge, so it kept
 * `mx-auto` and quietly centred the whole hero column while the sections below
 * it sat at the 40px gutter. Both pages now render `PageHero` with the same
 * strings they already had; "Last updated" is its `lead`.
 *
 * Each numbered section is a heading plus one paragraph. They were siblings in
 * a `space-y-8` block with NOTHING between them, so the 17px heading sat flush
 * on its 14px body and the two read as one run of text. The inner wrapper now
 * carries `space-y-3` — the same step every other TITLE_S-over-body pair on the
 * surface uses — and `space-y-8` goes on doing the one job it had.
 */

import { Band, Serif } from '@/components/marketing/giga/primitives';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { BODY, SECTION_Y_TIGHT, TITLE_S } from '@/components/marketing/giga/tokens';

export default function TermsPage() {
  return (
    <>
        <PageHero eyebrow="Legal" title="Terms of Service" lead="Last updated: March 2026" seed={7} />

        <section className={`bg-[var(--fx-charcoal)] ${SECTION_Y_TIGHT}`}>
          <Band innerClassName="max-w-3xl">
            <div className={`space-y-8 text-[var(--fx-muted)] ${BODY}`}>
              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  1. Services
                </Serif>
                {/* The enumeration lists the five offerings in
                    `src/lib/services.ts`. It previously named sales funnels
                    and "Open Claw deployment", which we do not sell — a
                    contract cannot promise services that do not exist. Only
                    this sentence's service list changed. */}
                <p>Fortitudo Agency provides digital development services including websites, software solutions, AI solutions, consultation, and digital marketing. Services are defined during the onboarding process and confirmed upon payment.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  2. Account Registration
                </Serif>
                <p>You must create an account to use our platform. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  3. Payment Terms
                </Serif>
                <p>Payment is required before project work begins. Prices are as quoted during onboarding. Payments are processed through Creem.io. All fees are non-refundable unless otherwise stated in writing.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  4. Project Delivery
                </Serif>
                <p>We will make reasonable efforts to deliver your project within the estimated timeline. Delivery timelines are estimates and may vary based on project complexity, revision requests, and client responsiveness in providing required materials.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  5. Revisions
                </Serif>
                <p>The scope you approve before kickoff sets the revision rounds included in your fixed quote. Revisions beyond that agreed scope may incur additional charges. Revision requests must be submitted through the project dashboard.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  6. Intellectual Property
                </Serif>
                <p>Upon full payment, you receive full ownership of all custom code, designs, and assets created specifically for your project. We retain the right to use anonymized project details in our portfolio unless you opt out in writing.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  7. Client Responsibilities
                </Serif>
                <p>You are responsible for providing accurate project requirements, brand assets, content, and timely feedback. Delays in providing required materials may affect project timelines.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  8. Limitation of Liability
                </Serif>
                <p>Fortitudo Agency&apos;s liability is limited to the amount paid for the specific service. We are not liable for indirect, incidental, or consequential damages arising from the use of our services or deliverables.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  9. Termination
                </Serif>
                <p>Either party may terminate a project with written notice. In the event of termination, you will be billed for work completed up to the termination date. We reserve the right to terminate accounts that violate these terms.</p>
              </div>

              <div className="space-y-3">
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
