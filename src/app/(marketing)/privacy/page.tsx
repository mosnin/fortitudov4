
export default function PrivacyPage() {
  return (
    <>
        <section className="relative overflow-hidden border-b border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] pt-32 pb-16 sm:pt-40 sm:pb-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,rgba(248,205,2,0.08),transparent_55%)]"
          />
          <div className="relative z-10 mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-10">
            <p
              style={{ fontFamily: 'var(--font-mono)' }}
              className="text-[11px] tracking-[0.18em] text-[var(--fx-faint)] uppercase"
            >
              Legal
            </p>
            <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-[var(--fx-white)]">
              Privacy Policy
            </h1>
            <p className="mt-4 text-[14px] text-[var(--fx-muted)]">Last updated: March 2026</p>
          </div>
        </section>

        <section className="bg-[var(--fx-charcoal)] py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm max-w-none">
            <div className="space-y-8 text-[var(--fx-muted)] text-[14px] leading-relaxed">
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">1. Information We Collect</h2>
                <p>We collect information you provide directly, including your name, email address, business information, and project details submitted through our onboarding forms. We also collect usage data through cookies and analytics to improve our service.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">2. How We Use Your Information</h2>
                <p>Your information is used to provide our services, communicate about your projects, process payments, send relevant updates, and improve our platform. We do not sell your personal information to third parties.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">3. Authentication & Data Security</h2>
                <p>We use Clerk for authentication, which handles your login credentials securely. Payment processing is handled by Creem.io with industry-standard encryption. Your project files are stored securely and are only accessible to you and authorized team members.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">4. Data Storage</h2>
                <p>Your data is stored on secure servers provided by Neon (PostgreSQL) and Vercel. We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">5. Third-Party Services</h2>
                <p>We use third-party services including Clerk (authentication), Creem.io (payments), Neon (database), Vercel (hosting), and Uploadthing (file uploads). Each service has its own privacy policy governing their use of your data.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">6. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data. You may also request a copy of your data or opt out of non-essential communications. Contact us at hello@foritudo.agency for any privacy-related requests.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">7. Contact</h2>
                <p>For questions about this privacy policy, contact us at hello@foritudo.agency.</p>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
