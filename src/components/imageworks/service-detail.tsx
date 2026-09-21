import Link from "next/link";
import Image from "next/image";
import { PageIntro } from "./page-intro";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";
import type { ServicePage } from "@/lib/service-pages";
import type { WorkProject } from "@/lib/work-projects";
export function ServiceDetail({
  service: s,
  projects,
}: {
  service: ServicePage;
  projects: WorkProject[];
}) {
  return (
    <>
      <PageIntro label={s.name} title={s.title} lead={s.lead} />
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionHeading
            id="scope-heading"
            title={s.scope.title}
            description={s.scope.body}
          />
          <Reveal inView y={24} className="mt-12 lg:mt-14">
            <div className="grid gap-10 rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:p-10">
              <div>
                <h2 className="font-serif text-3xl">What we can include</h2>
                <ul className="mt-6 space-y-4 text-[15px] leading-7 text-muted-foreground">
                  {s.scope.deliverables.map((x) => (
                    <li key={x} className="border-b border-border pb-4">
                      {x}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/contact?service=${s.serviceId}`}
                  className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background"
                >
                  Discuss this project →
                </Link>
              </div>
              <figure className="relative min-h-[300px] overflow-hidden rounded-xl sm:min-h-[420px]">
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  sizes="(min-width:1024px) 60vw,100vw"
                  className="object-cover object-top"
                />
              </figure>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionHeading
            id="approach-heading"
            title={s.approach.title}
            description={s.approach.body}
          />
          <ol className="mt-12 grid divide-y divide-border rounded-2xl border border-border md:grid-cols-2 md:divide-y-0">
            {s.approach.steps.map((step, i) => (
              <li key={step} className="p-6 sm:p-8">
                <span className="font-serif text-4xl text-accent">
                  0{i + 1}
                </span>
                <p className="mt-5 max-w-md text-lg leading-7">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 max-w-3xl text-[15px] leading-7 text-muted-foreground">
            <h3 className="text-lg font-medium text-foreground">
              Before we quote
            </h3>
            <p className="mt-3">
              We confirm your requirements, existing tools, available content
              and review responsibilities. The proposal sets the scope,
              timeline, revision rounds and price. Third-party costs and ongoing
              support are identified separately. Business outcomes depend on
              factors beyond the build; the agreement defines what we will
              deliver and test.
            </p>
          </div>
        </div>
      </section>
      {projects.length > 0 && (
        <section className="pb-24 sm:pb-32">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
            <SectionHeading
              id="related-heading"
              title={s.proof.title}
              description={s.proof.body}
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {projects.map((p) => (
                <Link
                  href={`/work/${p.slug}`}
                  key={p.slug}
                  className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      sizes="50vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="mt-4 flex justify-between gap-4 text-[15px]">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">
                      View case study →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Faq
        heading="Questions about this service."
        lead="A few details to help you decide what to ask for."
        items={s.faq}
      />
      <FinalCta />
    </>
  );
}
