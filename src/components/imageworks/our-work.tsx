import { ArrowButton } from "@/components/imageworks/arrow-button";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/imageworks/reveal";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { WORK_PROJECTS } from "@/lib/work-projects";
import type { ReactNode } from "react";

const SELECTED_WORK = WORK_PROJECTS.filter((project) =>
  ["stored", "chippi", "plat-bio-labs"].includes(project.slug),
);

export function OurWork(): ReactNode {
  return (
    <section id="our-work" aria-labelledby="our-work-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="our-work-heading"
          title="Selected work."
          description="Software, applied AI and ecommerce. Explore three projects and the businesses behind them."
          aside={
            <ArrowButton href="/work" className="text-sm">View all work</ArrowButton>
          }
        />
        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <ul className="grid gap-x-6 gap-y-10 md:grid-cols-3">
            {SELECTED_WORK.map((project) => (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                    <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-top" />
                  </div>
                  <div className="mt-5 flex flex-col gap-2">
                    <h3 className="text-xl font-medium">{project.name}</h3>
                    <span className="text-xs leading-5 text-muted-foreground sm:text-sm">{project.serviceLabel ?? project.service}</span>
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
