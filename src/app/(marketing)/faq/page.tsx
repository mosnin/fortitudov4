export const metadata = {
  title: "Frequently asked questions | Fortitudo Agency",
};
import { PageIntro } from "@/components/imageworks/page-intro";
import { Faq } from "@/components/imageworks/faq";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="Questions and answers"
        title="The practical details, before the project."
        lead="How pricing works, what you own, what we need from you, and what happens after launch."
      />
      <Faq />
      <FinalCta />
    </>
  );
}
