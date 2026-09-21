import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { WORK_PROJECTS } from "@/lib/work-projects";
const selected = ["stored", "govern"];
export function SelectedWork() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="selected-work-heading"
          title="A closer look at the work."
          description="Explore the products, their purpose and the live experience."
          aside={
            <Link
              href="/work"
              className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            >
              Explore all work →
            </Link>
          }
        />
        <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {selected.map((slug) => {
            const p = WORK_PROJECTS.find((p) => p.slug === slug)!;
            return (
              <article key={slug}>
                <Link
                  href={`/work/${slug}`}
                  className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      sizes="(min-width:768px) 50vw,100vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl tracking-tight">{p.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      View project →
                    </span>
                  </div>
                </Link>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
                  {p.blurb}
                </p>

              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
