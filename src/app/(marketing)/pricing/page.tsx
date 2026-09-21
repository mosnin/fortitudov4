export const metadata = { title: "Pricing | Fortitudo Agency" };
import { PageIntro } from "@/components/imageworks/page-intro";
import { Pricing } from "@/components/imageworks/pricing";
import { Process } from "@/components/imageworks/process";
import { Faq } from "@/components/imageworks/faq";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="Working together"
        title="A clear scope. A price you can decide on."
        lead="We quote the work after understanding what you need. Deliverables, milestones, exclusions and third-party costs belong in the proposal, before you commit."
      />
      <Pricing />
      <Process />
      <Faq />
      <FinalCta />
    </>
  );
}
