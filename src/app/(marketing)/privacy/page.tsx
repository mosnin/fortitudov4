/**
 * `/privacy`. A legal page is still the logged-out surface: the same hero
 * rhythm, the same display step, and the same eyebrow every other sub-page
 * uses. It carried its own raw `<h1>` and a hand-written mono label before,
 * which is how it ended up a size the ladder does not have.
 */

import {
  Band,
  Serif,
  MONO_STYLE,
  EYEBROW_TEXT,
  DISPLAY_L,
  TITLE_S,
  HERO_Y,
  SECTION_Y_TIGHT,
} from '@/components/marketing/giga/primitives';

export default function PrivacyPage() {
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
              Privacy Policy
            </Serif>
            <p className="mt-4 text-[14px] text-[var(--fx-muted)]">Last updated: March 2026</p>
          </Band>
        </section>

        <section className={`bg-[var(--fx-charcoal)] ${SECTION_Y_TIGHT}`}>
          {/* No `prose`: it is a second type ladder, and it was quietly
              resizing these headings out of the site's scale. */}
          <Band innerClassName="max-w-3xl">
            <div className="space-y-8 text-[var(--fx-muted)] text-[14px] leading-relaxed">
              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  1. Information We Collect
                </Serif>
                <p>We collect information you provide directly, including your name, email address, business information, and project details submitted through our onboarding forms. We also collect usage data through cookies and analytics to improve our service.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  2. How We Use Your Information
                </Serif>
                <p>Your information is used to provide our services, communicate about your projects, process payments, send relevant updates, and improve our platform. We do not sell your personal information to third parties.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  3. Authentication & Data Security
                </Serif>
                <p>We use Clerk for authentication, which handles your login credentials securely. Payment processing is handled by Creem.io with industry-standard encryption. Your project files are stored securely and are only accessible to you and authorized team members.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  4. Data Storage
                </Serif>
                <p>Your data is stored on secure servers provided by Neon (PostgreSQL) and Vercel. We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  5. Third-Party Services
                </Serif>
                <p>We use third-party services including Clerk (authentication), Creem.io (payments), Neon (database), Vercel (hosting), and Uploadthing (file uploads). Each service has its own privacy policy governing their use of your data.</p>
              </div>

              <div>
                <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
                  6. Your Rights
                </Serif>
                <p>You have the right to access, correct, or delete your personal data. You may also request a copy of your data or opt out of non-essential communications. Contact us at hello@fortitudo.agency for any privacy-related requests.</p>
              </div>

              <div>
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
