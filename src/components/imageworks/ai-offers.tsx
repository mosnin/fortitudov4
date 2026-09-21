import Link from "next/link";
import { SERVICE_CATALOG, serviceOffer } from "@/lib/service-catalog";
import { SectionHeading } from "./section-heading";
export const AI_SPECIALIST_SLUGS = ["agent-teams", "agent-infrastructure", "jev-implementation", "context-and-memory", "mcp-and-api", "creative-ai-workflows", "ai-setup-and-consulting"];
export function AiOffers() {
  const entries = SERVICE_CATALOG.filter(s => AI_SPECIALIST_SLUGS.includes(s.slug));
  return <section id="ai-capabilities" className="scroll-mt-28 border-y border-border bg-muted/30 py-20 sm:py-28"><div className="mx-auto max-w-[1440px] px-4 sm:px-6">
    <p className="mb-5 text-sm text-muted-foreground">AI engineering · Dedicated engagements</p>
    <SectionHeading id="ai-offers-heading" title="The agents. The infrastructure. The connections." description="Commission a complete system or the part you need. These are separate implementation offers, each with its own deliverables and service pitch." />
    <div className="mt-12 grid gap-x-12 md:grid-cols-2">{entries.map((s,i)=><article key={s.slug} className="border-t border-border py-7"><Link href={`/services/${s.slug}`} className="flex min-h-11 items-start justify-between gap-6 text-2xl tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><h3>{s.name}</h3><span aria-hidden className="text-muted-foreground">↗</span></Link><p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">{serviceOffer(s).summary}</p><p className="mt-4 text-xs text-muted-foreground">{String(i+1).padStart(2,"0")} / {serviceOffer(s).name}</p></article>)}</div>
    <p className="mt-10 max-w-2xl text-base leading-7">An anti-slop agency. The output has to do the job, fit your business and stand up to review. <Link href="/services/unslop" className="underline underline-offset-4">Already have something that falls short? We can Unslop it.</Link></p>
  </div></section>;
}
