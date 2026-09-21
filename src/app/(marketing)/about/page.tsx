export const metadata = { title: "About | Fortitudo Agency" };
import { PageIntro } from "@/components/imageworks/page-intro";
import { Process } from "@/components/imageworks/process";
import { Testimonials } from "@/components/imageworks/testimonials";
import { Services } from "@/components/imageworks/services";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Page() {
  return (
    <>
      <PageIntro
        label="About Fortitudo"
        title="The people you brief are the people you build with."
        lead="Fortitudo brings design, development and technical advice into one agency. We help you decide what to build, make the work visible, and prepare your team to take it over."
      />
      <Process />
      <Testimonials />
      <Services />
      <FinalCta />
    </>
  );
}
