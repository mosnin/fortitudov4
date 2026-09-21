export const metadata = { title: "Our work | Fortitudo Agency" };
import { PageIntro } from "@/components/imageworks/page-intro";
import { Formats } from "@/components/imageworks/formats";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="Selected work"
        title="See what we have worked on."
        lead="From online stores to AI products. Explore the businesses, the briefs and the work behind them."
      />
      <Formats />
      <FinalCta />
    </>
  );
}
