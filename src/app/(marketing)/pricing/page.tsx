import type { Metadata } from "next";
import { PageHero } from "@/components/shader/page-hero";
import { Pricing } from "@/components/shader/pricing";
import { CtaBand, SectionIntro } from "@/components/shader/page-sections";

export const metadata: Metadata = { title: "How pricing works — Fortitudo Agency", description: "One fixed price agreed before work starts. No hourly billing and no surprise invoices." };

const steps = [
  ["You tell us what you need", "A short conversation about what you want built, who it is for, and what it needs to do."],
  ["We scope it properly", "We write down the pages, features, integrations, handover, and what is outside the project."],
  ["You approve one price", "Nothing starts until you approve the scope and total. That number holds unless you request new work."],
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title={<>Fixed prices. <span className="text-[#f8cd02]">No surprises.</span></>} lead="Your project gets a real scope and a real price—not a number guessed for a pricing table." cta={{ label: "Get a fixed price", href: "/contact" }} secondaryCta={{ label: "Explore services", href: "/services" }} />
      <Pricing />
      <section className="bg-[#0a0a0c] px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1680px]"><SectionIntro eyebrow="How it works" title="Three steps from idea to an approved scope." body="You get enough detail to make a decision before money changes hands." />
          <div className="mt-16 grid gap-4 lg:grid-cols-3">{steps.map(([title, body], index) => <article key={title} className={`${index === 1 ? "bg-accent text-accent-foreground" : "bg-foreground/[0.05] text-foreground"} min-h-[300px] rounded-2xl p-8 flex flex-col justify-between`}><span className="font-mono text-xs tracking-[0.2em] opacity-45">0{index + 1}</span><div><h2 className="text-2xl font-medium tracking-tight">{title}</h2><p className="mt-3 text-sm leading-relaxed opacity-60">{body}</p></div></article>)}</div>
        </div>
      </section>
      <CtaBand title="Get a price for the actual thing you need." />
    </>
  );
}
