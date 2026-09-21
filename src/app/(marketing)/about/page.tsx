import { ArrowButton } from "@/components/imageworks/arrow-button";
import Image from "next/image";
import { PageIntro } from "@/components/imageworks/page-intro";
import { Process } from "@/components/imageworks/process";
import { FinalCta } from "@/components/imageworks/final-cta";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { StudioStandard } from "@/components/imageworks/studio-standard";
export const metadata = {
  title: "About — Fortitudo Agency",
  description:
    "Meet Fortitudo and founder Preston Wilms. More than a decade building websites, running campaigns and growing businesses, now brought together with software and applied AI.",
};
const principles = [
  [
    "One coherent experience",
    "Your identity, marketing website, store or application should belong to the same business. We consider the complete journey, including the less visible details that make it work.",
  ],
  [
    "Decisions you can inspect",
    "Scope, design and working software move through agreed reviews. You can see the choices being made and resolve questions while the work is taking shape.",
  ],
  [
    "A business asset you own",
    "For custom software, the engagement includes frontend and backend deployment assistance, source code and a practical handover. Your data and deployment accounts remain yours. The agreement identifies third-party licenses and the transfer of commissioned work.",
  ],
  [
    "Support by choice",
    "We can continue with a scoped care or improvement retainer. Ownership does not depend on buying ongoing support, and future work is a separate decision.",
  ],
];
export default function About() {
  return (
    <>
      <PageIntro
        label="About Fortitudo"
        title="Built on experience. Made for what comes next."
        lead="For more than a decade, we have been building websites, running advertising campaigns and helping businesses scale. Fortitudo brings that experience together across brand, commerce, software and applied AI."
      />
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e4e4e4]">
              <Image src="/about/fortitudo-in-hand.webp" alt="A hand holding a glass card bearing the Fortitudo mark." fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="max-w-xl">
              <h2 className="text-4xl leading-tight tracking-tight">
                An eye for the brand.
                <br />A mind for the business.
              </h2>
              <p className="mt-7 text-base leading-8 text-muted-foreground">
                A business takes shape in many places: the first impression,
                the product, the campaign and the experience that follows.
                We bring those pieces into the same conversation, connecting
                considered design with the systems that help a business work.
              </p>
              <p className="mt-5 text-base leading-8 text-muted-foreground">Our work spans websites and ecommerce, complete software products, brand identities and applied AI. Whether we are shaping a new idea or improving something already in motion, the aim is the same: useful work, carefully made, with a clear path from the brief to the handover.</p>
              <ArrowButton href="/work" className="mt-8 text-sm">Explore our work</ArrowButton>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="founder-heading" className="py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-24">
          <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-full md:max-w-[240px]">
            <Image src="/about/preston-wilms.jpg" alt="Preston Wilms, founder of Fortitudo." fill sizes="(min-width: 768px) 240px, 200px" className="rounded-full object-cover scale-[1.035]" />
          </div>
          <div>
            <p className="mb-5 text-sm text-muted-foreground">About the founder</p>
            <h2 id="founder-heading" className="text-4xl leading-tight tracking-tight sm:text-5xl">Preston Wilms</h2>
            <p className="mt-7 text-lg leading-8">A decade spent building businesses, finding audiences and turning ideas into things people use.</p>
            <p className="mt-5 text-base leading-8 text-muted-foreground">Over the past decade, Preston has generated nearly one billion social media impressions across his own ventures and his clients’ brands. Along the way, he has built dozens of software projects and ecommerce brands, working across the creative, commercial and technical sides of bringing a business to life.</p>
            <p className="mt-5 text-base leading-8 text-muted-foreground">Fortitudo brings that experience into one practice. Brand and design sit alongside development, advertising and the practical application of AI, with attention to how each decision serves the business behind it.</p>
            <ArrowButton href="https://www.linkedin.com/in/preston-wilms-6967a4192/" target="_blank" rel="noopener noreferrer" className="mt-7">Connect with Preston on LinkedIn <span className="sr-only"> (opens in a new tab)</span></ArrowButton>
          </div>
        </div>
      </section>
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionHeading
            id="principles-heading"
            title="What you can expect from us."
          />
          <div className="mt-12 grid gap-x-16 md:grid-cols-2">
            {principles.map(([title, body]) => (
              <article key={title} className="border-t border-border py-8">
                <h3 className="text-2xl tracking-tight">{title}</h3>
                <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Process />
      <StudioStandard />
      <FinalCta />
    </>
  );
}
