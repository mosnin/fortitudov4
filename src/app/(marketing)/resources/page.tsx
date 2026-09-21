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
        label="Resources"
        title="The details behind the work."
        lead="Explore what we can build, how an engagement works and what your team takes away. Read the service pitches here or download them to share. No form required."
      />
      <ResourceCards />
      <FinalCta />
    </>
  );
}
