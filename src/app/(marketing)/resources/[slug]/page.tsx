import { ArrowButton } from "@/components/imageworks/arrow-button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  SERVICE_CATALOG,
  resourceService,
  servicePdf, servicePreview,
  serviceOffer,
  serviceEnquiry,
} from "@/lib/service-catalog";
import manifest from "@/content/resource-manifest.json";
import { PageIntro } from "@/components/imageworks/page-intro";
import { FinalCta } from "@/components/imageworks/final-cta";
export function generateStaticParams() {
  return SERVICE_CATALOG.map((s) => ({ slug: s.resourceSlug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const s = resourceService((await params).slug);
  if (!s) notFound();
  return {
    title: `${s.name} service pitch — Fortitudo`,
    description: s.lead,
    alternates: { canonical: `/resources/${s.resourceSlug}` },
  };
}
export default async function Resource({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const s = resourceService((await params).slug);
  if (!s) notFound();
  const offer = serviceOffer(s);
  const file = manifest.find((p) => p.slug === s.resourceSlug);
  return (
    <>
      <PageIntro label="Service pitch" title={s.name} lead={s.lead} />
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-4 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <aside className="lg:sticky lg:top-28">
            <div className="relative mx-auto aspect-[16/9] max-w-md overflow-hidden rounded-2xl border border-border bg-muted lg:max-w-[320px]">
              <Image
                src={servicePreview(s)}
                alt={`${s.name} pitch cover`}
                fill
                priority
                sizes="(min-width:1024px) 35vw,100vw"
                className="object-cover object-top"
              />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              PDF
              {file
                ? ` · ${file.pages} pages · ${Math.round(file.bytes / 1024)} KB`
                : ""}{" "}
              · Selectable text and clickable links
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <ArrowButton href={servicePdf(s)} download className="">Download PDF</ArrowButton>
              <a
                href={servicePdf(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4"
              >
                Open PDF ↗
              </a>
            </div>
          </aside>
          <div>
            <Link
              href="/resources"
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground"
            >
              ← All resources
            </Link>
            <h2 className="mt-6 text-3xl tracking-tight">{offer.name}</h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {s.audience}
            </p>
            <p className="mt-4 text-lg leading-8">{offer.summary}</p>
            <h2 className="mt-10 text-2xl">What you receive</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-7 text-muted-foreground">{offer.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
            <h2 className="mt-14 border-b border-border pb-5 text-2xl">
              What the engagement can include
            </h2>
            {s.sections.map((item) => (
              <section key={item.title} className="mt-7">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </section>
            ))}
            <h2 className="mt-14 border-b border-border pb-5 text-2xl">
              Ways to work together
            </h2>
            {s.packages.map((item) => (
              <section key={item.id} className="mt-7">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </section>
            ))}
            <h2 className="mt-14 border-b border-border pb-5 text-2xl">
              Delivery and handover
            </h2>
            <ol className="mt-6 list-decimal space-y-4 pl-5 text-[15px] leading-7 text-muted-foreground">
              {s.process.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h3 className="mt-10 text-xl">What we need to begin</h3>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              {s.inputs}
            </p>
            <h3 className="mt-10 text-xl">Scope and terms</h3>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              {s.boundary}
            </p>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              Optional care and improvement retainers are scoped separately. The
              final proposal confirms deliverables, review rounds, price,
              timeline and third-party costs.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ArrowButton href={serviceEnquiry(s)} className="">{s.cta}</ArrowButton>
              <Link
                href={`/services/${s.slug}`}
                className="text-sm underline underline-offset-4"
              >
                Explore the service
              </Link>
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
