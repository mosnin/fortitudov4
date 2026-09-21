import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { WORK_PROJECTS, workProject } from "@/lib/work-projects";
import { PageIntro } from "@/components/imageworks/page-intro";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { FinalCta } from "@/components/imageworks/final-cta";
export function generateStaticParams() {
  return WORK_PROJECTS.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = workProject(slug);
  return {
    title: `${p?.name ?? "Our work"} | Fortitudo`,
    description: p?.blurb,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = workProject(slug);
  if (!p) notFound();
  return (
    <>
      <PageIntro label={p.service} title={p.name} lead={p.blurb} />
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5 text-sm">
            <Link href="/work" className="inline-flex min-h-11 items-center">
              ← All work
            </Link>
            <Link
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl bg-foreground px-5 text-background"
            >
              Visit {p.domain} ↗
            </Link>
          </div>
          <figure>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={p.image}
                alt={p.imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {p.imageLabel}
              {p.imageNote
                ? `. ${p.imageNote}`
                : `. Captured from ${p.domain}.`}
            </figcaption>
          </figure>
          <div className="grid gap-12 py-24 lg:grid-cols-2">
            <SectionHeading
              id="project-heading"
              title="The product and its purpose."
              description={p.blurb}
            />
            <div>
              <ul className="divide-y divide-border border-y border-border">
                {p.details.map((x) => (
                  <li className="py-6 text-lg leading-7" key={x}>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
