import Link from "next/link";
import { Reveal } from "@/components/imageworks/reveal";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { WORK_PROJECTS } from "@/lib/work-projects";
import Image from "next/image";
import type { ReactNode } from "react";

const FRAMES = WORK_PROJECTS.map((p) => ({
  ...p,
  ratio: p.serviceLabel ?? p.service,
  grow: "",
  aspect: "aspect-[16/10]",
  position: "object-top",
}));

export function Portfolio(): ReactNode {
  return (
    <section aria-labelledby="formats-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="formats-heading"
          title="Explore the portfolio."
          description="Explore our work across ecommerce, software and AI. See what each product does and how it came together."
        />

        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {FRAMES.map((f) => (
              <li key={f.name} className={`min-w-0 flex-none ${f.grow}`}>
                <Link
                  href={`/work/${f.slug}`}
                  className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <figure className="group flex flex-col">
                    <div
                      className={`relative isolate w-full [transform:translateZ(0)] overflow-hidden rounded-2xl bg-muted  ${f.aspect}`}
                    >
                      <Image
                        src={f.image}
                        alt={f.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className={`object-cover object-top`}
                      />
                    </div>
                    <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-[15px]">
                      <span className="font-medium">{f.name}</span>
                      <span className="max-w-[55%] text-right text-xs leading-5 text-muted-foreground sm:text-sm">
                        {f.ratio}
                      </span>
                    </figcaption>
                  </figure>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
