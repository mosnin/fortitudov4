import type { Metadata } from "next";
import { PageHero } from "@/components/shader/page-hero";
import { SectionIntro } from "@/components/shader/page-sections";
import { FinalCta } from "@/components/shader/final-cta";

export const metadata: Metadata = {
  title: "About — Fortitudo Agency",
  description: "10+ years. Hundreds of complex builds. Fortitudo brings the design and engineering experience to turn your next business move into a working product.",
};

const beliefs = [
  ["We get close to the business.", "A good brief starts with how you make money, how customers find you, and what is slowing your team down. Understanding that comes before choosing the technology."],
  ["We take responsibility for the whole build.", "Design and engineering work together. You speak with the people doing the work and see progress while it happens, so the details get resolved before they become launch-day problems."],
  ["We make sure you can run with it.", "The finished work belongs to you. We hand over the code, assets, access, and documentation your team needs to use it, maintain it, and take it further."],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Fortitudo"
        title={<>There is a lot riding on <span className="text-[#f8cd02]">your next build.</span></>}
        lead="Your customers will use it. Your team will depend on it. Your business needs it to work. We bring 10+ years of experience and hundreds of complex builds to the table."
        cta={{ label: "Talk through your project", href: "/contact" }}
        secondaryCta={{ label: "See our work", href: "/work" }}
      />
      <section className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1680px]">
          <SectionIntro
            eyebrow="The team behind the work"
            title="Big ambitions need people who know how to deliver."
            body="A new storefront. A software product. A better way for your team to work. Whatever you are building, the hard part is getting every detail to work together. That is the work we have spent more than a decade doing."
          />
          <div className="mt-16 grid grid-cols-12 gap-8 border-y border-foreground/15 py-10 max-[850px]:grid-cols-1">
            <div className="col-span-4 max-[850px]:col-span-1"><p className="text-6xl font-medium tracking-tight">10+ years</p><p className="mt-3 text-base text-foreground/75">Of turning business problems into working products.</p></div>
            <div className="col-span-4 max-[850px]:col-span-1"><p className="text-6xl font-medium tracking-tight">Hundreds</p><p className="mt-3 text-base text-foreground/75">Of complex builds across brands, software, and business systems.</p></div>
            <p className="col-span-4 self-center text-lg leading-relaxed text-foreground/75 max-[850px]:col-span-1">That experience matters when a project gets complicated. We know how to ask the right questions, make the tradeoffs, and keep the work moving toward launch.</p>
          </div>
          <div className="mt-20 grid gap-5 lg:grid-cols-3">
            {beliefs.map(([title, body], index) => (
              <article key={title} className={`flex min-h-[360px] flex-col justify-between rounded-2xl p-8 ${index === 0 ? "bg-accent text-accent-foreground" : "bg-foreground/[0.04]"}`}>
                <span className="font-mono text-xs tracking-[0.2em] opacity-70">0{index + 1}</span>
                <div className="mt-12"><h2 className="text-2xl font-medium tracking-tight">{title}</h2><p className="mt-4 text-sm leading-relaxed opacity-75">{body}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#0a0a0c] px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1680px] grid-cols-12 gap-8 max-[850px]:grid-cols-1">
          <p className="col-span-4 font-mono text-xs uppercase tracking-[0.2em] text-foreground/70 max-[850px]:col-span-1">What you leave with</p>
          <div className="col-span-8 max-[850px]:col-span-1">
            <p className="text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.95] tracking-tight">Something your business can <span className="text-accent">move forward with.</span></p>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground/75">A customer journey that makes sense. Tools your team can rely on. A launch you can stand behind. We build around what changes for your business when the work goes live.</p>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
