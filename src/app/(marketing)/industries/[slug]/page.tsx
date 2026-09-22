import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRIES, industry } from "@/content/industries";
import { LibraryMotion } from "@/components/imageworks/library-motion";
import {
  DeliveryStack,
  EditorialClose,
  EditorialHero,
  IndustryPriorities,
  RelatedServices,
  RelatedWork,
  ScopeNotes,
} from "@/components/imageworks/expansion";

export function generateStaticParams() {
  return INDUSTRIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = industry(slug);
  if (!item) return { title: "Industry not found | Fortitudo" };
  return {
    title: `${item.label} Digital Agency | Fortitudo`,
    description: item.lead,
    alternates: {
      canonical: `https://www.fortitudo.agency/industries/${item.slug}`,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = industry(slug);
  if (!item) notFound();
  return (
    <LibraryMotion>
      <EditorialHero label={item.label} title={item.title} lead={item.lead} />
      <div className="editorial-fit">
        <span>Built for</span>
        <p>{item.fit}</p>
      </div>
      <IndustryPriorities items={item.priorities} />
      <DeliveryStack steps={item.steps} />
      <ScopeNotes inputs={item.inputs} boundary={item.boundary} />
      <RelatedServices slugs={item.services} />
      <RelatedWork slugs={item.work} />
      <EditorialClose title="Define the operating problem before choosing the build." />
    </LibraryMotion>
  );
}
