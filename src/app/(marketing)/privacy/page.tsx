import type { Metadata } from "next";
import { LegalPage } from "@/components/shader/page-sections";
import { PageHero } from "@/components/shader/page-hero";

export const metadata: Metadata = { title: "Privacy Policy — Fortitudo Agency" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" lead="Last updated: March 2026" />
      <LegalPage>
        <div><h2>1. Information We Collect</h2><p>We collect information you provide directly, including your name, email address, business information, and project details submitted through our onboarding forms. We also collect usage data through cookies and analytics to improve our service.</p></div>
        <div><h2>2. How We Use Your Information</h2><p>Your information is used to provide our services, communicate about your projects, process payments, send relevant updates, and improve our platform. We do not sell your personal information to third parties.</p></div>
        <div><h2>3. Authentication &amp; Data Security</h2><p>We use Clerk for authentication, which handles your login credentials securely. Payment processing uses industry-standard encryption. Your project files are stored securely and are only accessible to you and authorized team members.</p></div>
        <div><h2>4. Data Storage</h2><p>Your data is stored on secure infrastructure. We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.</p></div>
        <div><h2>5. Third-Party Services</h2><p>We use third-party services for authentication, payments, database infrastructure, hosting, and file uploads. Each service has its own privacy policy governing its use of your data.</p></div>
        <div><h2>6. Your Rights</h2><p>You have the right to access, correct, or delete your personal data. You may also request a copy of your data or opt out of non-essential communications. Contact us at hello@fortitudo.agency for any privacy-related request.</p></div>
        <div><h2>7. Contact</h2><p>For questions about this privacy policy, contact us at hello@fortitudo.agency.</p></div>
      </LegalPage>
    </>
  );
}
