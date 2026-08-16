import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { WORK_PROJECTS, workProject } from '@/lib/work-projects';
import { PageHero } from '@/components/marketing/giga/page-hero';
import { Band, PillGhost, PillPrimary, Serif } from '@/components/marketing/giga/primitives';
import {
  BODY,
  BODY_S,
  EYEBROW_TEXT,
  MONO_STYLE,
  SECTION_Y,
  TITLE_S,
} from '@/components/marketing/giga/tokens';

/**
 * /work/[slug] — one case page per client project. Deliberately restrained
 * until the owner supplies imagery and agreed copy: the page states what the
 * client is (in their own site's words), which of the five offerings the
 * engagement was, and where to find them live. No invented outcomes, no
 * numbers nobody agreed to — the same honesty contract as the rest of the
 * logged-out site.
 */

export function generateStaticParams() {
  return WORK_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = workProject(slug);
  if (!project) return { title: 'Our Work — Fortitudo' };
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

  const details: { label: string; value: React.ReactNode }[] = [
    { label: 'Service', value: project.service },
    ...(project.url
      ? [
          {
            label: 'Live site',
            value: (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--fx-white)] underline decoration-[var(--fx-faint)] underline-offset-4 transition-colors hover:decoration-[var(--fx-yellow)]"
              >
                {project.domain}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            ),
          },
        ]
      : []),
    ...(project.locale ? [{ label: 'Where', value: project.locale }] : []),
  ];

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title={project.name}
        lead={project.blurb}
        seed={7}
      />

      <section className={`border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] ${SECTION_Y}`}>
        <Band narrow="max-w-6xl">
          {/* The facts row. */}
          <dl className="grid grid-cols-1 gap-x-10 gap-y-6 border-b border-[var(--fx-hairline)] pb-10 sm:grid-cols-3">
            {details.map((d) => (
              <div key={d.label}>
                <dt style={MONO_STYLE} className={EYEBROW_TEXT}>
                  {d.label}
                </dt>
                <dd className={`mt-2 ${BODY} text-[var(--fx-white)]`}>{d.value}</dd>
              </div>
            ))}
          </dl>

          {/* The artwork band — the same tile the carousel deals. A typographic
              placeholder until real project imagery lands; it carries only the
              name and domain, so nothing in it can read as invented fact. */}
          <div className="mt-12 overflow-hidden rounded-[6px] border border-[var(--fx-hairline)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.art}
              alt={`${project.name} — project artwork`}
              className="w-full"
            />
          </div>
          <p className={`mt-4 ${BODY_S} text-[var(--fx-muted)]`}>
            Full case study — imagery, scope and the story of the build — is on
            its way.
          </p>

          {/* The turn: what a visitor does with this. */}
          <div className="mt-16 border-t border-[var(--fx-hairline)] pt-10">
            <Serif as="h2" className={`${TITLE_S} text-[var(--fx-white)]`}>
              Want something like this?
            </Serif>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PillPrimary href="/contact">Get a price</PillPrimary>
              <PillGhost href="/work">All work</PillGhost>
            </div>
          </div>
        </Band>
      </section>
    </>
  );
}
