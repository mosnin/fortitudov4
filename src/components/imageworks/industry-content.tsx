import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Industry } from "@/content/industries";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { workProject } from "@/lib/work-projects";
import { Reveal } from "@/components/imageworks/reveal";
import { SectionHeading } from "@/components/imageworks/section-heading";

const sectionClass = "mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32";

export function IndustryDirectory({ industries }: { industries: Industry[] }) {
  return (
    <section className={sectionClass} aria-labelledby="industry-directory-heading">
      <SectionHeading
        id="industry-directory-heading"
        title="Start with the environment your team operates in."
        description="Each industry page explains the operating priorities, delivery sequence, inputs and boundaries that shape the work."
      />
      <Reveal inView delay={0.1}>
        <div className="mt-14 border-t border-border sm:mt-16">
          {industries.map((item) => (
            <Link
              key={item.slug}
              href={`/industries/${item.slug}`}
              className="group grid gap-3 border-b border-border py-7 sm:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)_auto] sm:items-start sm:gap-8 sm:py-9"
            >
              <h3 className="font-sans text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">
                {item.label}
              </h3>
              <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                {item.fit}
              </p>
              <ArrowUpRight
                className="hidden h-5 w-5 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export function IndustryDetails({ item }: { item: Industry }) {
  const projects = item.work
    .map(workProject)
    .filter((project) => project !== undefined);
  const services = item.services
    .map((slug) => SERVICE_CATALOG.find((service) => service.slug === slug))
    .filter((service) => service !== undefined);

  return (
    <>
      <section className={sectionClass} aria-labelledby="industry-fit-heading">
        <SectionHeading
          id="industry-fit-heading"
          title="Built around the operating context."
          description={item.fit}
        />
        <div className="mt-14 border-t border-border sm:mt-16">
          {item.priorities.map((priority, index) => (
            <Reveal inView delay={index * 0.06} key={priority.title}>
              <article className="grid gap-3 border-b border-border py-7 sm:grid-cols-[3rem_minmax(12rem,0.8fr)_minmax(0,1.2fr)] sm:gap-8 sm:py-9">
                <span className="text-sm text-muted-foreground">0{index + 1}</span>
                <h3 className="font-sans text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">
                  {priority.title}
                </h3>
                <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                  {priority.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-foreground/[0.025]">
        <div className={sectionClass}>
          <SectionHeading
            id="industry-delivery-heading"
            title="How the work moves."
            description="A defined sequence from the operating journey through implementation and review."
          />
          <div className="mt-14 grid border-t border-border lg:grid-cols-3 sm:mt-16">
            {item.steps.map((step, index) => (
              <Reveal inView delay={index * 0.06} key={step.title}>
                <article className="h-full border-b border-border py-8 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <span className="text-sm text-muted-foreground">0{index + 1}</span>
                  <h3 className="mt-5 font-sans text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 text-[15px] leading-7 text-muted-foreground">
                    {step.body}
                  </p>
                  <ul className="mt-7 border-t border-border text-[14px] leading-6">
                    {step.items.map((detail) => (
                      <li className="border-b border-border py-3" key={detail}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby="industry-scope-heading">
        <SectionHeading
          id="industry-scope-heading"
          title="Clear inputs. Clear boundaries."
          description="The proposal records what we need, what we will deliver and where accountable decisions remain."
        />
        <div className="mt-14 grid border-t border-border md:grid-cols-2 sm:mt-16">
          <article className="border-b border-border py-8 md:border-r md:pr-10">
            <p className="text-sm font-medium">Before we begin</p>
            <h3 className="mt-5 font-sans text-2xl tracking-[-0.02em] sm:text-3xl">Bring what you have.</h3>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">{item.inputs}</p>
          </article>
          <article className="border-b border-border py-8 md:pl-10">
            <p className="text-sm font-medium">A clear agreement</p>
            <h3 className="mt-5 font-sans text-2xl tracking-[-0.02em] sm:text-3xl">Know the boundaries.</h3>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">{item.boundary}</p>
          </article>
        </div>
      </section>

      <section className="border-y border-border">
        <div className={sectionClass}>
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading id="related-services-heading" title="Related services." />
              <div className="mt-10 border-t border-border">
                {services.map((service) => (
                  <Link className="group flex items-center justify-between gap-4 border-b border-border py-5 text-[17px] font-medium" href={`/services/${service.slug}`} key={service.slug}>
                    {service.name}
                    <ArrowUpRight className="h-4 w-4 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading id="related-work-heading" title="Relevant work." />
              <div className="mt-10 border-t border-border">
                {projects.map((project) => (
                  <Link className="group block border-b border-border py-5" href={`/work/${project.slug}`} key={project.slug}>
                    <span className="flex items-center justify-between gap-4 text-[17px] font-medium">
                      {project.name}
                      <ArrowUpRight className="h-4 w-4 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </span>
                    <span className="mt-2 block max-w-xl text-sm leading-6 text-muted-foreground">{project.blurb}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
