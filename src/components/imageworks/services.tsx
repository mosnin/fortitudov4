import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { PUBLIC_SERVICE_PAGES } from "@/lib/service-pages";
import { ArrowUpRight } from "lucide-react";
export function Services() {
  return (
    <section id="services" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="services-heading"
          title="What does your business need next?"
          description="A place to sell. A product to launch. A workflow that needs to work better. Choose the job and explore what a project can include."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14">
          {PUBLIC_SERVICE_PAGES.map((s, i) => (
            <Reveal key={s.slug} inView delay={i * 0.04}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-muted p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:p-8"
              >
                <span className="flex items-center justify-between">
                  <h3 className="font-sans text-3xl">{s.name}</h3>
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-muted-foreground">
                  {s.directoryLead}
                </p>
                <span className="mt-7 text-sm font-medium">
                  Explore the scope →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
