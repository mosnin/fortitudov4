import type { Metadata } from "next";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  EditorialClose,
  EditorialHero,
  IndustryIndex,
} from "@/components/imageworks/expansion";

export const metadata: Metadata = {
  title: "Industries | Fortitudo",
  description:
    "Digital products, websites, commerce, integrations and AI for fintech, retail, hospitality, logistics and real estate teams.",
  alternates: { canonical: "https://www.fortitudo.agency/industries" },
};

export default function IndustriesPage() {
  return (
    <LibraryMotion>
      <EditorialHero
        label="Industries"
        title="Digital work shaped by the business around it."
        lead="The same technology behaves differently inside a financial product, a retail operation or a property workflow. Explore how we approach the systems, handoffs and responsibilities in your sector."
      />
      <IndustryIndex />
      <EditorialClose title="Bring us the business problem, the systems and the constraints." />
    </LibraryMotion>
  );
}
