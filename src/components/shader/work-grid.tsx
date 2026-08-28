import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  WORK_PROJECTS,
  type WorkProject,
} from '@/lib/work-projects';

interface WorkGridProps {
  projects?: readonly WorkProject[];
  compact?: boolean;
}

const cardSpan = (index: number) => {
  switch (index % 4) {
    case 0:
      return 'lg:col-span-7';
    case 1:
      return 'lg:col-span-5 lg:pt-24';
    case 2:
      return 'lg:col-span-5';
    default:
      return 'lg:col-span-7 lg:pt-24';
  }
};

export function WorkGrid({
  projects = WORK_PROJECTS,
  compact = false,
}: WorkGridProps) {
  return (
    <section
      aria-label="Fortitudo case studies"
      className={
        compact
          ? 'bg-background px-6 py-20 text-foreground sm:px-10 lg:py-28'
          : 'bg-background px-6 py-24 text-foreground sm:px-10 lg:py-32'
      }
    >
      <div
        className={
          compact
            ? 'mx-auto max-w-[1680px] rounded-[2rem] bg-[#f8cd02] p-6 text-[#0f0f12] sm:p-10 lg:p-14'
            : 'mx-auto max-w-[1680px]'
        }
      >
        {compact ? (
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="inline-flex rounded-md border border-[#0f0f12]/15 px-3.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#0f0f12]/60">
                Selected work
              </span>
              <h2 className="mt-6 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.88] tracking-[-0.055em]">
                Built for the real world.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#0f0f12]/65">
              Eight live brands and products spanning websites, software and AI.
            </p>
          </div>
        ) : null}

        <div
          className={
            compact
              ? 'grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4'
              : 'grid gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-8'
          }
        >
          {projects.map((project, index) => (
            <article
              key={project.slug}
              className={compact ? undefined : cardSpan(index)}
            >
              <Link
                href={`/work/${project.slug}`}
                className={
                  compact
                    ? 'group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f12] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8cd02]'
                    : 'group block rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background'
                }
                aria-label={`Read the ${project.name} case study`}
              >
                <div
                  className={
                    compact
                      ? 'relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-[#0f0f12]/10 bg-[#0f0f12]/5'
                      : 'relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.04]'
                  }
                >
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    priority={index < 2}
                    sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60"
                  />
                  <span
                    className={
                      compact
                        ? 'absolute left-4 top-4 rounded-md bg-[#0f0f12] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white'
                        : 'absolute left-5 top-5 rounded-md bg-[#f8cd02] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#0f0f12]'
                    }
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute bottom-4 right-4 rounded-md bg-white px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#0f0f12]">
                    {project.imageLabel}
                  </span>
                </div>

                <div
                  className={
                    compact
                      ? 'flex items-start justify-between gap-4 px-1 pb-3 pt-4'
                      : 'flex items-start justify-between gap-6 px-1 pb-8 pt-5'
                  }
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2
                        className={
                          compact
                            ? 'text-xl font-medium leading-none tracking-[-0.04em]'
                            : 'text-[clamp(1.5rem,2.4vw,2.5rem)] font-medium leading-none tracking-[-0.04em]'
                        }
                      >
                        {project.name}
                      </h2>
                      <span
                        className={
                          compact
                            ? 'font-mono text-[0.58rem] uppercase tracking-[0.15em] text-[#0f0f12]/45'
                            : 'font-mono text-[0.65rem] uppercase tracking-[0.17em] text-foreground/45'
                        }
                      >
                        {project.service}
                      </span>
                    </div>
                    {compact ? null : (
                      <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-foreground/60">
                        {project.blurb}
                      </p>
                    )}
                  </div>
                  <span
                    className={
                      compact
                        ? 'mt-1 grid size-9 shrink-0 place-items-center rounded-md bg-[#0f0f12] text-white transition-transform duration-300 group-hover:-translate-y-0.5'
                        : 'mt-1 grid size-10 shrink-0 place-items-center rounded-md bg-foreground text-background transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground'
                    }
                  >
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {compact ? (
          <div className="mt-10 border-t border-[#0f0f12]/15 pt-8">
            <Link
              href="/work"
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0f0f12] px-5 font-mono text-xs uppercase tracking-[0.15em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f0f12] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8cd02]"
            >
              Explore all work
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
