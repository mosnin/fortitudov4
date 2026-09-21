import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/imageworks/hero";
import { Brief } from "@/components/imageworks/brief";
import { Variations } from "@/components/imageworks/variations";
import { Services } from "@/components/imageworks/services";
import { Testimonials } from "@/components/imageworks/testimonials";
import { Process } from "@/components/imageworks/process";
import { Pricing } from "@/components/imageworks/pricing";
import { Faq } from "@/components/imageworks/faq";
import { FinalCta } from "@/components/imageworks/final-cta";
export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/post-login");
  return (
    <>
      <Hero />
      <Brief />
      <Variations />
      <Services />
      <Testimonials />
      <Process />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
