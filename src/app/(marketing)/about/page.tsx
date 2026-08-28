import type { Metadata } from "next";
import { PageHero } from "@/components/shader/page-hero";
import { CtaBand, SectionIntro } from "@/components/shader/page-sections";

export const metadata: Metadata = { title: "About — Fortitudo Agency", description: "Fortitudo is a senior digital agency built around fixed prices, visible work, and complete ownership at launch." };

const beliefs = [
  ["The builder should be in the room", "The person making the work should hear the problem directly and answer questions without a chain of account managers."],
  ["The work should be visible", "A client should be able to see the current stage, decisions, files, and progress without waiting for a weekly status call."],
  ["Ownership should be complete", "The code, design files, campaigns, domains, and logins should be handed over cleanly when the build launches."],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Fortitudo" title={<>Agency work, <span className="text-[#f8cd02]">without the fog.</span></>} lead="Senior builders, clear scopes, work you can watch, and a finished product that belongs to you." cta={{ label: "Start a project", href: "/contact" }} secondaryCta={{ label: "See our work", href: "/work" }} />
      <section className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32"><div className="mx-auto max-w-[1680px]"><SectionIntro eyebrow="Why we exist" title="The world moved on. The old agency model did not." body="Fortitudo was built to remove the layers that make digital work slow and hard to understand: vague estimates, hidden progress, handoffs between strangers, and lock-in after launch." />
        <div className="mt-20 grid gap-5 lg:grid-cols-3">{beliefs.map(([title, body], index) => <article key={title} className={`flex min-h-[360px] flex-col justify-between rounded-2xl p-8 ${index === 0 ? "bg-accent text-accent-foreground" : "bg-foreground/[0.04]"}`}><span className="font-mono text-xs tracking-[0.2em] opacity-45">0{index + 1}</span><div><h2 className="text-2xl font-medium tracking-tight">{title}</h2><p className="mt-4 text-sm leading-relaxed opacity-60">{body}</p></div></article>)}</div>
      </div></section>
      <section className="bg-[#0a0a0c] px-6 py-24 text-foreground sm:px-10 lg:py-32"><div className="mx-auto grid max-w-[1680px] grid-cols-12 gap-8 max-[850px]:grid-cols-1"><p className="col-span-4 font-mono text-xs uppercase tracking-[0.2em] text-foreground/45 max-[850px]:col-span-1">The promise</p><p className="col-span-8 text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.95] tracking-tight max-[850px]:col-span-1">We build it. <span className="text-accent">You own it.</span></p></div></section>
      <CtaBand />
    </>
  );
}
