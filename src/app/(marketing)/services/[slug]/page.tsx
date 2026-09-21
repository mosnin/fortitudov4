import type { Metadata } from "next";
import { SpecialistDetail } from "@/components/imageworks/specialist-detail";
import { AI_SPECIALIST_SLUGS } from "@/components/imageworks/ai-offers";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/imageworks/service-detail";
import {
  catalogService,
  SERVICE_CATALOG,
} from "@/lib/service-catalog";
export function generateStaticParams() {
  return SERVICE_CATALOG.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const s = catalogService((await params).slug);
  if (!s) notFound();
  return {
    title: `${s.name} — Fortitudo Agency`,
    description: s.lead,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: {
      title: `${s.name} — Fortitudo`,
      description: s.lead,
    },
  };
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const s = catalogService((await params).slug);
  if (!s) notFound();
  return AI_SPECIALIST_SLUGS.includes(s.slug) ? <SpecialistDetail service={s}/> : <ServiceDetail service={s} />;
}
