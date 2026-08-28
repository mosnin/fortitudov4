import type { Metadata } from "next";
import { LegalPage } from "@/components/shader/page-sections";
import { PageHero } from "@/components/shader/page-hero";

export const metadata: Metadata = { title: "Terms of Service — Fortitudo Agency" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" lead="Last updated: March 2026" />
      <LegalPage>
        <div><h2>1. Services</h2><p>Fortitudo Agency provides digital development services including websites, software solutions, AI solutions, consultation, and digital marketing. Services are defined during onboarding and confirmed upon payment.</p></div>
        <div><h2>2. Account Registration</h2><p>You must create an account to use our platform. You are responsible for maintaining the security of your account credentials and for all activity under your account. You must provide accurate and complete information.</p></div>
        <div><h2>3. Payment Terms</h2><p>Payment is required before project work begins. Prices are as quoted during onboarding. All fees are non-refundable unless otherwise stated in writing.</p></div>
        <div><h2>4. Project Delivery</h2><p>We make reasonable efforts to deliver within the estimated timeline. Timelines are estimates and may vary based on complexity, revision requests, and client responsiveness in providing required materials.</p></div>
        <div><h2>5. Revisions</h2><p>The scope approved before kickoff sets the revision rounds included in your fixed quote. Revisions beyond the agreed scope may incur additional charges and must be submitted through the project dashboard.</p></div>
        <div><h2>6. Intellectual Property</h2><p>Upon full payment, you receive full ownership of custom code, designs, and assets created specifically for your project. We may use anonymized project details in our portfolio unless you opt out in writing.</p></div>
        <div><h2>7. Client Responsibilities</h2><p>You are responsible for providing accurate requirements, brand assets, content, and timely feedback. Delays in providing required materials may affect project timelines.</p></div>
        <div><h2>8. Limitation of Liability</h2><p>Fortitudo Agency&rsquo;s liability is limited to the amount paid for the specific service. We are not liable for indirect, incidental, or consequential damages arising from the use of our services or deliverables.</p></div>
        <div><h2>9. Termination</h2><p>Either party may terminate a project with written notice. In the event of termination, you will be billed for work completed to the termination date. We may terminate accounts that violate these terms.</p></div>
        <div><h2>10. Contact</h2><p>For questions about these terms, contact us at hello@fortitudo.agency.</p></div>
      </LegalPage>
    </>
  );
}
