import { PageHero } from "@/components/shader/page-hero";
import { CtaBand } from "@/components/shader/page-sections";
import { Faq } from "@/components/shader/faq";

export default function FAQPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title={<>Questions, <span className="text-[#f8cd02]">answered.</span></>} lead="What people ask before they trust us with a website, software product, AI build, or campaign." cta={{ label: "Ask us directly", href: "/contact" }} />
      <Faq heading="The practical details, in plain English." lead="Price, ownership, changes, AI, and what it is like to follow the work." />
      <CtaBand title="Still have a question? Ask the people who will build it." />
    </>
  );
}
