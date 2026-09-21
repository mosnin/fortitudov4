import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { AiOffers, AI_SPECIALIST_SLUGS } from "./ai-offers";
import { Reveal } from "./reveal";
import { SERVICE_CATALOG, serviceOffer, servicePdf } from "@/lib/service-catalog";

export function Services({ featured = false }: { featured?: boolean }) {
  const core = SERVICE_CATALOG.filter(s => !AI_SPECIALIST_SLUGS.includes(s.slug));
  const main = featured ? core.slice(0, 4) : core;
  return (
    <> <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading id="services-heading" title={featured ? "What do you want to build?" : "The engagements."} description="Choose a complete build or a focused piece of work. Each engagement has a clear deliverable, review process and handover." aside={featured ? <Link href="/services" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">All services →</Link> : undefined} />
        <div className="mt-10 border-t border-border sm:mt-14">
          {main.map((s, i) => {
            const offer = serviceOffer(s);
            return <Reveal key={s.slug} inView>
              <article className="grid gap-5 border-b border-border py-8 sm:py-10 md:grid-cols-[.7fr_1.1fr_1.2fr] md:gap-10">
                <p className="text-sm text-muted-foreground"><span className="mr-4 tabular-nums">0{i + 1}</span>{s.name}</p>
                <div><Link href={`/services/${s.slug}`} className="group inline-flex items-start gap-4 text-2xl leading-tight tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-3xl"><h3>{offer.name}</h3><span aria-hidden className="text-lg text-muted-foreground">↗</span></Link><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{offer.fit}</p></div>
                <div><p className="max-w-lg text-base leading-7">{offer.summary}</p><div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm"><Link href={`/services/${s.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4">Explore the offer →</Link><a href={servicePdf(s)} download className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-4" aria-label={`Download the ${s.name} service pitch PDF`}>Download pitch ↓</a></div></div>
              </article>
            </Reveal>;
          })}
        </div>
        {featured && <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-8"><p className="inline-flex min-h-11 items-center text-sm text-muted-foreground">Also work with us on</p>{core.slice(4).map(s => <Link key={s.slug} href={`/services/${s.slug}`} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">{s.name} ↗</Link>)}</div>}
      </div>
    </section><AiOffers/> </>
  );
}
