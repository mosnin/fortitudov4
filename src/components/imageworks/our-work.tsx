import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/imageworks/reveal";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { WORK_PROJECTS } from "@/lib/work-projects";
import type { ReactNode } from "react";

const SELECTED_WORK = WORK_PROJECTS.filter((project) =>
  ["stored", "chippi"].includes(project.slug),
);

export function OurWork(): ReactNode {
  return (
    <section id="our-work" aria-labelledby="our-work-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="our-work-heading"
          title="Our work."
          description="Explore the software and AI products we have worked on."
          aside={
            <Link href="/work" className="inline-flex min-h-11 items-center gap-3 rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              View all work <span aria-hidden="true">↗</span>
            </Link>
          }
        />
        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
            {SELECTED_WORK.map((project) => (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="text-xl font-medium">{project.name}</h3>
                    <span className="text-sm text-muted-foreground">{project.service}</span>
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{project.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
