import type { Metadata } from "next";
import { PageIntro } from "@/components/imageworks/page-intro";
import { FinalCta } from "@/components/imageworks/final-cta";
import { IndustryDirectory } from "@/components/imageworks/industry-content";
import { INDUSTRIES } from "@/content/industries";

export const metadata: Metadata = {
  title: "Industries | Fortitudo",
  description:
    "Digital products, websites, commerce, integrations and AI for fintech, retail, hospitality, logistics and real estate teams.",
  alternates: { canonical: "https://www.fortitudo.agency/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageIntro
        label="Industries"
        title="Digital work shaped by the business around it."
        lead="The same technology behaves differently inside a financial product, a retail operation or a property workflow. Explore how we approach the systems, handoffs and responsibilities in your sector."
      />
      <IndustryDirectory industries={INDUSTRIES} />
      <FinalCta />
    </>
  );
}
