import { PageIntro } from "@/components/imageworks/page-intro";
import { ResourceCards } from "@/components/imageworks/resource-cards";
import { FinalCta } from "@/components/imageworks/final-cta";
export const metadata = {
  title: "Resources — Fortitudo service pitches",
  description:
    "Explore and download Fortitudo service pitches for websites, ecommerce, software, AI, brand, Unslop, consultation and marketing.",
  alternates: { canonical: "/resources" },
};
export default function Resources() {
  return (
    <>
      <PageIntro
        label="Service pitch decks"
        title="Bring the right proposal to the table."
        lead="Detailed presentations for every service. Explore the scope, deliverables, review process and handover, then download the PDF to share with your team. No form required."
      />
      <ResourceCards />
      <FinalCta />
    </>
  );
}
