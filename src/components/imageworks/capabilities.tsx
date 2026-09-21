import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SERVICE_CATALOG, serviceOffer } from "@/lib/service-catalog";

// Imageworks Benchmarks composition, adapted to actual services rather than
// importing the source template's fictional render-time and customer metrics.
export function Capabilities() {
  return (
    <section id="services" aria-labelledby="capabilities-heading" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading id="capabilities-heading" title="What would you like to build?" description="A complete launch or a focused piece of work. Explore the outcome, deliverables and handover for each engagement." />
        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <div className="grid gap-10 rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:p-10">
            <div>
              <h3 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.02em]">Design, development<br />and applied AI.</h3>
              <p className="mt-6 max-w-sm text-[15px] leading-7 text-muted-foreground">Bring the idea, the existing product or the problem. We define the work with you and take it through review, launch and handover.</p>
              <Link href="/services" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-foreground px-5 text-[15px] font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">Explore all services <span aria-hidden>→</span></Link>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {SERVICE_CATALOG.filter(s => ["websites", "ecommerce", "software-solutions", "brand", "unslop", "consultation"].includes(s.slug)).map(s => <li key={s.slug} className="border-t border-border py-5"><Link href={`/services/${s.slug}`} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><h4 className="flex items-center justify-between gap-3 text-lg font-medium">{s.name}<span aria-hidden className="text-muted-foreground transition-transform group-hover:translate-x-1">↗</span></h4><p className="mt-2 text-[15px] leading-6 text-muted-foreground">{serviceOffer(s).summary}</p></Link></li>)}
            </ul>
          </div>
        </Reveal>
        <Reveal inView y={24} className="mt-4 md:mt-5">
          <div className="rounded-2xl border border-border p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><h3 className="text-2xl leading-tight tracking-tight sm:text-3xl">Agents, tools and the systems behind them.</h3><Link href="/services#ai-capabilities" className="inline-flex min-h-11 shrink-0 items-center text-sm underline underline-offset-4">Explore AI engineering →</Link></div>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-1">{SERVICE_CATALOG.filter(s => !["websites", "ecommerce", "software-solutions", "brand", "unslop", "consultation"].includes(s.slug)).map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="inline-flex min-h-11 items-center text-[15px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{s.name}</Link></li>)}</ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
