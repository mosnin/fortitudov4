export const metadata = { title: "Services | Fortitudo Agency" };
import { ServicePathways } from "@/components/imageworks/service-pathways";
import { PageIntro } from "@/components/imageworks/page-intro";
import { Services } from "@/components/imageworks/services";
import { Process } from "@/components/imageworks/process";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="Services"
        title="Choose the work your business needs."
        lead="Websites, ecommerce, software, AI, brand, Unslop, consultation and marketing. Explore the scope, the process and the relevant work before you ask for a proposal."
      />
      <ServicePathways />
      <Services />
      <Process />
      <FinalCta />
    </>
  );
}
