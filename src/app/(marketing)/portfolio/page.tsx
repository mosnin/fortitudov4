export const metadata = { title: "Portfolio | Fortitudo Agency" };
import { PageIntro } from "@/components/imageworks/page-intro";
import { Portfolio } from "@/components/imageworks/portfolio";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="Portfolio"
        title="Websites, software and AI in practice."
        lead="Browse the same eight projects in our selected work, then open a case study for the details."
      />
      <Portfolio />
      <FinalCta />
    </>
  );
}
