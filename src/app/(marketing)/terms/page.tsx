
export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 text-[14px] text-[var(--fx-muted)]">Last updated: March 2026</p>
          </div>
        </section>

        <section className="bg-[var(--fx-charcoal)] py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <div className="space-y-8 text-[var(--fx-muted)] text-[14px] leading-relaxed">
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">1. Services</h2>
                <p>Fortitudo Agency provides digital development services including web applications, ecommerce stores, sales funnels, AI automation, and Open Claw deployment. Services are defined during the onboarding process and confirmed upon payment.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">2. Account Registration</h2>
                <p>You must create an account to use our platform. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">3. Payment Terms</h2>
                <p>Payment is required before project work begins. Prices are as quoted during onboarding. Payments are processed through Creem.io. All fees are non-refundable unless otherwise stated in writing.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">4. Project Delivery</h2>
                <p>We will make reasonable efforts to deliver your project within the estimated timeline. Delivery timelines are estimates and may vary based on project complexity, revision requests, and client responsiveness in providing required materials.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">5. Revisions</h2>
                <p>Each plan includes a specified number of revision rounds. Revisions beyond your plan&apos;s allocation may incur additional charges. Revision requests must be submitted through the project dashboard.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">6. Intellectual Property</h2>
                <p>Upon full payment, you receive full ownership of all custom code, designs, and assets created specifically for your project. We retain the right to use anonymized project details in our portfolio unless you opt out in writing.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">7. Client Responsibilities</h2>
                <p>You are responsible for providing accurate project requirements, brand assets, content, and timely feedback. Delays in providing required materials may affect project timelines.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">8. Limitation of Liability</h2>
                <p>Fortitudo Agency&apos;s liability is limited to the amount paid for the specific service. We are not liable for indirect, incidental, or consequential damages arising from the use of our services or deliverables.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">9. Termination</h2>
                <p>Either party may terminate a project with written notice. In the event of termination, you will be billed for work completed up to the termination date. We reserve the right to terminate accounts that violate these terms.</p>
              </div>

              <div>
                <h2 className="text-[17px] font-semibold text-[var(--fx-white)]">10. Contact</h2>
                <p>For questions about these terms, contact us at hello@foritudo.agency.</p>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
