import { Hero } from "@/components/imageworks/hero";
import { Brief } from "@/components/imageworks/brief";
import { Variations } from "@/components/imageworks/variations";
import { Capabilities } from "@/components/imageworks/capabilities";
import { Formats } from "@/components/imageworks/formats";
import { Testimonials } from "@/components/imageworks/testimonials";
import { Pricing } from "@/components/imageworks/pricing";
import { Faq } from "@/components/imageworks/faq";
import { FinalCta } from "@/components/imageworks/final-cta";
export default function Home() {
  return <><span id="top" className="sr-only" /><Hero /><Brief /><Variations /><Capabilities /><Formats /><Testimonials /><Pricing /><Faq /><FinalCta /></>;
}
