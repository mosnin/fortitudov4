import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Faq } from "@/components/shader/faq";
import { FinalCta } from "@/components/shader/final-cta";
import { HeroExperience } from "@/components/shader/hero-experience";
import { Partners } from "@/components/shader/partners";
import { Pillars } from "@/components/shader/pillars";
import { Pricing } from "@/components/shader/pricing";
import { Product } from "@/components/shader/product";
import { ValueProp } from "@/components/shader/value-prop";

export default async function MarketingHomePage() {
  const { userId } = await auth();
  if (userId) redirect("/post-login");

  return (
    <>
      <HeroExperience />
      <ValueProp />
      <Product />
      <Pillars />
      <Partners />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
