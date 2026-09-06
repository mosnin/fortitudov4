import type { Metadata } from "next";
import { PageHero } from "@/components/shader/page-hero";
import { SectionIntro } from "@/components/shader/page-sections";
import { FinalCta } from "@/components/shader/final-cta";
import { WORK_PROJECTS } from "@/lib/work-projects";

export const metadata: Metadata = {
  title: "About — Fortitudo Agency",
  description: "Fortitudo is a digital agency delivering websites, ecommerce stores, custom software, AI agents, and technical consultation. Explore the work and delivery process.",
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
        title="A digital agency for design and development."
        lead="We scope, design, build, and launch websites, ecommerce stores, custom software, and AI agents. Technical consultation is available before a build or as a separate engagement."
        cta={{ label: "Talk through your project", href: "/contact" }}
        secondaryCta={{ label: "See our work", href: "/work" }}
      />
      <section className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1680px]">
          <SectionIntro
            eyebrow="The team behind the work"
            title="Evaluate the work before choosing the agency."
            body="Our published projects include Nourish Reserve's storefront, Stored's shared-memory product, and Govern's agent-permissions software. Open the project pages to see their purpose and public sites."
          />
          <div className="mt-16 grid grid-cols-12 gap-8 border-y border-foreground/15 py-10 max-[850px]:grid-cols-1">
            <div className="col-span-4 max-[850px]:col-span-1"><p className="text-6xl font-medium tracking-tight">{WORK_PROJECTS.length} projects</p><p className="mt-3 text-base text-foreground/75">In our published portfolio.</p></div>
            <div className="col-span-4 max-[850px]:col-span-1"><p className="text-6xl font-medium tracking-tight">Design + build</p><p className="mt-3 text-base text-foreground/75">From page structure and interface design to integrations and launch.</p></div>
            <p className="col-span-4 self-center text-lg leading-relaxed text-foreground/75 max-[850px]:col-span-1">A proposal defines the deliverables, technical dependencies, review milestones, and price. Changes are discussed before they become extra work.</p>
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
            <p className="text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.95] tracking-tight">A tested build and a documented handover.</p>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground/75">The agreed code, design files, account access, and operating documentation. We identify third-party licenses and ongoing platform costs in the scope.</p>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
