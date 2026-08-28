import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/shader/page-hero';
import { WORK_PROJECTS, workProject } from '@/lib/work-projects';

export function generateStaticParams() {
  return WORK_PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = workProject(slug);

  if (!project) {
    return { title: 'Our Work — Fortitudo' };
  }

  return {
    title: `${project.name} — Fortitudo`,
    description: project.blurb,
  };
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = workProject(slug);

  if (!project) notFound();

  return (
    <>
      <PageHero
        eyebrow={`Case study · ${project.service}`}
        title={project.name}
        lead={project.blurb}
      />

      <section className="border-t border-foreground/10 bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1680px]">
          <dl className="grid gap-8 border-b border-foreground/10 pb-10 md:grid-cols-3">
            <div>
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.19em] text-foreground/45">
                Engagement
              </dt>
              <dd className="mt-3 text-lg font-medium">{project.service}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.19em] text-foreground/45">
                Website
              </dt>
              <dd className="mt-3">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-lg font-medium underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {project.domain}
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.66rem] uppercase tracking-[0.19em] text-foreground/45">
                Visual
              </dt>
              <dd className="mt-3 text-lg font-medium">{project.imageLabel}</dd>
            </div>
          </dl>

          <figure className="mt-12">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-foreground/[0.04]">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                priority
                sizes="(min-width: 1720px) 1680px, 100vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-start justify-between gap-3 px-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground/45">
              <span>{project.imageLabel}</span>
              {project.imageNote ? (
                <span className="max-w-3xl normal-case tracking-normal">
                  {project.imageNote}
                </span>
              ) : (
                <span>Captured from {project.domain}</span>
              )}
            </figcaption>
          </figure>

          <div className="grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
            <div className="lg:col-span-5">
              <span className="inline-flex rounded-md border border-foreground/10 px-3.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-foreground/55">
                The product
              </span>
              <h2 className="mt-7 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
                What the experience is built to do.
              </h2>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-14">
              <p className="max-w-2xl text-lg leading-relaxed text-foreground/65 sm:text-xl">
                {project.blurb}
              </p>
              <ul className="mt-10 divide-y divide-foreground/10 border-y border-foreground/10">
                {project.details.map((detail, index) => (
                  <li
                    key={detail}
                    className="flex items-start gap-5 py-6 text-base leading-relaxed"
                  >
                    <span className="mt-0.5 font-mono text-[0.65rem] tracking-[0.16em] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-foreground/45">
                This overview uses public information from the client’s own
                website and does not claim unverified performance results.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-accent p-8 text-accent-foreground sm:p-12 lg:flex lg:items-end lg:justify-between lg:gap-12 lg:p-16">
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.19em] opacity-55">
                Build the next one
              </p>
              <h2 className="mt-5 max-w-[12ch] text-[clamp(2.25rem,4.5vw,4.75rem)] font-medium leading-[0.92] tracking-[-0.05em]">
                Your product deserves this much intention.
              </h2>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center rounded-md bg-[#0f0f12] px-5 font-mono text-xs uppercase tracking-[0.15em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f12] focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
              >
                Start a project
              </Link>
              <Link
                href="/work"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#0f0f12]/20 px-5 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:bg-[#0f0f12]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f12]"
              >
                <ArrowLeft className="size-4" aria-hidden />
                All work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
