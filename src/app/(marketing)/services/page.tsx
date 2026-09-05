import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";
import { CtaBand, SectionIntro } from "@/components/shader/page-sections";
import { PageHero } from "@/components/shader/page-hero";
import { services } from "@/lib/services";
import { getServicePageById, SERVICE_PAGE_HREFS } from "@/lib/service-pages";

export const metadata: Metadata = {
  title: "Services — Fortitudo Agency",
  description: "Explore websites, software, AI solutions, consultation, and digital marketing. Find the right next step for your business, with a clear scope and experienced people behind it.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title={<>What is your business <span className="text-[#f8cd02]">ready for?</span></>} lead="A website that does the business justice. Software that takes the work off your plate. A clear plan for what comes next. Explore how we can help." cta={{ label: "Talk through your project", href: "/contact" }} secondaryCta={{ label: "See our work", href: "/work" }} />
      <section className="bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1680px]"><SectionIntro eyebrow="How we help" title="Find the work that moves your business forward." body="Each service has a different job to do. Explore the approach, what we can take care of, and related work before we talk through your project." /></div>
        <div className="mx-auto mt-20 max-w-[1680px] space-y-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            const detail = getServicePageById(service.id);
            return (
              <article key={service.id} id={service.id.replaceAll("_", "-")} className={`scroll-mt-28 overflow-hidden rounded-2xl border border-foreground/10 ${index === 0 ? "bg-accent text-accent-foreground" : "bg-foreground/[0.035]"}`}>
                <div className="grid grid-cols-12 gap-8 p-8 sm:p-10 lg:p-14 max-[850px]:grid-cols-1">
                  <div className="col-span-5 max-[850px]:col-span-1">
                    <div className="flex items-center justify-between">
                      <Icon size={52} strokeWidth={0.8} aria-hidden />
                      <span className={`font-mono text-xs tracking-[0.2em] ${index === 0 ? "text-accent-foreground/45" : "text-foreground/40"}`}>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="mt-20 text-[clamp(2.3rem,4vw,4.5rem)] font-medium leading-[0.9] tracking-tight max-[850px]:mt-12">{service.name}</h2>
                    <p className={`mt-5 max-w-lg text-lg leading-snug ${index === 0 ? "text-accent-foreground/75" : "text-foreground/75"}`}>{detail?.directoryLead ?? service.description}</p>
                  </div>
                  <div className="col-span-5 col-start-8 flex flex-col justify-between max-[850px]:col-span-1 max-[850px]:col-start-1">
                    <ul className={`border-t ${index === 0 ? "border-accent-foreground/15" : "border-foreground/10"}`}>
                      {service.features.map((feature) => <li key={feature} className={`flex items-center gap-3 border-b py-4 text-sm ${index === 0 ? "border-accent-foreground/15" : "border-foreground/10"}`}><Check size={16} strokeWidth={1.7} aria-hidden />{feature}</li>)}
                    </ul>
                    <div className="mt-10 flex flex-wrap gap-2">
                      <Link href={SERVICE_PAGE_HREFS[service.id]} className="inline-flex items-stretch gap-1"><span className={`rounded-md px-5 py-3 text-xs font-medium uppercase tracking-widest ${index === 0 ? "bg-accent-foreground text-accent" : "bg-foreground text-background"}`}>Explore {service.name}</span><ArrowChip className={index === 0 ? "bg-accent-foreground text-accent" : "bg-foreground text-background"} /></Link>
                      <Link href="/contact" className={`inline-flex min-h-11 items-center rounded-md border px-5 text-xs font-medium uppercase tracking-widest ${index === 0 ? "border-accent-foreground/20" : "border-foreground/15"}`}>Ask a question</Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <CtaBand title="Let’s work out what comes first." body="Tell us what you are trying to change. We will help you choose the right starting point and put a clear scope and price around it." />
    </>
  );
}
