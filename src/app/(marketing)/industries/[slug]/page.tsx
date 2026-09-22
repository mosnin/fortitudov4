import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRIES, industry } from "@/content/industries";
import { PageIntro } from "@/components/imageworks/page-intro";
import { FinalCta } from "@/components/imageworks/final-cta";
import { IndustryDetails } from "@/components/imageworks/industry-content";

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
    <>
      <PageIntro label={item.label} title={item.title} lead={item.lead} />
      <IndustryDetails item={item} />
      <FinalCta />
    </>
  );
}
