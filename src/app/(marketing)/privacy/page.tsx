/**
 * `/privacy`. A legal page is still the logged-out surface: the same hero
 * rhythm, the same display step, and the same eyebrow every other sub-page
 * uses. It carried its own raw `<h1>` and a hand-written mono label before,
 * which is how it ended up a size the ladder does not have.
 *
 * It then carried its own HERO. `/privacy` and `/terms` were the last two
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

export default function PrivacyPage() {
  return (
    <>
        <PageHero eyebrow="Legal" title="Privacy Policy" lead="Last updated: March 2026" seed={6} />

        <section className={`bg-[var(--fx-charcoal)] ${SECTION_Y_TIGHT}`}>
          {/* No `prose`: it is a second type ladder, and it was quietly
              resizing these headings out of the site's scale. */}
          <Band narrow="max-w-3xl">
            <div className={`space-y-8 text-[var(--fx-muted)] ${BODY}`}>
              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  1. Information We Collect
                </Serif>
                <p>We collect information you provide directly, including your name, email address, business information, and project details submitted through our onboarding forms. We also collect usage data through cookies and analytics to improve our service.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  2. How We Use Your Information
                </Serif>
                <p>Your information is used to provide our services, communicate about your projects, process payments, send relevant updates, and improve our platform. We do not sell your personal information to third parties.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  3. Authentication & Data Security
                </Serif>
                <p>We use Clerk for authentication, which handles your login credentials securely. Payment processing is handled by Creem.io with industry-standard encryption. Your project files are stored securely and are only accessible to you and authorized team members.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  4. Data Storage
                </Serif>
                <p>Your data is stored on secure servers provided by Neon (PostgreSQL) and Vercel. We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  5. Third-Party Services
                </Serif>
                <p>We use third-party services including Clerk (authentication), Creem.io (payments), Neon (database), Vercel (hosting), and Uploadthing (file uploads). Each service has its own privacy policy governing their use of your data.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  6. Your Rights
                </Serif>
                <p>You have the right to access, correct, or delete your personal data. You may also request a copy of your data or opt out of non-essential communications. Contact us at hello@fortitudo.agency for any privacy-related requests.</p>
              </div>

              <div className="space-y-3">
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  7. Contact
                </Serif>
                <p>For questions about this privacy policy, contact us at hello@fortitudo.agency.</p>
              </div>
            </div>
          </Band>
        </section>
    </>
  );
}
